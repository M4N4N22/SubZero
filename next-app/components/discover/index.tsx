"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { getWallets } from "@massalabs/wallet-provider";
import { SmartContract, Args } from "@massalabs/massa-web3";
import { Button } from "../ui/button";

interface CreatorProfile {
  address: string;
  name?: string;
  avatar?: string;
  bio?: string;
  firstPost?: {
    title: string;
    description?: string;
    mediaCID?: string;
    type?: "image" | "video" | "audio" | "other";
  };
}

export default function DiscoverPage() {
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCreators = async () => {
      try {
        const wallets = await getWallets();
        if (!wallets.length) throw new Error("No wallets found");

        const wallet = wallets[0];
        await wallet.connect();

        const accounts = await wallet.accounts();
        const provider = accounts[0];

        // Initialize contract
        const contract = new SmartContract(
          provider,
          "AS12gCvUCZEKdvPEokeKBdwndpbA7iRD9B5SZspLqkufhUZjxKc1C"
        );

        // Get total creators count
        const countRes = await contract.read("getCreatorCount", new Args(), {
          maxGas: BigInt(200_000_000),
        });

        const total = parseInt(
          new TextDecoder().decode(countRes.value || new Uint8Array())
        );
        console.log("Total creators:", total);

        const creatorList: CreatorProfile[] = [];

        for (let i = 0; i < total; i++) {
          try {
            // Get creator address by index
            const addrRes = await contract.read(
              "getCreatorByIndex",
              new Args().addString(i.toString()),
              { maxGas: BigInt(200_000_000) }
            );
            const creatorAddress = new TextDecoder()
              .decode(addrRes.value || new Uint8Array())
              .trim();
            if (!creatorAddress) continue;

            // Get creator profile CID
            const profileRes = await contract.read(
              "getCreatorProfile",
              new Args().addString(creatorAddress),
              { maxGas: BigInt(200_000_000) }
            );
            const profileCID = new TextDecoder()
              .decode(profileRes.value || new Uint8Array())
              .trim();
            if (!profileCID) continue;

            // Fetch profile metadata from IPFS via backend proxy
            const profileMetaRes = await fetch(
              `/api/fetch-ipfs-metadata?cid=${profileCID}`
            );
            const profileMeta = await profileMetaRes.json();

            const creatorData: CreatorProfile = {
              address: creatorAddress,
              name: profileMeta.name || "Unnamed Creator",
              avatar: profileMeta.avatar || "",
              bio: profileMeta.bio || "",
            };

            // Fetch creator’s first content (optional)
            const contentRes = await contract.read(
              "getCreatorContents",
              new Args().addString(creatorAddress),
              { maxGas: BigInt(200_000_000) }
            );
            const contentString = new TextDecoder()
              .decode(contentRes.value || new Uint8Array())
              .trim();

            if (contentString) {
              const cids = contentString.split(";");
              if (cids.length > 0) {
                const firstCID = cids[0];
                const contentMetaRes = await fetch(
                  `/api/fetch-ipfs-metadata?cid=${firstCID}`
                );
                const contentMeta = await contentMetaRes.json();

                creatorData.firstPost = {
                  title: contentMeta.title || "Untitled",
                  description: contentMeta.description || "",
                  mediaCID: contentMeta.mediaCID || "",
                  type: contentMeta.type || "other",
                };
              }
            }

            creatorList.push(creatorData);
          } catch (innerErr) {
            console.error(`Error loading creator ${i}:`, innerErr);
          }
        }

        setCreators(creatorList);
      } catch (err) {
        console.error("Error loading creators:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCreators();
  }, []);

  function CreatorAvatar({ avatar, name }: { avatar?: string; name?: string }) {
    const [imgSrc, setImgSrc] = useState(
      avatar && avatar.trim() !== ""
        ? `https://ipfs.io/ipfs/${avatar}`
        : "/default.webp"
    );
  
    return (
      <Image
        src={imgSrc}
        alt={name || "Default Avatar"}
        width={80}
        height={80}
        className="rounded-full object-cover"
        onError={() => setImgSrc("/default.webp")}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (creators.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No creators found yet.
      </div>
    );
  }

  return (
    <div className="px-10 py-10">
      <h1 className="text-3xl font-bold mb-8 text-foreground">
        Discover Creators
      </h1>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {creators.map((creator, idx) => (
          <Card
            key={idx}
            className="overflow-hidden border border-border hover:shadow-md transition-shadow"
          >
            <CardContent className="p-0">
              {creator.firstPost?.mediaCID ? (
                creator.firstPost.type === "image" ? (
                  <Image
                    src={`https://ipfs.io/ipfs/${creator.firstPost.mediaCID}`}
                    alt={creator.firstPost.title}
                    width={600}
                    height={400}
                    className="object-cover w-full h-48"
                  />
                ) : creator.firstPost.type === "video" ? (
                  <video
                    controls
                    className="w-full h-48 object-cover"
                    src={`https://ipfs.io/ipfs/${creator.firstPost.mediaCID}`}
                  />
                ) : creator.firstPost.type === "audio" ? (
                  <audio
                    controls
                    className="w-full mt-3"
                    src={`https://ipfs.io/ipfs/${creator.firstPost.mediaCID}`}
                  />
                ) : null
              ) : (
                <div className="h-48 bg-muted flex items-center justify-center text-sm text-muted-foreground">
                  No Preview
                </div>
              )}

              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                <CreatorAvatar avatar={creator.avatar} name={creator.name} />


                  <div>
                    <h3 className="font-semibold text-lg">{creator.name}</h3>
                    <p className="text-xs text-muted-foreground break-all">
                      {creator.address.slice(0, 10)}...
                    </p>
                  </div>
                </div>

                {creator.firstPost && (
                  <>
                    <h4 className="font-medium text-sm">
                      {creator.firstPost.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {creator.firstPost.description}
                    </p>
                  </>
                )}

                <div className="flex items-center justify-between mt-4">
                  <Link
                    href={`/creator/${creator.address}`}
                    className="text-primary text-sm hover:underline"
                  >
                    View Profile →
                  </Link>

                  <Link href={`/subscribe?creator=${creator.address}`}>
                    <Button
                      size="lg"
                      className="bg-primary text-white hover:bg-primary/80"
                    >
                      Subscribe
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
