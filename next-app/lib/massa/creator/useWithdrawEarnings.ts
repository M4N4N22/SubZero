import { useState } from "react";
import { getWallets } from "@massalabs/wallet-provider";
import {
  SmartContract,
  Args,
  OperationStatus,
} from "@massalabs/massa-web3";

/**
 * Hook to withdraw creator earnings from the Massa smart contract.
 *
 * @param scAddress - Smart contract address
 */
export function useWithdrawEarnings(scAddress: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Withdraw a given amount (in MAS, human readable).
   *
   * SC expects micro-MAS as string → withdrawEarnings("2000000") = 2 MAS
   */
  const withdraw = async (amountMAS: number) => {
    setLoading(true);
    setError(null);

    try {
      if (!scAddress) throw new Error("Contract address missing");
      if (amountMAS <= 0) throw new Error("Amount must be greater than 0");

      console.log("🔌 Starting withdrawEarnings flow");
      console.log("Requested amount (MAS):", amountMAS);

      // Connect wallet
      const wallets = await getWallets();
      if (!wallets.length) throw new Error("No wallets found");
      const wallet = wallets[0];
      await wallet.connect();

      const accounts = await wallet.accounts();
      const creatorAccount = accounts[0];

      console.log("Connected wallet:", creatorAccount.address);

      // Initialize contract instance
      const contract = new SmartContract(creatorAccount, scAddress);
      console.log("Smart contract instance created at:", contract.address);

      // Convert MAS → micro-MAS (string)
      const amountMicro = Math.floor(amountMAS * 1_000_000).toString();

      const args = new Args().addString(amountMicro);

      console.log("Calling withdrawEarnings with:", { amountMicro });

      // Execute contract call (same pattern as callCreatePlan)
      const operation = await contract.call("withdrawEarnings", args, {
        coins: BigInt(0),
        fee: BigInt(50_000_000),
        maxGas: BigInt(200_000_000),
        periodToLive: 1000,
      });

      console.log("📡 Operation sent:", operation.id);

      // --- Speculative execution ---
      const speculativeStatus = await operation.waitSpeculativeExecution();
      console.log("Speculative status:", speculativeStatus);

      if (speculativeStatus === OperationStatus.SpeculativeSuccess) {
        console.log("Speculative success (withdrawEarnings)");
      } else {
        console.warn("Speculative execution failed");
      }

      const speculativeEvents = await operation.getSpeculativeEvents();
      console.log("Speculative events:", speculativeEvents);

      // --- Final execution ---
      const finalStatus = await operation.waitFinalExecution();
      console.log("Final status:", finalStatus);

      const finalEvents = await operation.getFinalEvents();
      console.log("Final events:", finalEvents);

      return {
        operationId: operation.id,
        speculativeStatus,
        speculativeEvents,
        finalStatus,
        finalEvents,
      };
    } catch (err: any) {
      console.error("❌ withdrawEarnings error:", err);
      setError(err.message || "Withdrawal failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { withdraw, loading, error };
}
