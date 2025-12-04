import { getWallets } from "@massalabs/wallet-provider";
import { SmartContract, Args } from "@massalabs/massa-web3";

export async function getCreatorProfileByAddress(
  creatorAddress: string,
  refresh: boolean = false
) {
  try {
    if (!creatorAddress) return null;

    // Only need provider to READ the contract
    const wallets = await getWallets();
    if (!wallets.length) throw new Error("No wallet found");

    const wallet = wallets[0];
    await wallet.connect();
    const accounts = await wallet.accounts();
    const provider = accounts[0];

    const contract = new SmartContract(
      provider,
      "AS1bCYyESnNPJKRXrdC6AU3jwwEBsHWEPmqvWVEAYYATuSWNHDNJ"
    );

    // Contract call with creatorAddress (NOT provider.address)
    const args = new Args().addString(creatorAddress);
    const result = await contract.read("getCreatorProfile", args, {
      maxGas: BigInt(200_000_000),
    });

    if (!result?.value) return null;

    const cid = new TextDecoder().decode(result.value).trim();
    if (!cid) return null;

    const endpoint =
      `/api/fetch-ipfs-metadata?cid=${cid}` + (refresh ? "&refresh=true" : "");

    const res = await fetch(endpoint);
    if (!res.ok) return { cid, metadata: null };

    const metadata = await res.json();
    return { cid, metadata };
  } catch {
    return null;
  }
}
