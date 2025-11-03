//upload-json-to-pinata/route.ts

import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { json } = await req.json();

    if (!json) {
      return NextResponse.json({ error: "Missing JSON data" }, { status: 400 });
    }

    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PINATA_JWT!}`,
      },
      body: JSON.stringify({ pinataContent: json }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Pinata JSON upload failed:", text);
      return NextResponse.json({ error: "Failed to upload JSON" }, { status: 500 });
    }

    const data = await res.json();
    const cid = data.IpfsHash;

    return NextResponse.json({
      cid,
      url: `https://gateway.pinata.cloud/ipfs/${cid}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
