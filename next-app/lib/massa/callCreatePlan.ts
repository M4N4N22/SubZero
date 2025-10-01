import { getWallets } from "@massalabs/wallet-provider";
import { SmartContract, Args, OperationStatus } from "@massalabs/massa-web3";

export const callCreatePlan = async (params: {
  planId: string;
  planName: string;
  description: string;
  token: string;
  amount: string ;
  frequency: string ;
  createdAt: string;
}) => {
  console.log("🔌 Starting createPlan flow with params:", params);

  // Convert all args to string to avoid type issues
  const safeParams = {
    planId: String(params.planId),
    planName: String(params.planName),
    description: String(params.description),
    token: String(params.token),
    amount: String(params.amount),
    frequency: String(params.frequency),
    createdAt: String(params.createdAt),
  };

  console.log("Safe params (all strings):", safeParams);

  // Connect wallet
  const wallets = await getWallets();
  if (!wallets.length) throw new Error("No wallets found");
  const wallet = wallets[0];
  await wallet.connect();
  const accounts = await wallet.accounts();
  const provider = accounts[0];
  console.log(" Wallet connected, first account:", provider.address);

  // Initialize contract
  const contract = new SmartContract(
    provider,
    "AS12GNE7FDjsqQg6CGbzv65k1rmLt377cPtLSYu21y1VHCAQLnKEL"
  );
  console.log("Smart contract initialized:", contract.address);

  const args = new Args()
    .addString(safeParams.planId)
    .addString(safeParams.planName)
    .addString(safeParams.description)
    .addString(safeParams.token)
    .addString(safeParams.amount)
    .addString(safeParams.frequency)
    .addString(safeParams.createdAt);

  console.log("Serialized args:", args.serialize());

  // Call contract
  const operation = await contract.call("createPlan", args, {
    fee: BigInt(50_000_000),
    maxGas: BigInt(200_000_000),
    coins: BigInt(200_000_000),
    periodToLive: 1000,
  });

  console.log("Operation sent:", operation.id);

  const speculativeStatus = await operation.waitSpeculativeExecution();
  console.log("Speculative status:", speculativeStatus);

  if (speculativeStatus === OperationStatus.SpeculativeSuccess) {
    console.log("Operation Success (speculative)");
  } else {
    console.warn("Operation did not succeed (speculative)");
  }

  const speculativeEvents = await operation.getSpeculativeEvents();
  console.log("Speculative events:", speculativeEvents);

  const finalStatus = await operation.waitFinalExecution();
  console.log("Final status:", finalStatus);

  const finalEvents = await operation.getFinalEvents();
  console.log("Final events:", finalEvents);

  return operation.id;
};
