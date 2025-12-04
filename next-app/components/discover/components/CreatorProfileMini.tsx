"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FaXTwitter,
  FaInstagram,
  FaTelegram,
  FaDiscord,
} from "react-icons/fa6";
import { useSubscriptionStatus } from "@/lib/massa/useSubscriptionStatus";
import { useEffect } from "react";

interface Props {
  name: string;
  avatar: string;
  bio: string;
  address: string;
  activeSubs: number;

  planId: string; // NEW
  scAddress: string; // NEW

  socials?: {
    x?: string;
    discord?: string;
    telegram?: string;
    instagram?: string;
  };
  onSubscriptionStatus?: (subscribed: boolean) => void;
}

export default function CreatorProfileMini({
  name,
  avatar,
  bio,
  address,
  activeSubs,
  socials,

  planId, // NEW
  scAddress, // NEW
  onSubscriptionStatus,
}: Props) {
  const formatHandle = (handle?: string) =>
    handle?.startsWith("@") ? handle.slice(1) : handle;

  const { subscribed, loading, error } = useSubscriptionStatus(
    planId,
    scAddress
  );

  useEffect(() => {
    if (!loading && onSubscriptionStatus) {
      onSubscriptionStatus(subscribed);
    }
  }, [subscribed, loading, onSubscriptionStatus]);

  return (
    <div className="flex items-center gap-3">
      <div className="w-[150px] h-[150px] rounded-full overflow-hidden bg-muted flex items-center justify-center">
        <Image
          src={
            avatar
              ? `https://gateway.pinata.cloud/ipfs/${avatar}`
              : "/default.webp"
          }
          alt={name}
          width={150}
          height={150}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col items-start">
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 text-center">
          {bio}
        </p>

        {/* Socials Row */}
        {socials && (
          <div className="flex items-center gap-4 mt-4">
            {socials.x && (
              <Link
                href={`https://x.com/${formatHandle(socials.x)}`}
                target="_blank"
                className="bg-muted p-2 rounded-full border text-muted-foreground hover:text-foreground transition"
              >
                <FaXTwitter size={18} />
              </Link>
            )}
            {socials.discord && (
              <span
                title={socials.discord}
                className="bg-muted p-2 rounded-full border text-muted-foreground hover:text-foreground transition"
              >
                <FaDiscord size={18} />
              </span>
            )}
            {socials.telegram && (
              <Link
                href={`https://t.me/${formatHandle(socials.telegram)}`}
                target="_blank"
                className="bg-muted p-2 rounded-full border text-muted-foreground hover:text-foreground transition"
              >
                <FaTelegram size={18} />
              </Link>
            )}
            {socials.instagram && (
              <Link
                href={`https://instagram.com/${formatHandle(
                  socials.instagram
                )}`}
                target="_blank"
                className="bg-muted p-2 rounded-full border text-muted-foreground hover:text-foreground transition"
              >
                <FaInstagram size={18} />
              </Link>
            )}
          </div>
        )}
        <div className="flex gap-2 items-center">
          {/* Subscribers Count */}
          <div className="flex items-center gap-1 text-xs mt-4 border border-primary text-primary px-3 py-2 rounded-3xl font-semibold">
            {activeSubs} Active Subscribers
          </div>

          {/* SUBSCRIPTION STATUS UI */}
          <div className="">
            {loading && (
              <div className="px-4 py-2 rounded-full bg-muted text-xs text-muted-foreground animate-pulse">
                Checking subscription...
              </div>
            )}

            {!loading && subscribed && (
              <div className="flex items-center gap-1 text-xs mt-4 border bg-primary text-primary-foreground px-3 py-2 rounded-3xl font-semibold">
                Subscribed
              </div>
            )}

    

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
