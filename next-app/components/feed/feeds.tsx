"use client";

import { useEffect, useMemo, useState } from "react";
import FeedList from "./FeedList";
import CreatorBar from "./CreatorBar";
import { useSubscribedCreators } from "@/lib/massa/subscriber/useSubscribedCreators";
import { useSubscribedFeed } from "@/lib/massa/subscriber/useSubscribedFeed";

export default function Feed() {
  const {
    creators,
    loading: loadingCreators,
    error: creatorError,
    refresh: refreshCreators,
  } = useSubscribedCreators();

  const {
    feeds,
    loading: loadingFeeds,
    error: feedError,
    refresh: refreshFeeds,
  } = useSubscribedFeed();

  const [finalPosts, setFinalPosts] = useState<any[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);

  // Merge posts + creator details
  const merged = useMemo(() => {
    if (!creators.length || !feeds.length) return [];

    return feeds.flatMap((feed) => {
      const creatorData = creators.find(
        (c) => c.creator.toLowerCase() === feed.creator.toLowerCase()
      );

      if (!creatorData) return [];

      return feed.posts.map((cid) => ({
        cid,
        creator: feed.creator,
        creatorName: creatorData.profile?.name || "Unknown Creator",
        creatorAvatar: creatorData.profile?.avatar || null,
        plans: creatorData.plans || [],
      }));
    });
  }, [creators, feeds]);

  // Fetch metadata for all posts (decode title, media, type, createdAt)
  useEffect(() => {
    const loadMetadata = async () => {
      if (!merged.length) {
        setFinalPosts([]);
        setLoadingMeta(false);
        return;
      }

      setLoadingMeta(true);
      const results: any[] = [];

      for (const post of merged) {
        try {
          const res = await fetch(`/api/fetch-ipfs-metadata?cid=${post.cid}`);
          if (!res.ok) continue;

          const data = await res.json();

          const media = data.media?.replace("ipfs://", "") || null;
          const ext = media?.split(".").pop()?.toLowerCase();

          let type: "image" | "video" | "audio" | "other" = "other";
          if (ext) {
            if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
              type = "image";
            else if (["mp4", "mov", "webm"].includes(ext)) type = "video";
            else if (["mp3", "wav", "ogg"].includes(ext)) type = "audio";
          }

          results.push({
            ...post,
            title: data.title || "",
            description: data.description || "",
            media,
            type,
            createdAt: data.createdAt || null,
          });
        } catch (err) {
          console.warn("metadata load failed", post.cid, err);
        }
      }

      // newest first
      results.sort((a, b) => {
        const t1 = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const t2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return t2 - t1;
      });

      setFinalPosts(results);
      setLoadingMeta(false);
    };

    loadMetadata();
  }, [merged]);

  const loading = loadingCreators || loadingFeeds || loadingMeta;
  const error = creatorError || feedError;

  const reload = () => {
    refreshCreators();
    refreshFeeds();
  };

  // Filter posts by selected creator
  const filteredPosts = selectedCreator
    ? finalPosts.filter(
        (p) => p.creator.toLowerCase() === selectedCreator.toLowerCase()
      )
    : finalPosts;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground mb-6">
        Your Subscribed Creators
      </h1>
      {/* Subscribed Creator Scroll Bar */}
      <CreatorBar
        creators={creators}
        selectedCreator={selectedCreator}
        setSelectedCreator={setSelectedCreator}
      />

      {/* Feed List */}
      <FeedList
        loading={loading}
        posts={filteredPosts}
        reload={reload}
        error={error}
        selectedCreator={selectedCreator}
        clearCreator={() => setSelectedCreator(null)}
      />
    </div>
  );
}
