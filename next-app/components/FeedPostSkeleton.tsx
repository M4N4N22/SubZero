// components/FeedPostSkeleton.tsx
import { Shimmer } from "./ui/Shimmer";

export default function FeedPostSkeleton({ variant }: { variant: "list" | "grid" }) {
  if (variant === "grid") {
    return (
      <div className="rounded-xl overflow-hidden bg-muted relative">
        <div className="relative w-full aspect-square overflow-hidden">
          <Shimmer />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden space-y-4">
      {/* HEADER */}
      <div className="flex items-center gap-3 px-4 pt-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted relative">
          <Shimmer />
        </div>

        <div className="flex flex-col gap-1 w-[130px]">
          <div className="h-3 w-24 bg-muted rounded relative overflow-hidden">
            <Shimmer />
          </div>
          <div className="h-3 w-16 bg-muted rounded relative overflow-hidden">
            <Shimmer />
          </div>
        </div>
      </div>

      {/* MEDIA */}
      <div className="w-full bg-muted relative overflow-hidden aspect-[4/5]">
        <Shimmer />
      </div>

      {/* TEXT */}
      <div className="px-4 pb-4 space-y-2">
        <div className="h-4 w-3/4 bg-muted rounded relative overflow-hidden">
          <Shimmer />
        </div>

        <div className="h-3 w-full bg-muted rounded relative overflow-hidden">
          <Shimmer />
        </div>

        <div className="h-3 w-2/3 bg-muted rounded relative overflow-hidden">
          <Shimmer />
        </div>
      </div>
    </div>
  );
}
