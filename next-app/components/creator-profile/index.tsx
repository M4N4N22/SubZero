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
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async (refresh = false) => {
    if (!connected) return;

    try {
      setRefreshing(true);
      toast.info(refresh ? "Refreshing profile..." : "Fetching profile...");

      const data = await getCreatorProfile(refresh);

      if (!data || !data.metadata) {
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
    <div className="z-0">
      <div className="w-full">
        <Card className="relative p-6">
          <CardContent>
            <div className="flex justify-between items-start">
              {/* MAIN PROFILE AREA */}
              {refreshing && !profile ? (
                // LOADING STATE
                <div className="flex flex-col items-center justify-center w-full py-16 text-center gap-4 text-primary">
                  <RotateCcw className="h-6 w-6 animate-spin mb-2" />
                  <p className="text-sm font-medium">Loading profile...</p>
                </div>
              ) : profile ? (
                <div className=" flex gap-6 justify-between w-full items-start">
                  <div className="flex gap-6 items-center ">
                    {/* Avatar */}
                    <div className="relative w-28 h-28 rounded-full overflow-hidden border border-muted shadow-sm">
                      <Image
                        src={avatarUrl || "/default.webp"}
                        alt="Creator Avatar"
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>

                    {/* Name + Bio + Socials */}
                    <div className="flex flex-col items-start">
                      <h2 className="text-2xl font-semibold text-foreground">
                        {profile.name || "Unnamed Creator"}
                      </h2>

                      <p className="text-sm text-muted-foreground max-w-lg mt-1">
                        {profile.bio || "No bio provided."}
                      </p>

                      {/* Socials */}
                      <div className="flex flex-wrap gap-3 mt-4">
                        {profile.socials?.x && (
                          <a
                            href={`https://x.com/${profile.socials.x.replace(
                              "@",
                              ""
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-muted border p-2 rounded-full hover:text-foreground transition"
                          >
                            <FaXTwitter />
                          </a>
                        )}
                        {profile.socials?.discord && (
                          <div className="bg-muted border p-2 rounded-full">
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
                            className="bg-muted border p-2 rounded-full hover:text-foreground transition"
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
                            className="bg-muted border p-2 rounded-full hover:text-foreground transition"
                          >
                            <FaInstagram />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* ACTION BUTTONS (RIGHT SIDE) */}
                  <div className="flex  items-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/creator/profile")}
                    >
                      Edit Profile
                    </Button>

                    <Button
                      variant="outline"
                      disabled={refreshing || !connected}
                      onClick={() => loadProfile(true)}
                    >
                      <RotateCcw
                        className={`h-4 w-4 ${
                          refreshing ? "animate-spin" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </div>
              ) : (
                /* ----------- EMPTY STATE FOR NEW CREATORS ----------- */
                <div className="flex flex-col items-center justify-center w-full py-16 text-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground border shadow-sm">
                    ?
                  </div>

                  <h2 className="text-xl font-semibold text-foreground">
                    No profile found
                  </h2>

                  <p className="text-muted-foreground text-sm max-w-sm">
                    You haven’t created your creator profile yet. Add your name,
                    avatar, bio, and social links to get started.
                  </p>

                  <Button
                    className="mt-3"
                    onClick={() => router.push("/creator/profile")}
                  >
                    Create Profile
                  </Button>

                  <Button
                    variant="outline"
                    disabled={refreshing || !connected}
                    onClick={() => loadProfile(true)}
                    className=" flex items-center gap-2"
                  >
                    <RotateCcw
                      className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatorProfile;
