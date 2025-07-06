import { web3 } from "@hicaru/bearby.js";
import { Args } from "@massalabs/massa-web3";

type CreatorPlan = {
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

  console.log("📡 Sending SC read request for creator:", creatorAddress);

  const response = await web3.contract.readSmartContract({
    targetAddress: "AS128bXDwAasHieMrCXDGgjZSeQFi3fQ6kzA4JbqJvHDKKq2k4Csd",
    targetFunction: "getPlansByCreator",
    parameter: [
      {
        type: web3.contract.types.STRING,
        value: creatorAddress,
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

  console.log("📜 Decoding Args buffer:", result.Ok);

  const buffer = Uint8Array.from(result.Ok);
  const args = new Args(buffer);
  const plans: CreatorPlan[] = [];

  try {
    while (true) {
      const name = args.nextString();
      const frequency = args.nextString();
      const subscribers = Number(args.nextU32());
      const revenue = args.nextString();

      console.log("✅ Plan decoded:", { name, frequency, subscribers, revenue });

      plans.push({ name, frequency, subscribers, revenue });
    }
  } catch {
    console.log("✅ Finished reading buffer / End of Args reached");
  }

  console.log("🎯 Total plans fetched:", plans.length);
  return plans;
};
