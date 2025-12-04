import FeedMedia from "./FeedMedia";
import CreatorHeader from "./CreatorHeader";
import Image from "next/image";

export interface FeedPost {
  cid: string;
  creator: string;
  creatorName: string;
  creatorAvatar: string | null;
  media?: string | null;
  title?: string;
  description?: string;
  createdAt?: string | null;
  plans?: any[];
}

interface FeedPostCardProps {
  post: FeedPost;
  variant?: "list" | "grid";
}

export default function FeedPostCard({
  post,
  variant = "list",
}: FeedPostCardProps) {
  // -----------------------------
  // GRID MODE (compact card with metadata)
  // -----------------------------
  if (variant === "grid") {
    return (
      <div className="rounded-xl overflow-hidden bg-card border border-border">
        {/* Media */}

        {/* Compact Metadata */}
        <div className="">
          <div className="flex items-center gap-3 py-3 px-4">
            {/* Avatar */}
            {post.creatorAvatar ? (
              <Image
                src={`https://gateway.pinata.cloud/ipfs/${post.creatorAvatar}`}
                alt={post.creatorName ?? "Creator Avatar"}
                width={24}
                height={24}
                className="object-cover w-6 h-6"
              />
            ) : (
              <Image
                src={"/default.webp"}
                alt={"Creator"}
                width={40}
                height={40}
                className="rounded-full object-cover w-10 h-10"
              />
            )}

            <div className="flex flex-col leading-tight">
              <span className="font-medium">{post.creatorName ?? "Unknown Creator"}</span>

              <span className="text-xs text-muted-foreground">
                {post.creator.slice(0, 10)}...
              </span>
            </div>
          </div>
          <FeedMedia media={post.media} variant="grid" />
          <div className="p-4 space-y-1">
            <h3 className="font-semibold text-lg">{post.title}</h3>

            {post.description && (
              <p className="text-sm text-muted-foreground">
                {post.description}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------
  // LIST MODE (full detailed card)
  // -----------------------------
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <CreatorHeader
        name={post.creatorName}
        avatar={post.creatorAvatar}
        address={post.creator}
      />

      <FeedMedia media={post.media} variant="list" />

      <div className="p-4 space-y-1">
        <h3 className="font-semibold text-lg">{post.title}</h3>

        {post.description && (
          <p className="text-sm text-muted-foreground">{post.description}</p>
        )}
      </div>
    </div>
  );
}
