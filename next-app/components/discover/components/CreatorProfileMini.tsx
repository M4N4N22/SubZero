import Image from "next/image";
import { Users, X, Instagram, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import {
  FaXTwitter,
  FaInstagram,
  FaTelegram,
  FaDiscord,
} from "react-icons/fa6";

interface Props {
  name: string;
  avatar: string;
  bio: string;
  address: string;
  activeSubs: number;
  socials?: {
    x?: string;
    discord?: string;
    telegram?: string;
    instagram?: string;
  };
}

export default function CreatorProfileMini({
  name,
  avatar,
  bio,
  address,
  activeSubs,
  socials,
}: Props) {
  const formatHandle = (handle?: string) =>
    handle?.startsWith("@") ? handle.slice(1) : handle;

  return (
    <div className="flex flex-col items-center gap-3">
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
      <div className="flex flex-col items-center">
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 text-center">
          {bio}
        </p>

        {/* Socials Row */}
        {socials && (
          <div className="flex items-center gap-4 mt-2">
            {socials.x && (
              <Link
                href={`https://x.com/${formatHandle(socials.x)}`}
                target="_blank"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition  bg-muted p-2 rounded-full border"
              >
                <FaXTwitter size={18} />
              </Link>
            )}
            {socials.discord && (
              <span
                title={socials.discord}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition  bg-muted p-2 rounded-full border"
              >
                <FaDiscord size={18} />
              </span>
            )}
            {socials.telegram && (
              <Link
                href={`https://t.me/${formatHandle(socials.telegram)}`}
                target="_blank"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition  bg-muted p-2 rounded-full border"
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
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition  bg-muted p-2 rounded-full border"
              >
                <FaInstagram size={18} />
              </Link>
            )}
          </div>
        )}

        {/* Subscribers Count */}
        <div className="flex items-center gap-1 text-xs mt-3 border border-primary text-primary px-3 py-2 rounded-3xl font-semibold">
          {activeSubs} Active Subscribers
        </div>
      </div>
    </div>
  );
}
