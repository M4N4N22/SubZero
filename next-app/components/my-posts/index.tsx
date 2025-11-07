"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useBearby } from "@/hooks/useBearby";
import { getCreatorPosts } from "@/lib/massa/getCreatorPosts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, RotateCcw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// ---------- Helper: format "time ago" ----------
function formatTimeAgo(dateString: string) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diff = (now.getTime() - date.getTime()) / 1000; // in seconds

  if (diff < 60) return "just now";
  if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return `${mins} min${mins > 1 ? "s" : ""} ago`;
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  }
  if (diff < 172800) return "yesterday";
  const days = Math.floor(diff / 86400);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

// ---------- Types ----------
interface Post {
  title: string;
  description?: string;
  media: string;
  type: "image" | "video" | "audio" | "other";
  createdAt?: string;
}

// ---------- Component ----------
export default function MyPosts() {
  const { address } = useBearby();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /** Decode IPFS data safely into our Post type */
  const decodePost = (data: any): Post => {
    const title = data.title || "Untitled Post";
    const description = data.description || "";
    const media = data.media?.replace("ipfs://", "") || "";
    const createdAt = data.createdAt || "";

    // Infer type based on file extension (fallback to image if no extension)
    let type: Post["type"] = "image";
    const ext = media.split(".").pop()?.toLowerCase();
    if (ext) {
      if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) type = "image";
      else if (["mp4", "mov", "webm"].includes(ext)) type = "video";
      else if (["mp3", "wav", "ogg"].includes(ext)) type = "audio";
      else type = "other";
    }

    return { title, description, media, type, createdAt };
  };

  /** Load posts from blockchain + IPFS (optionally force refresh) */
  const loadPosts = async (refresh = false) => {
    if (!address) return;
    setLoading(true);
    if (refresh) setRefreshing(true);

    try {
      console.log(`[Posts] Fetching posts for ${address}, refresh=${refresh}`);
      toast.info(refresh ? "Refreshing your posts..." : "Loading your posts...");

      // Step 1: Fetch all post CIDs from the smart contract
      const postCIDs = await getCreatorPosts(address);
      if (!postCIDs || postCIDs.length === 0) {
        console.log("[Posts] No posts found on-chain");
        setPosts([]);
        return;
      }

      console.log(`[Posts] Found ${postCIDs.length} post CIDs:`, postCIDs);

      const postData: Post[] = [];

      // Step 2: Fetch each post metadata
      for (const cid of postCIDs) {
        try {
          const res = await fetch(
            `/api/fetch-ipfs-metadata?cid=${cid}${refresh ? "&refresh=true" : ""}`
          );
          if (!res.ok) throw new Error(`Failed to fetch CID: ${cid}`);

          const data = await res.json();

          console.log(`[Data] Preview:`, data);

          const decoded = decodePost(data);
          console.log("decoded",decoded);
          postData.push(decoded);
        } catch (e) {
          console.warn(`[Posts] ⚠️ Failed to load CID ${cid}`, e);
        }
      }

      setPosts(postData);
      console.log(`[Posts] ✅ Loaded ${postData.length} posts`);
      toast.success("Posts loaded!");
    } catch (err) {
      console.error("[Posts] ❌ Error loading posts:", err);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (address) loadPosts();
  }, [address]);

  // ---------- Loading State ----------
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-2 text-muted-foreground">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
        <p>Loading your posts...</p>
      </div>
    );
  }

  // ---------- No wallet ----------
  if (!address) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Connect your Bearby wallet to view your posts.
      </div>
    );
  }

  // ---------- No posts yet ----------
  if (posts.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground bg-card flex flex-col justify-center items-center rounded-3xl">
        No posts yet.
        <Link
          href="/creator/upload-content"
          className="inline-flex items-center gap-2 mt-4 hover:underline bg-primary rounded-full text-white px-4 py-2 text-sm font-medium"
        >
          <Plus className="h-4 w-4" /> Create your first post
        </Link>
      </div>
    );
  }

  // ---------- Posts Grid ----------
  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex justify-end items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={refreshing}
          onClick={() => loadPosts(true)}
          className="flex items-center gap-1 text-sm"
        >
          <RotateCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Posts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, idx) => (
          <Card key={idx} className="overflow-hidden border border-border">
            <CardContent className="p-0">
              {post.type === "other" && (
                <Image
                  src={`https://gateway.pinata.cloud/ipfs/${post.media}`}
                  alt={post.title}
                  width={600}
                  height={400}
                  className="object-cover w-full h-48"
                />
              )}
              {post.type === "video" && (
                <video
                  controls
                  className="w-full h-48 object-cover"
                  src={`https://gateway.pinata.cloud/ipfs/${post.media}`}
                />
              )}
              {post.type === "audio" && (
                <audio
                  controls
                  className="w-full mt-3"
                  src={`https://gateway.pinata.cloud/ipfs/${post.media}`}
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg">{post.title}</h3>
                {post.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {post.description}
                  </p>
                )}
                {post.createdAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                   Posted {formatTimeAgo(post.createdAt)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
