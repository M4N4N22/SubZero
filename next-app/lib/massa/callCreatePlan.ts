// lib/massa/callCreatePlan.ts

import { Args } from "@massalabs/massa-web3";
import { web3 } from "@hicaru/bearby.js";

export const callCreatePlan = async ({
  planId,
  planName,
  description,
  token,
  amount,
  frequency,
  createdAt,
}: {
  planId: string;
  planName: string;
  description: string;
  token: string;
  amount: string;
  frequency: string;
  createdAt: string;
}) => {
  // 1. Connect to Bearby wallet if not already connected
  if (!web3.wallet.connected) {
    const connected = await web3.wallet.connect();
    if (!connected) throw new Error("Could not connect to Bearby");
  }

  // 2. Build parameters
  const args = new Args()
    .addString(planId)
    .addString(planName)
    .addString(description)
    .addString(token)
    .addString(amount)
    .addString(frequency)
    .addString(createdAt);

  // 3. Call smart contract via Bearby helper
  const txHash = await web3.contract.call({
    fee: 10_000_000, // in nanoMAS
    maxGas: 100_000_000, // gas limit
    coins: 0, // attach MAS if needed
    targetAddress: "AS12jozNQsyMUTbohLjaBpbByYaTdWXJq1XraU5CdpbY4dxdJfhcG",
    functionName: "createPlan",
    unsafeParameters: args.serialize(), // use Args directly
  });

  return txHash; // returns transaction hash
};
