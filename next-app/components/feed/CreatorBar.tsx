"use client";

import Image from "next/image";
import { SubscribedCreator } from "@/lib/massa/subscriber/useSubscribedCreators"; 

interface CreatorBarProps {
  creators: SubscribedCreator[];
  selectedCreator: string | null;
  setSelectedCreator: (creator: string | null) => void;
}

export default function CreatorBar({
  creators,
  selectedCreator,
  setSelectedCreator,
}: CreatorBarProps) {
  if (!creators.length) return null;

  return (
    <div className="flex overflow-x-auto gap-4 py-3 px-1">
      {creators.map((c) => {
        const isActive = selectedCreator === c.creator;

        return (
          <button
            key={c.creator}
            onClick={() =>
              setSelectedCreator(isActive ? null : c.creator)
            }
            className="flex flex-col items-center gap-1 shrink-0"
          >
            <div
              className={`w-14 h-14 rounded-full overflow-hidden border-2 ${
                isActive ? "border-primary" : "border-transparent"
              }`}
            >
              {c.profile?.avatar ? (
                <Image
                  src={`https://gateway.pinata.cloud/ipfs/${c.profile.avatar}`}
                  alt={c.profile.name ?? "Creator"}
                  width={56}
                  height={56}
                  className="rounded-full object-cover w-full h-full"
                />
              ) : (
                <Image
                src={ "/default.webp"}
                alt={ "Creator"}
                width={56}
                height={56}
                className="rounded-full object-cover w-full h-full"
              />
              )}
            </div>

            <span className="text-xs text-muted-foreground truncate w-16 text-center">
              {c.profile?.name || "Unknown"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
