// lib/ipfs.ts
import axios from "axios";

/**
 * Uploads a JSON object to Pinata's Pinata API using the JSON pin endpoint.
 */
export async function uploadJSONToIPFS(pinataApiKey: string, pinataSecretKey: string, json: any) {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

  const res = await axios.post(
    url,
    {
      pinataMetadata: {
        name: json.name || "metadata",
      },
      pinataContent: json,
    },
    {
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretKey,
      },
    }
  );

  const cid = res.data.IpfsHash; // e.g. "bafy..."
  return cid;
}
