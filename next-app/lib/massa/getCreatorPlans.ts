import { web3 } from "@hicaru/bearby.js";
import { Args } from "@massalabs/massa-web3";

type CreatorPlan = {
  planId: string;
  planName: string;
  description: string;
  token: string;
  amount: string;
  frequency: string;
  createdAt: string;
};

export const getCreatorPlans = async (
  creatorAddress: string
): Promise<CreatorPlan[]> => {
  console.log("🔌 Checking Bearby connection...");
  if (!web3.wallet.connected) {
    throw new Error("❌ Bearby wallet is not connected");
  }

  const addressNormalized = creatorAddress.toLowerCase();
  console.log("📡 Sending SC read request for creator:", addressNormalized);

  const response = await web3.contract.readSmartContract({
    targetAddress: "AS12GNE7FDjsqQg6CGbzv65k1rmLt377cPtLSYu21y1VHCAQLnKEL",
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
    throw new Error("❌ Invalid RPC response format");
  }

  const scResult = rpcResult.result[0];
  console.log("📦 Raw SC result:", scResult);

  const result = scResult.result as { Ok?: number[]; Error?: string };

  if (result.Error) {
    throw new Error(`⚠️ Smart contract error: ${result.Error}`);
  }

  if (!result.Ok || result.Ok.length === 0) {
    console.warn("⚠️ Smart contract response is OK but empty");
    return [];
  }

  const buffer = Uint8Array.from(result.Ok);
  console.log("🧩 Raw SC buffer length:", buffer.length);

  // Log each byte in hex for debugging
  const bufferHex = Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ");
  console.log("🔍 SC buffer hex dump:", bufferHex);

  const args = new Args(buffer);
  const plans: CreatorPlan[] = [];
  let planIndex = 0;

  while (true) {
    try {
      const planId = args.nextString();
      const planName = args.nextString();
      const frequency = args.nextString();
      args.nextU32(); // placeholder
      const amount = args.nextString();

      plans.push({
        planId,
        planName,
        description: "", // not returned by SC
        token: "", // not returned by SC
        amount,
        frequency,
        createdAt: "", // not returned by SC
      });

      console.log(`✅ Plan[${planIndex}] decoded:`, plans[planIndex]);
      planIndex++;
    } catch (err) {
      console.log("✅ Finished reading buffer / no more plans to decode");
      break;
    }
  }

  console.log("🎯 Total plans fetched:", plans.length);
  return plans;
};
