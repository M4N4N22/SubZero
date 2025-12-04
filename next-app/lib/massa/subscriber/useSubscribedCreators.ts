"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getUserSubscribedPlans,
  SubscribedPlan,
} from "./getUserSubscribedPlans";
import { getCreatorProfileByAddress } from "./getCreatorProfileByAddress";

export interface SubscribedCreator {
  creator: string;
  plans: SubscribedPlan[];
  profile: {
    cid: string | null;
    name: string | null;
    bio: string | null;
    avatar: string | null;
    socials?: any;
    createdAt?: string | null;
  } | null;
}

export function useSubscribedCreators() {
  const [creators, setCreators] = useState<SubscribedCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const refresh = useCallback(() => {
    setRefreshFlag((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const plans = await getUserSubscribedPlans();

        if (!plans.length) {
          if (!cancelled) setCreators([]);
          return;
        }

        // Group plans by creator
        const grouped = new Map<string, SubscribedPlan[]>();

        for (const plan of plans) {
          if (typeof plan.creator !== "string") continue;

          const creator = plan.creator.toLowerCase();
          const existing = grouped.get(creator) ?? [];
          existing.push(plan);
          grouped.set(creator, existing);
        }

        const entries = Array.from(grouped.entries());

        // Fetch creator profiles
        const output: SubscribedCreator[] = await Promise.all(
          entries.map(async ([creatorAddress, creatorPlans]) => {
            const res = await getCreatorProfileByAddress(creatorAddress);

            const profile = res?.metadata
              ? {
                  cid: res.cid ?? null,
                  name: res.metadata.name ?? null,
                  bio: res.metadata.bio ?? null,
                  avatar: res.metadata.avatar ?? null,
                  socials: res.metadata.socials ?? null,
                  createdAt: res.metadata.createdAt ?? null,
                }
              : null;

            return {
              creator: creatorAddress,
              plans: creatorPlans,
              profile,
            };
          })
        );

        if (!cancelled) setCreators(output);
      } catch (err: any) {
        console.error("Failed to fetch subscribed creators:", err);
        if (!cancelled) {
          setError(err.message || "Failed to load subscribed creators");
          setCreators([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [refreshFlag]);
  return { creators, loading, error, refresh };
}
