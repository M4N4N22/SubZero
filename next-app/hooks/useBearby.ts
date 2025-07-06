// hooks/useBearby.ts
import { useEffect, useState } from "react";
import { web3 } from "@hicaru/bearby.js";

export function useBearby() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    // If already connected, set state
    if (web3.wallet.connected) {
      setConnected(true);
      setAddress(web3.wallet.account.base58 ?? null);
    }

    // Subscribe to account changes
    const observer = web3.wallet.account.subscribe((base58) => {
      setConnected(true);
      setAddress(base58 ?? null);
    });

    return () => observer.unsubscribe();
  }, []);

  const connect = async () => {
    try {
      const result = await web3.wallet.connect();
      if (result) {
        setConnected(true);
        setAddress(web3.wallet.account.base58 ?? null);
      }
    } catch (error) {
      console.error("Bearby connect error:", error);
    }
  };

  const disconnect = async () => {
    try {
      await web3.wallet.disconnect();
      setConnected(false);
      setAddress(null);
    } catch (error) {
      console.error("Bearby disconnect error:", error);
    }
  };

  return {
    connected,
    address,
    connect,
    disconnect,
  };
}
