import { SmartContract, Args } from "@massalabs/massa-web3";
import { getWallets } from "@massalabs/wallet-provider";

async function main() {
  // 1️⃣ Connect wallet
  const wallets = await getWallets();
  if (!wallets.length) throw new Error("No wallets found");

  const wallet = wallets[0];
  await wallet.connect();

  const accounts = await wallet.accounts();
  const provider = accounts[0];
  console.log("🟢 Wallet connected, first account:", provider.address);

  // 2️⃣ Initialize contract
  const contract = new SmartContract(
    provider,
    "AS12ZohGN8Kvp4pEk3cad8wD5GSz2dZ28nWH5G8qWZCuRUGz4opCg" // replace with your deployed SC address
  );
  console.log("📜 Smart contract initialized:", contract.address);

  // 3️⃣ Build Args
  const args = new Args()
    .addString("plan-test01")      // planId
    .addString("Test Plan Node")   // planName
    .addString("Testing via Node") // description
    .addString("MAS")              // token
    .addString("1")                // amount
    .addString("monthly")          // frequency
    .addString(new Date().toISOString()); // createdAt

  console.log("🧩 Contract arguments built:", args);

  // 4️⃣ Call contract
  console.log("📡 Sending createPlan transaction...");
  const operation = await contract.call("createPlan", args, {
    fee: BigInt(50_000_000),
    maxGas: BigInt(200_000_000),
    coins: BigInt(0),
    periodToLive: 1000,
  });

  console.log("Operation sent:", operation.id);

  // 5️⃣ Wait for final execution
  const finalStatus = await operation.waitFinalExecution();
  console.log("Final execution object:", finalStatus);

  // 6️⃣ Fetch events
  try {
    const events = await operation.getFinalEvents();
    console.log("📜 Events received:", events.length);
    events.forEach((ev, idx) => console.log(`Event[${idx}]:`, ev.data));
  } catch (err) {
    console.warn("⚠️ No events returned:", err);
  }
}

main().catch(console.error);
