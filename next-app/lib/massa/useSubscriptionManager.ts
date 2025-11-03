"use client";

import { useState } from "react";
import { getWallets } from "@massalabs/wallet-provider";
import { SmartContract, Args, OperationStatus } from "@massalabs/massa-web3";
import { useBearby } from "@/hooks/useBearby";

type SubscriptionAction = "subscribe" | "pause" | "cancel";

export function useSubscriptionManager() {
  const { connected } = useBearby();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const manageSubscription = async (
    planId: string,
    action: SubscriptionAction,
    amount?: string // amount only needed for subscribe
  ) => {
    if (!connected) {
      setError("Wallet not connected");
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`🔌 Performing ${action} for planId: ${planId}`);

      // Connect wallet
      const wallets = await getWallets();
      if (!wallets.length) throw new Error("No wallets found");
      const wallet = wallets[0];
      await wallet.connect();
      const accounts = await wallet.accounts();
      const provider = accounts[0];
      console.log("Wallet connected, first account:", provider.address);

      // Initialize SmartContract
      const contract = new SmartContract(
        provider,
        "AS1g86F28S7N8GQ33oysd8wm6SSmNMyZxhgLJVybxLc44bM9Bvqw"
      );
      console.log("Smart contract initialized:", contract.address);

      // Serialize args
      const args = new Args().addString(action).addString(planId);
      console.log("Serialized args:", args.serialize());

      // Determine coins to send (only for subscribe)
      const coins = action === "subscribe" && amount ? BigInt(Math.floor(parseFloat(amount) * 1_000_000)) : BigInt(0);
      if (action === "subscribe") console.log(`Sending ${coins} coins to creator`);

      // Call the smart contract
      const operation = await contract.call("manageSubscription", args, {
        fee: BigInt(50_000_000),
        maxGas: BigInt(200_000_000),
        coins, 
        periodToLive: 1000,
      });

      console.log("Operation sent:", operation.id);

      const speculativeStatus = await operation.waitSpeculativeExecution();
      console.log("Speculative status:", speculativeStatus);

      const finalStatus = await operation.waitFinalExecution();
      console.log("Final status:", finalStatus);

      const speculativeEvents = await operation.getSpeculativeEvents();
      console.log("Speculative events:", speculativeEvents);

      const finalEvents = await operation.getFinalEvents();
      console.log("Final events:", finalEvents);

      return operation.id;
    } catch (err: any) {
      console.error(`${action} failed:`, err);
      setError(err.message || "Transaction failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { manageSubscription, loading, error };
}
