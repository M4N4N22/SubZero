"use client";

import { useEffect, useState } from "react";
import { getWallets } from "@massalabs/wallet-provider";
import { SmartContract, Args } from "@massalabs/massa-web3";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import CreatorCard from "./components/CreatorCard";
import { RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import ViewPlans from "./components/ViewPlans";

export default function DiscoverIndex() {
  const [creatorAddresses, setCreatorAddresses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const loadCreators = async () => {
      try {
        const wallets = await getWallets();
        if (!wallets.length) throw new Error("No wallets found");

        const wallet = wallets[0];
        await wallet.connect();

        const accounts = await wallet.accounts();
        const provider = accounts[0];

        const contract = new SmartContract(
          provider,
          "AS1g86F28S7N8GQ33oysd8wm6SSmNMyZxhgLJVybxLc44bM9Bvqw"
        );

        const countRes = await contract.read("getCreatorCount", new Args(), {
          maxGas: BigInt(3_000_000),
        });

        const total = parseInt(
          new TextDecoder().decode(countRes.value || new Uint8Array())
        );
        console.log("Total creators:", total);

        const list: string[] = [];

        for (let i = 0; i < total; i++) {
          try {
            const addrRes = await contract.read(
              "getCreatorByIndex",
              new Args().addString(i.toString()),
              { maxGas: BigInt(3_000_000) }
            );

            const creatorAddress = new TextDecoder()
              .decode(addrRes.value || new Uint8Array())
              .trim();

            if (creatorAddress) list.push(creatorAddress);
          } catch (innerErr) {
            console.warn(`Error fetching creator ${i}`, innerErr);
          }
        }

        setCreatorAddresses(list);
      } catch (err) {
        console.error("Failed to load creators:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCreators();
  }, []);

  const handleRefresh = () => {
    setRefresh((prev) => !prev); // toggle to trigger re-fetch
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (creatorAddresses.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No creators found.
      </div>
    );
  }

  return (
    <div className="px-6 py-10">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Discover Creators
        </h1>

        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RotateCcw
            className={`group-active:animate-spin transition-transform`}
          />
        </Button>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {creatorAddresses.map((address) => (
          <Card key={address}>
            <CreatorCard address={address} refresh={refresh} />
            <div className=" flex justify-center px-4">
              <ViewPlans creatorAddress={address} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
