"use client";

import Image from "next/image";
import Link from "next/link";

interface Post {
  title: string;
  media: string;
  type: string;
}

interface Props {
  posts: Post[];
  subscribed: boolean;
}

export default function CreatorPostsPreview({ posts, subscribed }: Props) {
  if (!posts.length)
    return (
      <div className="h-32 bg-muted flex items-center justify-center text-sm text-muted-foreground">
        No posts yet
      </div>
    );

  const sanitizeCID = (media: string) => {
    if (!media) return "";
    return media
      .replace(/^ipfs:\/\//i, "")
      .replace(/^https?:\/\/[^/]+\/ipfs\//i, "")
      .trim();
  };

  return (
    <div className="mt-2">
      {/* Grid Preview */}
      <div className="grid grid-cols-3 gap-2">
        {posts.slice(0, 3).map((p, i) => {
          const cid = sanitizeCID(p.media);
          const imageSrc = cid
            ? `https://gateway.pinata.cloud/ipfs/${cid}`
            : "/default.webp";

          return (
            <div key={i} className="relative group overflow-hidden rounded-md">
              <Image
                src={imageSrc}
                alt={p.title}
                width={200}
                height={200}
                className={`object-cover h-32 w-full transition-all ${
                  subscribed ? "opacity-100 blur-0" : "opacity-60 blur-sm"
                }`}
              />

              {/* Hover Title */}
              {!subscribed ? (
                <div className="absolute inset-0 bg-black/60 flex font-semibold items-center justify-center text-[10px] text-white">
                  Subscribe to unlock
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 text-xs text-white p-1 transition-all">
                  {p.title}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* See all posts — ONLY when subscribed */}
    </div>
  );
}
