import { getWallets } from "@massalabs/wallet-provider";
import { SmartContract, Args } from "@massalabs/massa-web3";

/**
 * Fetches all post CIDs created by a given address from the Massa smart contract.
 *
 * 1️⃣ Calls `getCreatorContents(address)` on-chain.
 * 2️⃣ Splits the returned `;`-delimited string into an array of CIDs.
 * 3️⃣ Returns the list of CIDs.
 */
export const getCreatorPosts = async (creatorAddress?: string): Promise<string[]> => {
  try {
    // 1️⃣ Connect to Bearby wallet if no address provided
    const wallets = await getWallets();
    if (!wallets.length) throw new Error("No wallets found");

    const wallet = wallets[0];
    await wallet.connect();

    const accounts = await wallet.accounts();
    const provider = accounts[0];

    const address = creatorAddress || provider.address;
    console.log("📡 Fetching posts for:", address);

    // 2️⃣ Initialize smart contract instance
    const contract = new SmartContract(
      provider,
      "AS1g86F28S7N8GQ33oysd8wm6SSmNMyZxhgLJVybxLc44bM9Bvqw" // replace with your deployed address
    );

    // 3️⃣ Prepare args and call read
    const args = new Args().addString(address);
    const result = await contract.read("getCreatorContents", args, {
      maxGas: BigInt(200_000_000),
    });

    if (!result || !result.value) {
      console.warn("No content found for creator");
      return [];
    }

    // 4️⃣ Decode from bytes → string → split by ';'
    const decoded = new TextDecoder().decode(result.value).trim();
    if (!decoded) return [];

    const cids = decoded.split(";").filter(Boolean);
    console.log("✅ Found content CIDs:", cids);
    return cids;
  } catch (err) {
    console.error("Error fetching creator posts:", err);
    return [];
  }
};
