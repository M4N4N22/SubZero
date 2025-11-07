"use client";

import { useEffect, useState } from "react";
import { web3 } from "@hicaru/bearby.js";
import { Args } from "@massalabs/massa-web3";
import { toast } from "sonner";

export type SubscriberEntry = {
  wallet: string;
  joinedAt: string;
  paused: boolean;
  planId: string;
  planName: string;
  amount: string;
};

export type PlanInsight = {
  planId: string;
  planName: string;
  price: number;
  subscribers: number;
  activeSubscribers: number;
  revenue: number;
};

export type CreatorInsights = {
  overview: {
    totalSubscribers: number;
    activeSubscribers: number;
    totalRevenue: number;
  };
  plans: PlanInsight[];
  subscribers: SubscriberEntry[];
  earningsGraph: { date: string; revenue: number }[];
};

const CONTRACT_ADDR = "AS1g86F28S7N8GQ33oysd8wm6SSmNMyZxhgLJVybxLc44bM9Bvqw";

/** Helper to decode string from contract bytes */
function decodeString(bytes: number[]) {
  try {
    const str = new TextDecoder().decode(Uint8Array.from(bytes)).trim();
    return str;
  } catch (err) {
    console.error("[decodeString] Failed to decode bytes:", bytes, err);
    return "";
  }
}

/** Helper to safely parse JSON from SC */
function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function useCreatorInsights(creatorAddress?: string) {
  const [insights, setInsights] = useState<CreatorInsights | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!creatorAddress) return;
    loadInsights(creatorAddress);
  }, [creatorAddress]);

  const loadInsights = async (creator: string) => {
    try {
      setLoading(true);
      toast.info("Fetching creator insights...");
      if (!web3.wallet.connected) throw new Error("Wallet not connected");

      const address = creator.toLowerCase();
      console.group(`[CreatorInsights] Fetching insights for ${address}`);

      // --- 1️⃣ Fetch all plans by creator ---
      const planResp = await web3.contract.readSmartContract({
        targetAddress: CONTRACT_ADDR,
        targetFunction: "getPlansByCreator",
        parameter: [{ type: web3.contract.types.STRING, value: address }],
        maxGas: 3_000_000,
      });

      console.log("[SC:getPlansByCreator] Raw Response:", planResp);

      const plansBuffer = planResp?.[0]?.result?.[0]?.result?.Ok;
      if (!plansBuffer) {
        console.warn("[SC:getPlansByCreator] No plan data returned.");
        throw new Error("No plans found");
      }

      console.log("[SC:getPlansByCreator] Raw Buffer:", plansBuffer);

      const args = new Args(Uint8Array.from(plansBuffer));
      const plans: PlanInsight[] = [];
      let planIndex = 0;

      while (true) {
        try {
          const planId = args.nextString();
          const planName = args.nextString();
          const frequency = args.nextString();
          args.nextU32();
          const amount = args.nextString();

          console.log(`[Plan#${planIndex}] ID=${planId}, Name=${planName}, Freq=${frequency}, Price=${amount}`);
          plans.push({
            planId,
            planName,
            price: parseFloat(amount) || 0,
            subscribers: 0,
            activeSubscribers: 0,
            revenue: 0,
          });
          planIndex++;
        } catch {
          console.log(`[SC:getPlansByCreator] Finished decoding ${planIndex} plans`);
          break;
        }
      }

      // --- 2️⃣ For each plan, fetch subscribers ---
      let totalSubs = 0;
      let totalActive = 0;
      let totalRevenue = 0;
      const subscribers: SubscriberEntry[] = [];

      for (const plan of plans) {
        console.group(`[Plan] ${plan.planName} (${plan.planId})`);
        const subsResp = await web3.contract.readSmartContract({
          targetAddress: CONTRACT_ADDR,
          targetFunction: "getSubscribers",
          parameter: [{ type: web3.contract.types.STRING, value: plan.planId }],
          maxGas: 3_000_000
        });

        console.log("[SC:getSubscribers] Raw Response:", subsResp);

        const subsRaw = decodeString(subsResp?.[0]?.result?.[0]?.result?.Ok || []);
        console.log("[SC:getSubscribers] Decoded String:", subsRaw);

        const subList =
        typeof subsRaw === "string" && subsRaw.length
          ? subsRaw.split(/[|,]/).map((s) => s.trim()).filter(Boolean)
          : [];

        console.log(`[SC:getSubscribers] Parsed Subscribers (${subList.length}):`, subList);

        plan.subscribers = subList.length;
        totalSubs += subList.length;

        // --- Get active subscribers and timestamps ---
        let activeCount = 0;
        for (const user of subList) {
          console.group(`[Subscriber] ${user}`);

          const pausedResp = await web3.contract.readSmartContract({
            targetAddress: CONTRACT_ADDR,
            targetFunction: "isPaused",
            parameter: [
              { type: web3.contract.types.STRING, value: plan.planId },
              { type: web3.contract.types.STRING, value: user },
            ],
            maxGas: 3_000_000
          });

          console.log("[SC:isPaused] Raw:", pausedResp);
          const pausedStr = decodeString(
            pausedResp?.[0]?.result?.[0]?.result?.Ok || []
          );
          const paused = pausedStr === "true";
          console.log(`[SC:isPaused] Decoded: ${pausedStr} → ${paused}`);

          if (!paused) activeCount++;

          const tsResp = await web3.contract.readSmartContract({
            targetAddress: CONTRACT_ADDR,
            targetFunction: "getSubscriberTimestamp",
            parameter: [
              { type: web3.contract.types.STRING, value: plan.planId },
              { type: web3.contract.types.STRING, value: user },
            ],
            maxGas: 3_000_000
          });

          console.log("[SC:getSubscriberTimestamp] Raw:", tsResp);
          const tsStr = decodeString(tsResp?.[0]?.result?.[0]?.result?.Ok || []);
          console.log(`[SC:getSubscriberTimestamp] Decoded: ${tsStr}`);

          const joinedAt = tsStr ? new Date(parseInt(tsStr)).toISOString() : "";

          subscribers.push({
            wallet: user,
            joinedAt,
            paused,
            planId: plan.planId,
            planName: plan.planName,
            amount: plan.price.toString(),
          });

          console.groupEnd();
        }

        plan.activeSubscribers = activeCount;
        plan.revenue = activeCount * plan.price;
        totalActive += activeCount;
        totalRevenue += plan.revenue;

        console.log(`[Plan Summary] ${plan.planName}: ${activeCount}/${plan.subscribers} active, ${plan.revenue} MAS`);
        console.groupEnd();
      }

      // --- 3️⃣ Build earnings graph ---
      const earningsMap = new Map<string, number>();
      for (const sub of subscribers) {
        if (!sub.joinedAt) continue;
        const day = sub.joinedAt.split("T")[0];
        earningsMap.set(day, (earningsMap.get(day) || 0) + parseFloat(sub.amount));
      }

      const earningsGraph = Array.from(earningsMap.entries()).map(
        ([date, revenue]) => ({ date, revenue })
      );

      // --- 4️⃣ Overview Summary ---
      const overview = {
        totalSubscribers: totalSubs,
        activeSubscribers: totalActive,
        totalRevenue,
      };

      console.log("[Final Overview]", overview);
      console.log("[Plans]", plans);
      console.log("[Subscribers]", subscribers);
      console.log("[Earnings Graph]", earningsGraph);
      console.groupEnd();

      setInsights({
        overview,
        plans,
        subscribers,
        earningsGraph,
      });

      toast.success("Creator insights loaded");
    } catch (err: any) {
      console.error("[useCreatorInsights] Error:", err);
      toast.error("Failed to fetch insights");
      setInsights(null);
    } finally {
      setLoading(false);
    }
  };

  return { insights, loading, reload: loadInsights };
}
