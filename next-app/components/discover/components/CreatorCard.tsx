"use client";

import { useEffect, useState } from "react";
import { SmartContract, Args } from "@massalabs/massa-web3";
import { getWallets } from "@massalabs/wallet-provider";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CreatorProfileMini from "./CreatorProfileMini";
import CreatorPostsPreview from "./CreatorPostsPreview";
import { Loader2 } from "lucide-react";

interface CreatorCardProps {
  address: string;
  refresh?: boolean;
}

interface CreatorProfileData {
  name: string;
  avatar: string;
  bio: string;
  socials?: {
    x?: string;
    discord?: string;
    telegram?: string;
    instagram?: string;
  };
  activeSubs: number;
  posts: {
    title: string;
    media: string;
    type: string;
  }[];
  subscribed: boolean;
  createdAt?: string;
}

export default function CreatorCard({ address, refresh }: CreatorCardProps) {
  const [data, setData] = useState<CreatorProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // --- 1️⃣ Connect to Bearby Wallet ---
        const wallets = await getWallets();
        if (!wallets.length) throw new Error("No wallets found");

        const wallet = wallets[0];
        await wallet.connect();
        const accounts = await wallet.accounts();
        const provider = accounts[0];
        const userAddress = provider.address.toLowerCase();

        console.log("🔗 Connected wallet:", userAddress);

        // --- 2️⃣ Initialize Profile Contract (latest one) ---
        const profileContract = new SmartContract(
          provider,
          "AS1g86F28S7N8GQ33oysd8wm6SSmNMyZxhgLJVybxLc44bM9Bvqw"
        );

        // --- 3️⃣ Fetch creator profile CID from contract ---
        const cidResult = await profileContract.read(
          "getCreatorProfile",
          new Args().addString(address),
          { maxGas: BigInt(300_000_000) }
        );

        const profileCID = new TextDecoder()
          .decode(cidResult?.value || new Uint8Array())
          .trim();

        if (!profileCID || profileCID.length < 10) {
          console.warn("⚠️ No valid profile CID found for:", address);
          setData(null);
          return;
        }

        console.log("📦 Found profile CID:", profileCID);

        // --- 4️⃣ Fetch IPFS metadata (no-cache) ---
        const metaRes = await fetch(
          `/api/fetch-ipfs-metadata?cid=${encodeURIComponent(profileCID)}${
            refresh ? "&refresh=true" : ""
          }`
        );

        if (!metaRes.ok) throw new Error("Failed to fetch IPFS metadata");
        const meta = await metaRes.json();
        console.log("🌐 Loaded metadata:", meta);

        // --- 5️⃣ Fetch posts (if any) ---
        const postsContract = new SmartContract(
          provider,
          "AS1g86F28S7N8GQ33oysd8wm6SSmNMyZxhgLJVybxLc44bM9Bvqw"
        );

        const contentRes = await postsContract.read(
          "getCreatorContents",
          new Args().addString(address)
        );

        const contentString = new TextDecoder()
          .decode(contentRes?.value || new Uint8Array())
          .trim();

        const posts: CreatorProfileData["posts"] = [];

        if (contentString) {
          const cids = contentString.split(";").filter(Boolean);
          for (const cid of cids.slice(0, 3)) {
            try {
              const mRes = await fetch(
                `/api/fetch-ipfs-metadata?cid=${cid}${
                  refresh ? "&refresh=true" : ""
                }`
              );
              const m = await mRes.json();
              posts.push({
                title: m.title,
                media: m.media,
                type: m.type,
              });
            } catch (err) {
              console.warn("Error fetching post metadata for CID", cid, err);
            }
          }
        }

        // --- 6️⃣ Fetch active subscribers (corrected for creator) ---
        let activeSubs = 0;
        try {
          const subsContract = new SmartContract(
            provider,
            "AS1g86F28S7N8GQ33oysd8wm6SSmNMyZxhgLJVybxLc44bM9Bvqw" // subscription contract
          );

          // 1️⃣ Fetch all plans created by this address
          const plansRes = await subsContract.read(
            "getPlansByCreator",
            new Args().addString(address),
            { maxGas: BigInt(500_000_000) }
          );

          // Decode to readable string
          const decoded = new TextDecoder()
            .decode(plansRes?.value || new Uint8Array())
            .trim();

          // No plans? -> 0 subscribers
          if (!decoded) {
            console.log("📭 No plans found for creator", address);
          } else {
            // getPlansByCreator encodes values using Args, not a plain "|" string,
            // so let’s decode properly using Args API.
            const args = new Args(plansRes.value);
            const planIds: string[] = [];

            try {
              while (true) {
                const planId = args.nextString(); // planId
                args.nextString(); // planName
                args.nextString(); // frequency
                args.nextU32(); // placeholder
                args.nextString(); // amount
                planIds.push(planId);
              }
            } catch (err) {
              console.warn("Partial decode of plans:", err);
            }

            console.log("🧩 Creator plans:", planIds);

            // 2️⃣ Parallel fetch subscriber lists for each plan
            const subscriberCounts = await Promise.all(
              planIds.map(async (planId) => {
                try {
                  const subsRes = await subsContract.read(
                    "getSubscribers",
                    new Args().addString(planId),
                    { maxGas: BigInt(300_000_000) }
                  );

                  const subsString = new TextDecoder()
                    .decode(subsRes?.value || new Uint8Array())
                    .trim();

                  if (!subsString) return 0;

                  const subsList = subsString
                    .split("|")
                    .map((s) => s.trim())
                    .filter(Boolean);

                  return subsList.length;
                } catch (err) {
                  console.warn(
                    `Error reading subscribers for plan ${planId}:`,
                    err
                  );
                  return 0;
                }
              })
            );

            // 3️⃣ Sum up all subscriber counts
            activeSubs = subscriberCounts.reduce((sum, c) => sum + c, 0);
          }

          console.log("📊 Active subscribers:", activeSubs);
        } catch (err) {
          console.warn("⚠️ Error fetching active subscriber count:", err);
        }

        // --- 7️⃣ Update component state ---
        setData({
          name: meta.name || "Unnamed Creator",
          avatar: meta.avatar?.replace("ipfs://", "") || "",
          bio: meta.bio || "",
          socials: meta.socials || {},
          activeSubs,
          posts,
          subscribed: false,
          createdAt: meta.createdAt || new Date().toISOString(),
        });
      } catch (err) {
        console.error("❌ Error loading creator data:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [address, refresh]);

  // --- 🧭 Render states ---
  if (loading)
    return (
      <CardContent className="p-8 flex items-center justify-center text-muted-foreground">
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </CardContent>
    );

  if (!data)
    return (
      <CardContent className="p-6 text-center text-muted-foreground">
        Failed to load creator data.
      </CardContent>
    );

  // --- 🎨 Final Render ---
  return (
    <CardContent className="p-3 flex flex-col gap-4">
      <CreatorProfileMini
        name={data.name}
        avatar={data.avatar}
        bio={data.bio}
        address={address}
        activeSubs={data.activeSubs}
        socials={data.socials}
      />
      <div className="bg-muted p-4 rounded-3xl border ">
        <span className="text-xs text-foreground/70 ">
          Latest Posts by{" "}
          <span className="font-medium text-foreground">{data.name}</span>
        </span>
        <CreatorPostsPreview posts={data.posts} />
      </div>
    </CardContent>
  );
}
