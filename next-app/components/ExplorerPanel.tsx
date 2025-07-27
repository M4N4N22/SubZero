// components/ExplorerPanel.tsx
"use client";

import { useEffect, useState } from "react";
import { callSCFunction } from "@/lib/massa/getSCStorageValue "; // adjust path as needed

const SC_ADDRESS = "AS12jozNQsyMUTbohLjaBpbByYaTdWXJq1XraU5CdpbY4dxdJfhcG";
const CREATOR_ADDRESS = "AU1VYN4RdhJTMqdAiqywY9Ng6SAa84cPy744moZmNzBdCmTEmtvM";

interface Plan {
  name: string;
  description: string;
  token: string;
  amount: number;
  frequency: string;
}


export default function ExplorerPanel() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchPlansFromSC = async () => {
    setLoading(true);
  
    // SC expects serialized JSON string: ["AU1V..."]
    const serializedParams = JSON.stringify([CREATOR_ADDRESS]);
    const paramBytes = Buffer.from(serializedParams, "utf8");
  
    try {
      const decoded = await callSCFunction(
        SC_ADDRESS,
        "getPlansByCreator",
        Array.from(paramBytes) // as number[]
      );
  
      if (!decoded) {
        console.warn("No response from SC");
        return;
      }
  
      try {
        const parsed = JSON.parse(decoded);
        if (Array.isArray(parsed)) {
          setPlans(parsed);
        } else {
          console.warn("Unexpected format:", parsed);
        }
      } catch {
        console.error("Failed to parse decoded response:", decoded);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  

  useEffect(() => {
    fetchPlansFromSC();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📦 Subscription Plans</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-2">
          {plans.map((plan, idx) => (
            <li key={idx} className="border p-4 rounded bg-white/5">
              <pre className="text-sm text-gray-200">
                {JSON.stringify(plan, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
