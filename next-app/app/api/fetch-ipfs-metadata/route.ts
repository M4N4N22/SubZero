export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

type CacheEntry = {
  data: any;
  timestamp: number;
};

const metadataCache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cid = searchParams.get("cid");
  const refresh = searchParams.get("refresh") === "true";

  if (!cid) {
    console.warn("[fetch-ipfs-metadata] ❌ Missing CID parameter");
    return NextResponse.json({ error: "CID is required" }, { status: 400 });
  }

  console.log("\n==============================");
  console.log(`[fetch-ipfs-metadata] Incoming request for CID: ${cid}`);
  console.log(`[Cache Info] Current entries: ${metadataCache.size}`);

  const now = Date.now();
  const cached = metadataCache.get(cid);
  const isExpired = cached && now - cached.timestamp > CACHE_TTL;

  if (cached && !isExpired && !refresh) {
    const age = ((now - cached.timestamp) / 1000).toFixed(1);
    const ttlRemaining = ((CACHE_TTL - (now - cached.timestamp)) / 1000).toFixed(1);
    console.log(`[Cache] ✅ HIT for CID: ${cid}`);
    console.log(`         Cached ${age}s ago, TTL remaining: ${ttlRemaining}s`);
    console.log(`[Cache] Data keys: ${Object.keys(cached.data || {}).join(", ") || "none"}`);
    console.log("==============================\n");
    return NextResponse.json(cached.data, { headers: { "X-Cache": "HIT" } });
  }

  console.log(
    `[Cache] ${
      cached ? (isExpired ? "⚠️ EXPIRED" : "♻️ REFRESH FORCED")
              : "🚫 MISS"
    } for CID: ${cid}`
  );

  if (cached && isExpired)
    console.log(`         Cached entry was ${((now - cached.timestamp) / 1000).toFixed(1)}s old`);

  const gateways = [
    `https://gateway.pinata.cloud/ipfs/${cid}`,
    `https://ipfs.io/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
  ];

  console.log(`[fetch-ipfs-metadata] Trying ${gateways.length} gateways...`);

  let data: any = null;
  let usedGateway: string | null = null;

  for (const url of gateways) {
    try {
      console.log(`[Gateway Attempt] Fetching from ${url}`);
      const res = await fetch(url, { method: "GET" });

      if (!res.ok) {
        console.warn(`[Gateway] ❌ ${url} responded with ${res.status}`);
        continue;
      }

      data = await res.json();
      usedGateway = url;
      console.log(`[Gateway] ✅ Success from ${url}`);

      // 🔍 Log summary of fetched data
      try {
        const dataPreview = JSON.stringify(data).slice(0, 500);
        console.log(`[Data] 📦 Size: ${dataPreview.length} chars`);
        console.log(`[Data] 🔑 Keys: ${Object.keys(data).join(", ") || "none"}`);
        console.log(`[Data] Preview: ${dataPreview}${dataPreview.length === 500 ? "..." : ""}`);
      } catch (e) {
        console.warn("[Data] ⚠️ Unable to stringify fetched data:", e);
      }

      break;
    } catch (err) {
      console.error(`[Gateway] 💥 Error fetching from ${url}:`, err);
    }
  }

  if (!data) {
    console.error("[fetch-ipfs-metadata] ❌ Failed to fetch from all gateways");
    console.log("==============================\n");
    return NextResponse.json({ error: "Failed to fetch from all gateways" }, { status: 502 });
  }

  // Cache the new result
  metadataCache.set(cid, { data, timestamp: now });
  console.log(`[Cache] 🆕 Stored CID ${cid} at ${new Date(now).toISOString()}`);
  console.log(`[Cache] ✅ Total cache entries: ${metadataCache.size}`);
  if (usedGateway) console.log(`[Cache] Data source: ${usedGateway}`);
  console.log("==============================\n");

  return NextResponse.json(data, { headers: { "X-Cache": "MISS" } });
}
