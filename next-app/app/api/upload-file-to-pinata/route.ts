//upload-file-to-pinata/route.ts

import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pinataFormData = new FormData();
    pinataFormData.append("file", new Blob([buffer]), file.name);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT!}`,
      },
      body: pinataFormData,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Pinata upload error:", text);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
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
