//fetch-ipfs-metadata/route.ts

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cid = searchParams.get("cid");

  console.log(`[fetch-ipfs-metadata] Incoming request for CID: ${cid}`);

  if (!cid) {
    console.warn("[fetch-ipfs-metadata] Missing CID parameter in request");
    return NextResponse.json({ error: "CID is required" }, { status: 400 });
  }

  try {
    const gateways = [
      `https://gateway.pinata.cloud/ipfs/${cid}`,
      `https://ipfs.io/ipfs/${cid}`,
      `https://cloudflare-ipfs.com/ipfs/${cid}`,
    ];

    console.log(`[fetch-ipfs-metadata] Attempting to fetch from ${gateways.length} gateways`);

    let data: any = null;
    let lastError: any = null;

    for (const url of gateways) {
      try {
        console.log(`[fetch-ipfs-metadata] Fetching from: ${url}`);
        const res = await fetch(url, { method: "GET" });

        if (!res.ok) {
          console.warn(`[fetch-ipfs-metadata] Gateway responded with status ${res.status} for ${url}`);
          lastError = res.status;
          continue;
        }

        data = await res.json();
        console.log(`[fetch-ipfs-metadata] Successfully fetched data from ${url}`);
        break;
      } catch (innerErr) {
        console.error(`[fetch-ipfs-metadata] Error while fetching from ${url}:`, innerErr);
        lastError = innerErr;
      }
    }

    if (!data) {
      console.error("[fetch-ipfs-metadata] Failed to fetch from all gateways. Last error:", lastError);
      return NextResponse.json({ error: "Failed to fetch from all gateways" }, { status: 502 });
    }

    console.log("[fetch-ipfs-metadata] Returning metadata to client");
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("[fetch-ipfs-metadata] Unexpected server error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
