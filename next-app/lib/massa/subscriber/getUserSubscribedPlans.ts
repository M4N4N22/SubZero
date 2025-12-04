// lib/massa/getUserSubscribedPlans.ts
import { getWallets } from "@massalabs/wallet-provider";
import { SmartContract, Args } from "@massalabs/massa-web3";

const MASSA_SUBSCRIPTION_SC_ADDRESS =
  "AS1bCYyESnNPJKRXrdC6AU3jwwEBsHWEPmqvWVEAYYATuSWNHDNJ"; // same as in getCreatorPosts – ideally move to a shared constant

export type SubscribedPlan = {
  planId: string;
  raw: string;
  name: string;
  description: string;
  token: string;
  amount: string;
  frequency: string;
  creator: string;
};

export const getUserSubscribedPlans = async (): Promise<SubscribedPlan[]> => {
  // 1️⃣ Connect wallet
  const wallets = await getWallets();
  if (!wallets.length) throw new Error("No wallets found");

  const wallet = wallets[0];
  await wallet.connect();
  const accounts = await wallet.accounts();
  const provider = accounts[0];

  const userAddress = provider.address.toLowerCase();

  // 2️⃣ Smart contract instance
  const contract = new SmartContract(
    provider,
    MASSA_SUBSCRIPTION_SC_ADDRESS
  );

  // 3️⃣ Call getUserSubscriptions(user)
  const subsResult = await contract.read(
    "getUserSubscriptions",
    new Args().addString(userAddress),
    {
      maxGas: BigInt(200_000_000),
    }
  );

  if (!subsResult || !subsResult.value) return [];

  const decodedSubs = new TextDecoder().decode(subsResult.value).trim();
  if (!decodedSubs) return [];

  // Stored as "planId1|planId2|..."
  const planIds = decodedSubs.split("|").filter(Boolean);

  if (!planIds.length) return [];

  // 4️⃣ For each planId, fetch the plan data via getPlan
  const plans = await Promise.all(
    planIds.map(async (planId) => {
      const planResult = await contract.read(
        "getPlan",
        new Args().addString(planId),
        {
          maxGas: BigInt(200_000_000),
        }
      );

      const raw = planResult && planResult.value
        ? new TextDecoder().decode(planResult.value).trim()
        : "";

      if (!raw) {
        return {
          planId,
          raw,
          name: "",
          description: "",
          token: "",
          amount: "",
          frequency: "",
          creator: "",
        };
      }

      // planData[5] = creator address (from your contract)
      const parts = raw.split("|");
      const name = parts[0] ?? "";
      const description = parts[1] ?? "";
      const token = parts[2] ?? "";
      const amount = parts[3] ?? "";
      const frequency = parts[4] ?? "";
      const creator = (parts[5] ?? "").toLowerCase();

      return {
        planId,
        raw,
        name,
        description,
        token,
        amount,
        frequency,
        creator,
      };
    })
  );

  return plans;
};
