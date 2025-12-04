// lib/massa/useSubscribedFeed.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { getUserSubscribedPlans, SubscribedPlan } from "./getUserSubscribedPlans";
import { getCreatorPosts } from "../getCreatorPosts";

export type CreatorFeed = {
  creator: string;
  plans: SubscribedPlan[];
  posts: string[]; // list of CIDs
};

export function useSubscribedFeed() {
  const [feeds, setFeeds] = useState<CreatorFeed[]>([]);
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
          if (!cancelled) {
            setFeeds([]);
          }
          return;
        }

        // Group plans by creator
        const byCreator = new Map<string, SubscribedPlan[]>();

        for (const plan of plans) {
          if (!plan.creator) continue;
          const key = plan.creator.toLowerCase();
          const existing = byCreator.get(key) ?? [];
          existing.push(plan);
          byCreator.set(key, existing);
        }

        const entries = Array.from(byCreator.entries());

        // For each creator, fetch their posts
        const creatorFeeds: CreatorFeed[] = await Promise.all(
          entries.map(async ([creator, creatorPlans]) => {
            const posts = await getCreatorPosts(creator);
            return {
              creator,
              plans: creatorPlans,
              posts,
            };
          })
        );

        if (!cancelled) {
          setFeeds(creatorFeeds);
        }
      } catch (err: any) {
        console.error(err);
        if (!cancelled) {
          setError(err.message || "Failed to load feed");
          setFeeds([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [refreshFlag]);

  return { feeds, loading, error, refresh };
}
