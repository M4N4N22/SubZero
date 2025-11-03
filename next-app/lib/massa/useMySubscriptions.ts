// lib/massa/useMySubscriptions.ts
import { useEffect, useState } from "react";
import { getWallets } from "@massalabs/wallet-provider";
import { SmartContract, Args, bytesToStr } from "@massalabs/massa-web3";

export type MySubscription = {
  planId: string;
  planName: string;
  amount: string;
  frequency: string;
  createdAt: string; // ISO string
  paused: boolean;
  nextPayment: string; // ISO string
};

export function useMySubscriptions(scAddress: string) {
  const [subscriptions, setSubscriptions] = useState<MySubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [upcomingPayments, setUpcomingPayments] = useState<MySubscription[]>(
    []
  );

  useEffect(() => {
    if (!scAddress) return;

    const fetchSubscriptions = async () => {
      setLoading(true);
      setError(null);

      try {
        const wallets = await getWallets();
        if (!wallets.length) throw new Error("No wallets found");
        const wallet = wallets[0];
        await wallet.connect();
        const accounts = await wallet.accounts();
        const user = accounts[0].address.toLowerCase();
        console.log("Connected user:", user);

        const contract = new SmartContract(accounts[0], scAddress);
        console.log("Smart contract instance created at:", scAddress);

        // Get user's plan IDs
        const userSubsRaw = await contract.read(
          "getUserSubscriptions",
          new Args().addString(user)
        );
        const userSubsStr = bytesToStr(userSubsRaw.value);
        console.log("Raw user subscriptions string:", userSubsStr);

        const planIds = userSubsStr ? userSubsStr.split("|") : [];
        console.log("Parsed plan IDs:", planIds);

        // Fetch details for each plan
        const subs: MySubscription[] = await Promise.all(
          planIds.map(async (planId) => {
            const planRaw = await contract.read(
              "getPlan",
              new Args().addString(planId)
            );
            const planStr = bytesToStr(planRaw.value);
            const planData = planStr.split("|");
            console.log(`Plan data for ${planId}:`, planData);

            // paused status
            const pausedRaw = await contract.read(
              "isPaused",
              new Args().addString(planId).addString(user)
            );
            const paused = bytesToStr(pausedRaw.value) === "true";

            // subscription start timestamp
            // subscription start timestamp
            const timestampRaw = await contract.read(
              "getSubscriberTimestamp",
              new Args().addString(planId).addString(user)
            );
            const createdAtRaw = bytesToStr(timestampRaw.value);

            // safely convert timestamp → ISO string
            let createdAt: string;
            if (createdAtRaw && !isNaN(Number(createdAtRaw))) {
              createdAt = new Date(Number(createdAtRaw)).toISOString();
            } else {
              createdAt = new Date().toISOString(); // fallback
            }

            // calculate next payment
            const frequency = planData[4]; // e.g., "monthly"
            let nextPayment = new Date(createdAt);
            if (frequency === "monthly")
              nextPayment.setMonth(nextPayment.getMonth() + 1);
            else if (frequency === "weekly")
              nextPayment.setDate(nextPayment.getDate() + 7);

            return {
              planId,
              planName: planData[0],
              amount: planData[3],
              frequency,
              createdAt,
              paused,
              nextPayment: nextPayment.toISOString(),
            };
          })
        );

        console.log("Fetched subscriptions:", subs);
        setSubscriptions(subs);

        // 3️⃣ Total monthly commitment
        const total = subs
          .filter((s) => !s.paused)
          .reduce((sum, s) => sum + parseFloat(s.amount), 0);
        console.log("Total monthly commitment:", total);
        setTotalMonthly(total);

        // 4Upcoming payments (next 7 days)
        const upcoming = subs.filter((s) => {
          const next = new Date(s.nextPayment);
          const now = new Date();
          const in7Days = new Date();
          in7Days.setDate(now.getDate() + 7);
          return next > now && next <= in7Days && !s.paused;
        });
        console.log("Upcoming payments in next 7 days:", upcoming);
        setUpcomingPayments(upcoming);

        console.log("Finished fetching subscriptions");
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch subscriptions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [scAddress]);

  return { subscriptions, totalMonthly, upcomingPayments, loading, error };
}
