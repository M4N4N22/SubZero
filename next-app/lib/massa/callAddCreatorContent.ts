import { getWallets } from "@massalabs/wallet-provider";
import { SmartContract, Args } from "@massalabs/massa-web3";

/**
 * Calls the `addCreatorContent` function on your deployed Massa contract
 * to store uploaded content CIDs (from Pinata/IPFS) on-chain.
 */
export const callAddCreatorContent = async (cid: string) => {
  console.log("🚀 Calling addCreatorContent with CID:", cid);

  if (!cid) throw new Error("Missing CID to store on-chain");

  // Connect wallet
  const wallets = await getWallets();
  if (!wallets.length) throw new Error("No wallets found");
  const wallet = wallets[0];
  await wallet.connect();
  const accounts = await wallet.accounts();
  const provider = accounts[0];

  console.log("✅ Wallet connected:", provider.address);

  // Initialize contract (replace with your actual contract address)
  const contract = new SmartContract(
    provider,
    "AS1bCYyESnNPJKRXrdC6AU3jwwEBsHWEPmqvWVEAYYATuSWNHDNJ"
  );

  console.log("🔗 Smart contract initialized:", contract.address);

  // Prepare arguments (just 1 string — the CID)
  const args = new Args().addString(cid);

  // Execute the contract call
  const operation = await contract.call("addCreatorContent", args, {
    fee: BigInt(50_000_000),
    maxGas: BigInt(200_000_000),
    coins: BigInt(100_000_000),
    periodToLive: 1000,
  });

  console.log("📡 Operation sent:", operation.id);

  // Wait for speculative execution
  const speculativeStatus = await operation.waitSpeculativeExecution();
  console.log("🔍 Speculative status:", speculativeStatus);

  // Wait for final confirmation
  const finalStatus = await operation.waitFinalExecution();
  console.log("🏁 Final status:", finalStatus);

  // Get events from the transaction
  const events = await operation.getFinalEvents();
  console.log("🎉 Final events:", events);

  return { operationId: operation.id, events };
};
