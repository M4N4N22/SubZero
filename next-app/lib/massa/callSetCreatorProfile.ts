import { getWallets } from "@massalabs/wallet-provider";
import { SmartContract, Args, OperationStatus } from "@massalabs/massa-web3";

/**
 * Calls the `setCreatorProfile` function on your deployed Massa smart contract
 * with just the IPFS CID.
 */
export const callSetCreatorProfile = async (cid: string) => {
  console.log("🚀 Calling setCreatorProfile with CID:", cid);

  if (!cid) throw new Error("Missing CID to store on-chain");

  // Connect wallet
  const wallets = await getWallets();
  if (!wallets.length) throw new Error("No wallets found");
  const wallet = wallets[0];
  await wallet.connect();
  const accounts = await wallet.accounts();
  const provider = accounts[0];

  console.log("✅ Wallet connected:", provider.address);

  // Initialize the contract
  const contract = new SmartContract(
    provider,
    "AS1g86F28S7N8GQ33oysd8wm6SSmNMyZxhgLJVybxLc44bM9Bvqw" // your deployed address
  );

  console.log("🔗 Smart contract initialized:", contract.address);

  // Prepare arguments — just one string (the CID)
  const args = new Args().addString(cid);

  // Execute the smart contract call
  const operation = await contract.call("setCreatorProfile", args, {
    fee: BigInt(50_000_000),
    maxGas: BigInt(200_000_000),
    coins: BigInt(100_000_000),
    periodToLive: 1000,
  });

  console.log("📡 Operation sent:", operation.id);

  const speculativeStatus = await operation.waitSpeculativeExecution();
  console.log("🔍 Speculative status:", speculativeStatus);

  const finalStatus = await operation.waitFinalExecution();
  console.log("🏁 Final status:", finalStatus);

  const events = await operation.getFinalEvents();
  console.log("🎉 Final events:", events);

  return operation.id;
};
