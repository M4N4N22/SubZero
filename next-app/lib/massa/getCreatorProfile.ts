import { getWallets } from "@massalabs/wallet-provider";
import { SmartContract, Args } from "@massalabs/massa-web3";

/**
 * Fetches the creator's saved profile metadata from the smart contract + IPFS.
 *
 * 1. Calls `getCreatorProfile` on-chain → gets CID
 * 2. Fetches metadata JSON via /api/fetch-ipfs-metadata → returns structured object
 */
export const getCreatorProfile = async () => {
  try {
    // Step 1: Connect to Bearby wallet
    const wallets = await getWallets();
    if (!wallets.length) throw new Error("No wallets found");

    const wallet = wallets[0];
    await wallet.connect();
    const accounts = await wallet.accounts();
    const provider = accounts[0];

    console.log(" Wallet connected:", provider.address);

    // Step 2: Initialize contract
    const contract = new SmartContract(
      provider,
      "AS1g86F28S7N8GQ33oysd8wm6SSmNMyZxhgLJVybxLc44bM9Bvqw" // Contract address
    );

    console.log(" Reading from contract:", contract.address);

    // Step 3: Fetch creator profile CID from contract
    const args = new Args().addString(provider.address);
    const result = await contract.read("getCreatorProfile", args, {
      maxGas: BigInt(200_000_000),
    });

    if (!result?.value) {
      console.warn(" No profile CID found for this creator");
      return null;
    }

    const cid = new TextDecoder().decode(result.value).trim();
    if (!cid || cid.length < 10) {
      console.warn(" Invalid or empty CID returned:", cid);
      return null;
    }

    console.log(" Found CID:", cid);

    // Step 4: Fetch IPFS metadata via your backend proxy
    const res = await fetch(`/api/fetch-ipfs-metadata?cid=${encodeURIComponent(cid)}`);

    if (!res.ok) {
      console.warn(" Metadata fetch failed with status:", res.status);
      return { cid, metadata: null };
    }

    const data = await res.json();

    if (!data || data.error || !data.metadata) {
      console.warn("ℹ️ Missing metadata or error from IPFS route:", data?.error);
      return { cid, metadata: null };
    }

    console.log(" Loaded profile metadata:", data.metadata);

    return { cid, metadata: data.metadata };
  } catch (err: any) {
    console.error(" Error fetching creator profile:", err.message || err);
    return null;
  }
};
