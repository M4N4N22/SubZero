// lib/massa/useSubscriptionStatus.ts
import { useEffect, useState } from "react";
import { getWallets } from "@massalabs/wallet-provider";
import { SmartContract, Args, bytesToStr } from "@massalabs/massa-web3";

export function useSubscriptionStatus(planId: string, scAddress: string) {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId || !scAddress) return;

    const fetchStatus = async () => {
      setLoading(true);
      setError(null);

      try {
        const wallets = await getWallets();
        if (!wallets.length) throw new Error("No wallets found");
        const wallet = wallets[0];
        await wallet.connect();
        const accounts = await wallet.accounts();
        const userAddress = accounts[0].address.toLowerCase();

        const contract = new SmartContract(accounts[0], scAddress);

        // Serialize planId argument
        const args = new Args().addString(planId);
        const result = await contract.read("getSubscribers", args);

        // Deserialize response
        const subsString = bytesToStr(result.value);
        const subscribers = subsString ? subsString.split("|") : [];

        setSubscribed(subscribers.includes(userAddress));
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch subscription status");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [planId, scAddress]);

  return { subscribed, loading, error };
}
