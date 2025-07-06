import { web3 } from "@hicaru/bearby.js";
import { Args } from "@massalabs/massa-web3";

export type PlanDetails = {
  name: string;
  description: string;
  token: string;
  amount: string;
  frequency: string;
  creator: string;
  createdAt: string;
};

export const getPlanById = async (
  planId: string
): Promise<PlanDetails | null> => {
  if (!web3.wallet.connected) {
    throw new Error("Bearby wallet is not connected");
  }

  const response = await web3.contract.readSmartContract({
    targetAddress: "AS128bXDwAasHieMrCXDGgjZSeQFi3fQ6kzA4JbqJvHDKKq2k4Csd", // Your smart contract address
    targetFunction: "getPlanById",
    parameter: [
      {
        type: web3.contract.types.STRING,
        value: planId,
      },
    ],
    maxGas: 2_000_000,
    fee: 0,
  });

  const item = response?.[0];
  if (!item || !item.result) {
    throw new Error("Invalid smart contract response");
  }

  const result = item.result as { Ok?: number[]; Error?: string };

  if (!result.Ok || result.Ok.length === 0) {
    return null;
  }

  const buffer = Uint8Array.from(result.Ok);

  if (buffer.length === 0) return null;

  const args = new Args(buffer);

  try {
    return {
      name: args.nextString(),
      description: args.nextString(),
      token: args.nextString(),
      amount: args.nextString(),
      frequency: args.nextString(),
      creator: args.nextString(),
      createdAt: args.nextString(),
    };
  } catch (error) {
    console.error("Failed to deserialize plan:", error);
    return null;
  }
};
