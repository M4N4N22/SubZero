import { useEffect, useState } from "react";
import { getWallets } from "@massalabs/wallet-provider";
import { SmartContract, Args, bytesToStr } from "@massalabs/massa-web3";

export function useCreatorBalance(scAddress: string) {
  const [balance, setBalance] = useState<number>(0); // in MAS
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scAddress) return;

    const fetchBalance = async () => {
      setLoading(true);
      setError(null);

      try {
        // Wallet connect
        const wallets = await getWallets();
        if (!wallets.length) throw new Error("No wallets found");

        const wallet = wallets[0];
        await wallet.connect();
        const accounts = await wallet.accounts();

        const creator = accounts[0].address.toLowerCase();
        const contract = new SmartContract(accounts[0], scAddress);

        // Call getCreatorBalance(creator)
        const raw = await contract.read(
          "getCreatorBalance",
          new Args().addString(creator)
        );

        const microStr = bytesToStr(raw.value); // string in micro-MAS
        const micro = microStr ? Number(microStr) : 0;

        // Convert micro-MAS → MAS
        const mas = micro / 1_000_000;

        setBalance(mas);
      } catch (err: any) {
        console.error("Error fetching creator balance:", err);
        setError(err.message || "Failed to load creator balance");
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [scAddress]);

  return { balance, loading, error };
}
