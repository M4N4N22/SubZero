"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { getCreatorProfile } from "@/lib/massa/getCreatorProfile";
import { useBearby } from "@/hooks/useBearby";
import {
  FaXTwitter,
  FaInstagram,
  FaTelegram,
  FaDiscord,
} from "react-icons/fa6";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

const CreatorProfile = () => {
  const { connected } = useBearby();
  const router = useRouter();
  const [profile, setProfile] = useState<{
    name?: string;
    bio?: string;
    avatar?: string;
    socials?: {
      x?: string;
      discord?: string;
      telegram?: string;
      instagram?: string;
    };
  } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async (refresh = false) => {
    if (!connected) return;
    try {
      setRefreshing(true);
      toast.info(refresh ? "Refreshing profile..." : "Fetching profile...");
      const data = await getCreatorProfile(refresh);

      if (!data || !data.metadata) {
        toast.info("No profile found.");
        setProfile(null);
        setAvatarUrl(null);
        return;
      }

      const meta = data.metadata;
      const avatarCid = meta.avatar?.replace("ipfs://", "");
      if (avatarCid) {
        setAvatarUrl(`https://gateway.pinata.cloud/ipfs/${avatarCid}`);
      }

      setProfile({
        name: meta.name,
        bio: meta.bio,
        avatar: meta.avatar,
        socials: meta.socials || {},
      });

      toast.success(refresh ? "Profile refreshed!" : "Profile loaded!");
    } catch (err) {
      console.error("Error loading profile:", err);
      toast.error("Failed to load profile");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (connected) loadProfile();
  }, [connected]);

  return (
    <div className=" z-0">
      <div className="  w-full">
        <Card className="p- relative ">
          <CardContent>
            <div className="flex justify-between items">
              {/* Refresh button (top-right) */}

              {profile ? (
                <div className="flex gap-6 items-center">
                  {/* Avatar */}
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border border-muted">
                    <Image
                      src={avatarUrl || "/default.webp"}
                      alt="Creator Avatar"
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>

                  {/* Name */}
                  <div className="flex flex-col items-start">
                    <h2 className="text-2xl font-semibold text-foreground">
                      {profile.name || "Unnamed Creator"}
                    </h2>

                    {/* Bio */}
                    <p className="text-sm text-muted-foreground max-w-lg">
                      {profile.bio || "No bio provided."}
                    </p>

                    {/* Socials */}
                    <div className="flex flex-wrap gap-4 mt-4">
                      {profile.socials?.x && (
                        <a
                          href={`https://x.com/${profile.socials.x.replace(
                            "@",
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition  bg-muted p-2 rounded-full border"
                        >
                          <FaXTwitter />
                        </a>
                      )}
                      {profile.socials?.discord && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition  bg-muted p-2 rounded-full border">
                          <FaDiscord />
                        </div>
                      )}
                      {profile.socials?.telegram && (
                        <a
                          href={`https://t.me/${profile.socials.telegram.replace(
                            "@",
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition  bg-muted p-2 rounded-full border"
                        >
                          <FaTelegram />
                        </a>
                      )}
                      {profile.socials?.instagram && (
                        <a
                          href={`https://instagram.com/${profile.socials.instagram.replace(
                            "@",
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition  bg-muted p-2 rounded-full border"
                        >
                          <FaInstagram />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-muted-foreground text-sm">
                    {loading
                      ? "Loading your profile..."
                      : "Loading your profile..."}
                  </p>
                </div>
              )}
              <div className="flex justify-end items-start gap-2 mb-4">
                {/* Edit Profile */}
                <Button
                  variant="outline"
                  onClick={() => router.push("/creator/profile")}
                >
                  Edit Profile
                </Button>

                {/* Refresh */}
                <Button
                  variant="outline"
                  disabled={refreshing || !connected}
                  onClick={() => loadProfile(true)}
                >
                  <RotateCcw
                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatorProfile;
