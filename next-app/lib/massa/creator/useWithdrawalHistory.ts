import { useEffect, useState } from "react";
import { getWallets } from "@massalabs/wallet-provider";
import { SmartContract, Args, bytesToStr } from "@massalabs/massa-web3";

export type WithdrawalRecord = {
  amount: number; // MAS
  timestamp: string; // ISO string
};

export function useWithdrawalHistory(scAddress: string) {
  const [history, setHistory] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scAddress) return;

    const fetchHistory = async () => {
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

        // Call getWithdrawalHistory(creator)
        const raw = await contract.read(
          "getWithdrawalHistory",
          new Args().addString(creator)
        );

        const rawStr = bytesToStr(raw.value); // "1000000,17100000;500000,17100050"
        if (!rawStr) {
          setHistory([]);
          return;
        }

        const entries = rawStr.split(";").filter((e) => e.length > 1);

        const parsed: WithdrawalRecord[] = entries.map((entry) => {
          const [amountMicro, ts] = entry.split(",");

          const mas = Number(amountMicro) / 1_000_000;

          let iso = "";
          if (ts && !isNaN(Number(ts))) {
            iso = new Date(Number(ts)).toISOString();
          } else {
            iso = new Date().toISOString();
          }

          return { amount: mas, timestamp: iso };
        });

        setHistory(parsed);
      } catch (err: any) {
        console.error("Error fetching withdrawal history:", err);
        setError(err.message || "Failed to load withdrawal history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [scAddress]);

  return { history, loading, error };
}
