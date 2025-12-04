"use client";

import Image from "next/image";

interface FeedMediaProps {
  media?: string | null;
  variant?: "list" | "grid";
}

export default function FeedMedia({ media, variant = "list" }: FeedMediaProps) {
  if (!media) {
    return (
      <div className="bg-muted h-64 flex items-center justify-center text-muted-foreground">
        No media
      </div>
    );
  }

  const url = `https://gateway.pinata.cloud/ipfs/${media}`;
  const ext = media.split(".").pop()?.toLowerCase();

  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "");
  const isVideo = ["mp4", "mov", "webm"].includes(ext || "");
  const isAudio = ["mp3", "wav", "ogg"].includes(ext || "");

  // NEW: treat unknown types as image
  const isOther = !isImage && !isVideo && !isAudio;

  // -----------------------------
  // LIST VIEW (no cropping)
  // -----------------------------
  if (variant === "list") {
    return (
      <div className="w-full bg-black flex justify-center">
        {/* IMAGE */}
        {(isImage || isOther) && (
          <Image
            src={url}
            alt="post media"
            width={1200}
            height={800}
            className="w-full h-auto object-contain"
            unoptimized
          />
        )}

        {/* VIDEO */}
        {isVideo && (
          <video
            src={url}
            controls
            className="w-full h-auto"
            style={{ objectFit: "contain" }}
          />
        )}

        {/* AUDIO */}
        {isAudio && (
          <div className="p-4 w-full">
            <audio controls className="w-full" src={url} />
          </div>
        )}
      </div>
    );
  }

  // -----------------------------
  // GRID VIEW (square tile, NO cropping)
  // -----------------------------
  if (variant === "grid") {
    return (
      <div className="relative w-full aspect-square bg-card flex items-center justify-center overflow-hidden">
        {/* IMAGE */}
        {(isImage || isOther) && (
          <Image
            src={url}
            alt="post media"
            fill
            className="object-contain"
            unoptimized
          />
        )}

        {/* VIDEO */}
        {isVideo && (
          <video
            src={url}
            className="absolute inset-0 w-full h-full object-contain"
            muted
          />
        )}

        {/* AUDIO */}
        {isAudio && (
          <div className="p-2 w-full">
            <audio controls className="w-full" src={url} />
          </div>
        )}
      </div>
    );
  }

  return null;
}
