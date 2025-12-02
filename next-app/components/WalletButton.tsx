"use client";

import { useBearby } from "@/hooks/useBearby";
import { Button } from "./ui/button";
import { formatAddress } from "@/lib/utils";

export default function WalletButton() {
  const { connected, address, connect, disconnect } = useBearby();

  return connected && address ? (
    <div className="flex items-center gap-2 text-sm text-foreground bg-foreground/5  rounded-3xl border">
      <span className="font-semibold pl-3">👛 {formatAddress(address)}</span>

      <button
        onClick={disconnect}
        className="text-xs bg-foreground/5 px-4 py-3 rounded-3xl font-medium text-red-600 "
      >
        Disconnect
      </button>
    </div>
  ) : (
    <Button variant={"outline"} onClick={connect} className="rounded-3xl">
      Connect Wallet
    </Button>
  );
}
