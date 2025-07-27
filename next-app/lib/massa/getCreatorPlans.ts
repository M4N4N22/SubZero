import { web3 } from "@hicaru/bearby.js";
import { Args } from "@massalabs/massa-web3";

type CreatorPlan = {
  id: string;
  name: string;
  frequency: string;
  subscribers: number;
  revenue: string;
};

export const getCreatorPlans = async (
  creatorAddress: string
): Promise<CreatorPlan[]> => {
  console.log("🔌 Checking Bearby connection...");
  if (!web3.wallet.connected) {
    console.error("❌ Bearby wallet is not connected");
    throw new Error("Bearby wallet is not connected");
  }

  const addressNormalized = creatorAddress.toLowerCase(); // ⬅️ normalize here
  console.log("📡 Sending SC read request for creator:", addressNormalized);

  const response = await web3.contract.readSmartContract({
    targetAddress: "AS12jozNQsyMUTbohLjaBpbByYaTdWXJq1XraU5CdpbY4dxdJfhcG",
    targetFunction: "getPlansByCreator",
    parameter: [
      {
        type: web3.contract.types.STRING,
        value: addressNormalized,
      },
    ],
    maxGas: 3_000_000,
    fee: 0,
  });

  const rpcResult = response?.[0];
  if (!rpcResult || !rpcResult.result || !Array.isArray(rpcResult.result)) {
    console.error("❌ Invalid RPC structure:", rpcResult);
    throw new Error("Invalid RPC response format");
  }

  const scResult = rpcResult.result[0];
  console.log("📦 Smart contract execution result:", scResult);

  const result = scResult.result as { Ok?: number[]; Error?: string };

  if (result.Error) {
    console.error("⚠️ Smart contract error:", result.Error);
    throw new Error(`Smart contract error: ${result.Error}`);
  }

  if (!result.Ok) {
    console.warn("⚠️ Smart contract response is OK but empty");
    return [];
  }

  const buffer = Uint8Array.from(result.Ok);
  const args = new Args(buffer);
  const plans: CreatorPlan[] = [];

  try {
    while (true) {
      const id = args.nextString();            // ⬅️ new
      const name = args.nextString();
      const frequency = args.nextString();
      const subscribers = Number(args.nextU32());
      const revenue = args.nextString();

      console.log("✅ Plan decoded:", { id, name, frequency, subscribers, revenue });

      plans.push({ id, name, frequency, subscribers, revenue });
    }
  } catch {
    console.log("✅ Finished reading buffer / End of Args reached");
  }

  console.log("🎯 Total plans fetched:", plans.length);
  return plans;
};
