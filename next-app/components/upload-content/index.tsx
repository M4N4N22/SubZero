"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useBearby } from "@/hooks/useBearby";
import { callAddCreatorContent } from "@/lib/massa/callAddCreatorContent"; // we'll create this next

export default function UploadContent() {
  const { connected } = useBearby();

  const [form, setForm] = useState({
    title: "",
    description: "",
    mediaCid: "",
    mediaPreview: "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setForm((prev) => ({
      ...prev,
      mediaPreview: URL.createObjectURL(file),
    }));

    toast.info("File selected. Click Upload to submit.");
  };

  // 1️Upload media file (image/video/audio) to Pinata
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-file-to-pinata", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.cid) {
        toast.error("Failed to upload media");
        return;
      }

      setForm((prev) => ({
        ...prev,
        mediaCid: data.cid,
        mediaPreview: data.url,
      }));

      toast.success("Media uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // Upload metadata JSON to Pinata, then call smart contract
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) return toast.error("Connect your wallet first");

    if (!selectedFile) return toast.error("Please select a file");
    if (!form.title) return toast.error("Please enter a title");

    setIsSubmitting(true);

    try {
      // Step 1: Upload media file to Pinata
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadRes = await fetch("/api/upload-file-to-pinata", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.cid) {
        toast.error("Failed to upload media");
        setIsUploading(false);
        return;
      }

      const mediaCid = uploadData.cid;

      setForm((prev) => ({
        ...prev,
        mediaCid,
      }));

      setIsUploading(false);

      // Step 2: Upload metadata JSON
      const metadata = {
        title: form.title,
        description: form.description,
        media: `ipfs://${mediaCid}`,
        createdAt: new Date().toISOString(),
      };

      const metaRes = await fetch("/api/upload-json-to-pinata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: metadata }),
      });

      const metaData = await metaRes.json();
      if (!metaRes.ok || !metaData.cid) {
        toast.error("Failed to upload metadata");
        return;
      }

      // Step 3: Call smart contract
      await callAddCreatorContent(metaData.cid);

      toast.success("Content uploaded successfully!", {
        description: `On-chain + IPFS linked (CID: ${metaData.cid})`,
      });

      // Reset form
      setForm({ title: "", description: "", mediaCid: "", mediaPreview: "" });
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Upload Exclusive Content
          </h1>
          <p className="text-muted-foreground mt-2">
            Share your subscriber-only posts by uploading them to IPFS and
            linking them on-chain for secure, gated access.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* LEFT: Upload Form */}
          <div className="lg:col-span-3">
            <Card className="p-4 md:p-8">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Content Details
                </CardTitle>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter a catchy title"
                        value={form.title}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your content..."
                        value={form.description}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="media">Upload Media</Label>
                      <Input
                        id="media"
                        type="file"
                        accept="image/*,video/*,audio/*"
                        onChange={handleFileChange}
                        disabled={isUploading || isSubmitting}
                      />
                      {isUploading && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploading to IPFS...
                        </p>
                      )}

                      {form.mediaPreview && (
                        <div className="mt-4 rounded-lg border border-muted p-2 bg-muted/20">
                          {form.mediaPreview.endsWith(".mp4") ? (
                            <video
                              controls
                              className="w-full rounded-md"
                              src={form.mediaPreview}
                            />
                          ) : form.mediaPreview.endsWith(".mp3") ? (
                            <audio
                              controls
                              className="w-full"
                              src={form.mediaPreview}
                            />
                          ) : (
                            <Image
                              src={form.mediaPreview}
                              alt="Preview"
                              width={400}
                              height={200}
                              className="rounded-md object-cover mx-auto"
                            />
                          )}
                          <p className="text-xs text-muted-foreground break-all mt-2">
                            CID: {form.mediaCid}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!connected || isSubmitting}
                  >
                    {isSubmitting
                      ? "Uploading..."
                      : "Upload to IPFS + On-Chain"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          {/* RIGHT: Live Preview */}
          <div className="lg:col-span-2">
            <div className="hidden lg:block">
              <Card className="p-4 md:p-6 h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center">
                  {form.mediaPreview ? (
                    <>
                      {form.mediaPreview.endsWith(".mp4") ? (
                        <video
                          controls
                          className="w-full rounded-lg mb-4"
                          src={form.mediaPreview}
                        />
                      ) : form.mediaPreview.endsWith(".mp3") ? (
                        <audio
                          controls
                          className="w-full mb-4"
                          src={form.mediaPreview}
                        />
                      ) : (
                        <Image
                          src={form.mediaPreview}
                          alt="Preview"
                          width={500}
                          height={280}
                          className="rounded-lg object-cover mb-4"
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-56 flex items-center justify-center border border-dashed border-muted rounded-lg mb-4 text-muted-foreground">
                      Media Preview
                    </div>
                  )}

                  <h3 className="text-xl font-semibold mb-2 text-center">
                    {form.title || "Your title will appear here"}
                  </h3>
                  <p className="text-sm text-muted-foreground text-center">
                    {form.description || "Your description will appear here"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
