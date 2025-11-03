"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useBearby } from "@/hooks/useBearby";
import { getCreatorPosts } from "@/lib/massa/getCreatorPosts";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";

interface Post {
  title: string;
  description?: string;
  mediaCID: string;
  type: "image" | "video" | "audio" | "other";
}

export default function MyPosts() {
  const { address } = useBearby();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        if (!address) return;

        // Fetch all post CIDs stored on-chain for this creator
        const postCIDs = await getCreatorPosts(address);
        if (!postCIDs || postCIDs.length === 0) {
          setPosts([]);
          return;
        }

        const postData: Post[] = [];

        // Fetch post metadata for each CID using our backend route
        for (const cid of postCIDs) {
          try {
            const res = await fetch(`/api/fetch-ipfs-metadata?cid=${cid}`);
            if (!res.ok) throw new Error(`Failed to fetch CID: ${cid}`);
            const data = await res.json();
            postData.push(data);
          } catch (e) {
            console.warn("Failed to load CID:", cid, e);
          }
        }

        setPosts(postData);
      } catch (err) {
        console.error("Error loading posts:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [address]);

  // Loading UI
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
      </div>
    );
  }

  // No wallet
  if (!address) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Connect your Bearby wallet to view your posts.
      </div>
    );
  }

  // No posts yet
  if (posts.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground bg-card flex flex-col justify-center items-center rounded-3xl">
        No posts yet.
        <Link
          href="/creator/upload-content"
          className="inline-flex items-center gap-2 mt-4  hover:underline bg-primary rounded-full text-white px-4 py-2 text-sm font-medium"
        >
          <Plus className="h-4 w-4" /> Create your first post
        </Link>
      </div>
    );
  }

  // Posts grid
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post, idx) => (
        <Card key={idx} className="overflow-hidden border border-border">
          <CardContent className="p-0">
            {post.type === "image" && (
              <Image
                src={`https://ipfs.io/ipfs/${post.mediaCID}`}
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
                src={`https://ipfs.io/ipfs/${post.mediaCID}`}
              />
            )}
            {post.type === "audio" && (
              <audio
                controls
                className="w-full mt-3"
                src={`https://ipfs.io/ipfs/${post.mediaCID}`}
              />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-lg">{post.title}</h3>
              {post.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {post.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
