"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { callSetCreatorProfile } from "@/lib/massa/callSetCreatorProfile";
import { getCreatorProfile } from "@/lib/massa/getCreatorProfile";
import { useBearby } from "@/hooks/useBearby";

const SetupProfile = () => {
  const { connected } = useBearby();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [form, setForm] = useState<{
    name: string;
    bio: string;
    avatarCid: string;
    avatarFile?: File;
    x: string;
    discord: string;
    telegram: string;
    instagram: string;
  }>({
    name: "",
    bio: "",
    avatarCid: "",
    avatarFile: undefined,
    x: "",
    discord: "",
    telegram: "",
    instagram: "",
  });

  /** Auto-fetch profile when wallet is connected */
  useEffect(() => {
    const loadProfile = async () => {
      if (!connected) return;
      try {
        toast.info("Fetching your saved profile...");
        const profile = await getCreatorProfile();

        if (!profile || !profile.metadata) {
          toast.info("No saved profile found.");
          return;
        }

        const metadata = profile.metadata;
        const avatarCid = metadata.avatar?.replace("ipfs://", "") || "";
        const socials = metadata.socials || {};

        setForm((prev) => ({
          ...prev,
          name: metadata.name || "",
          bio: metadata.bio || "",
          avatarCid,
          x: socials.x || "",
          discord: socials.discord || "",
          telegram: socials.telegram || "",
          instagram: socials.instagram || "",
        }));

        if (avatarCid) {
          setAvatarPreview(`https://gateway.pinata.cloud/ipfs/${avatarCid}`);
        }

        toast.success("Profile loaded!");
      } catch (err) {
        console.error("Error loading profile:", err);
        toast.error("Failed to load profile");
      }
    };

    loadProfile();
  }, [connected]);

  /** Handle avatar file selection — only preview, no upload yet */
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview locally
    setAvatarPreview(URL.createObjectURL(file));

    // Store file temporarily
    setForm((prev) => ({ ...prev, avatarFile: file }));
  };

  /** Upload metadata + avatar (if selected) when saving */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) return toast.error("Connect your wallet first");

    setIsLoading(true);

    try {
      let avatarCid = form.avatarCid;

      // Upload avatar if a new one is selected
      if (form.avatarFile) {
        setAvatarUploading(true);
        try {
          const formData = new FormData();
          formData.append("file", form.avatarFile);

          const res = await fetch("/api/upload-file-to-pinata", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (!res.ok || !data.cid) {
            toast.error("Failed to upload avatar");
            setAvatarUploading(false);
            setIsLoading(false);
            return;
          }

          avatarCid = data.cid;
          setForm((prev) => ({ ...prev, avatarCid }));
          toast.success("Avatar uploaded!");
        } catch (error) {
          console.error(error);
          toast.error("Avatar upload failed");
          setAvatarUploading(false);
          setIsLoading(false);
          return;
        } finally {
          setAvatarUploading(false);
        }
      }

      // Now upload profile metadata JSON to Pinata
      const metadata = {
        name: form.name,
        bio: form.bio,
        avatar: avatarCid ? `ipfs://${avatarCid}` : null,
        socials: {
          x: form.x,
          discord: form.discord,
          telegram: form.telegram,
          instagram: form.instagram,
        },
        createdAt: new Date().toISOString(),
      };

      const res = await fetch("/api/upload-json-to-pinata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: metadata }),
      });

      const data = await res.json();

      if (!res.ok || !data.cid) {
        toast.error("Failed to upload metadata to Pinata");
        setIsLoading(false);
        return;
      }

      const cid = data.cid;
      await callSetCreatorProfile(cid);

      toast.success("Profile saved on-chain!", { description: `CID: ${cid}` });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Setup Your Creator Profile
          </h1>
        </div>

        <Card className="p-4 md:p-8">
          <CardHeader className="">
            <CardTitle className="text-lg font-semibold">
           
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-between gap-6 items-start">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-3 w-1/3">
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border border-muted">
                    <Image
                      src={avatarPreview || "/default.webp"}
                      alt="Avatar Preview"
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>

                  <div className="flex flex-col gap-3 items-center">
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarSelect}
                      disabled={avatarUploading}
                      className="cursor-pointer text-sm"
                    />
                    {avatarUploading && (
                      <p className="text-xs text-muted-foreground">Uploading...</p>
                    )}
                    {form.avatarCid && (
                      <p className="text-xs text-muted-foreground break-all text-center">
                        CID: {form.avatarCid}
                      </p>
                    )}
                  </div>
                </div>

                {/* Form Section */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell people about yourself..."
                      value={form.bio}
                      onChange={(e) =>
                        setForm({ ...form, bio: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="x">X / Twitter</Label>
                      <Input
                        id="x"
                        placeholder="@username"
                        value={form.x}
                        onChange={(e) =>
                          setForm({ ...form, x: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="discord">Discord</Label>
                      <Input
                        id="discord"
                        placeholder="username#0000"
                        value={form.discord}
                        onChange={(e) =>
                          setForm({ ...form, discord: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="telegram">Telegram</Label>
                      <Input
                        id="telegram"
                        placeholder="@handle"
                        value={form.telegram}
                        onChange={(e) =>
                          setForm({ ...form, telegram: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        placeholder="@handle"
                        value={form.instagram}
                        onChange={(e) =>
                          setForm({ ...form, instagram: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !connected}
                className="w-full mt-4"
              >
                {isLoading
                  ? "Saving..."
                  : "Save Profile (Pinata + On-chain)"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetupProfile;
