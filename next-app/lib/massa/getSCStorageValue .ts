import axios from "axios";

export const callSCFunction = async (
  targetAddress: string,
  targetFunction: string,
  paramBytes: number[], // raw bytes from Buffer.from(...)
  callerAddress = []     // optionally pass wallet address; empty string if read-only
): Promise<string | null> => {
  const base64Param = Buffer.from(paramBytes).toString("base64");

  const payload = {
    jsonrpc: "2.0",
    method: "execute_read_only_call",
    params: [
      callerAddress,      // must be string, not null
      targetAddress,
      targetFunction,
      base64Param,        // base64-encoded string
      0,                  // coins
      0,                  // fee
      10_000_000          // max_gas
    ],
    id: 0,
  };

  console.log("📤 Payload being sent to MASSA RPC:");
  console.log(JSON.stringify(payload, null, 2));

  try {
    const response = await axios.post("https://buildnet.massa.net/api/v2", payload);

    console.log("📥 Raw response from MASSA RPC:");
    console.dir(response.data, { depth: null });

    const base64Result = response.data?.result?.[0]?.result;

    if (!base64Result) {
      console.warn("⚠️ No result returned in SC response");
      return null;
    }

    const decoded = Buffer.from(base64Result, "base64").toString("utf-8");
    console.log("✅ Decoded response from SC:", decoded);

    return decoded;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("❌ Axios error during SC call:", err.message);
      console.error("🔎 Axios error response:", err.response?.data || "No response data");
    } else {
      console.error("❌ Unknown error during SC call:", err);
    }
    return null;
  }
};
