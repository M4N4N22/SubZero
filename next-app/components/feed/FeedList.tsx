"use client";

import { useState } from "react";
import FeedPostCard from "./FeedPostCard";
import { RotateCcw, ArrowLeft, Grid, List } from "lucide-react";
import FeedPostSkeleton from "../FeedPostSkeleton";

interface FeedListProps {
  loading: boolean;
  posts: any[];
  reload: () => void;
  error?: string | null;

  selectedCreator?: string | null;
  clearCreator?: () => void;
}

export default function FeedList({
  loading,
  posts,
  reload,
  error,
  selectedCreator,
  clearCreator,
}: FeedListProps) {
  const [view, setView] = useState<"list" | "grid">("grid");

  // -------------------------------
  // STATES
  // -------------------------------
  if (error) {
    return <div className="text-center text-red-500 py-20">{error}</div>;
  }

  if (loading) {
    return (
      <div
        className={
          view === "grid"
            ? "grid grid-cols-3 gap-2 transition-all duration-300"
            : "space-y-6 transition-all duration-300"
        }
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <FeedPostSkeleton key={i} variant={view} />
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-20">
        No posts yet.
      </div>
    );
  }

  // -------------------------------
  // MAIN RENDER
  // -------------------------------
  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        {/* Back Button */}
        {selectedCreator && clearCreator && (
          <button
            onClick={clearCreator}
            className="text-sm flex items-center gap-1 px-3 py-1.5 bg-card rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}

        <div className="flex items-center gap-2">
          {/* View Toggle — ONE BUTTON only */}
          <button
            onClick={() => setView(view === "list" ? "grid" : "list")}
            className={`
              p-2 rounded-full border transition-all duration-200
              ${
                view === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card"
              }
            `}
          >
            {view === "list" ? (
              <Grid className="h-4 w-4" />
            ) : (
              <List className="h-4 w-4" />
            )}
          </button>

          {/* Refresh Button */}
          <button
            onClick={reload}
            className="text-sm flex items-center gap-1 px-3 py-1.5 border rounded-full"
          >
            <RotateCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* POSTS */}
      {view === "list" ? (
        <div className="space-y-6 transition-all duration-300">
          {posts.map((post, index) => (
            <FeedPostCard key={post.cid || index} post={post} variant="list" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 transition-all duration-300">
          {posts.map((post, index) => (
            <FeedPostCard key={post.cid || index} post={post} variant="grid" />
          ))}
        </div>
      )}
    </div>
  );
}
