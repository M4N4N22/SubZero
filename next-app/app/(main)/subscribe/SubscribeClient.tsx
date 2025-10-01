"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getCreatorPlans } from "@/lib/massa/getCreatorPlans";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscriptionManager } from "@/lib/massa/useSubscriptionManager";
import { useSubscriptionStatus } from "@/lib/massa/useSubscriptionStatus";
import { formatAddress } from "@/lib/utils";
import { toast } from "sonner";

type CreatorPlan = {
  planId: string;
  planName: string;
  description: string;
  token: string;
  amount: string;
  frequency: string;
  createdAt: string;
};

const SC_ADDRESS = "AS12GNE7FDjsqQg6CGbzv65k1rmLt377cPtLSYu21y1VHCAQLnKEL";

// Child card for each plan
function PlanCard({
  plan,
  handleAction,
}: {
  plan: CreatorPlan;
  handleAction: (
    planId: string,
    action: "subscribe" | "pause" | "cancel",
    amount?: string
  ) => void;
}) {
  const { subscribed, loading, error } = useSubscriptionStatus(
    plan.planId,
    SC_ADDRESS
  );

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{plan.planName}</CardTitle>
      </CardHeader>
      <CardContent>
        {plan.description && <p className="mb-2 text-gray-700">{plan.description}</p>}
        <p className="mb-1"><strong>Amount:</strong> {plan.amount} MAS</p>
        <p className="mb-4"><strong>Renewal:</strong> {plan.frequency}</p>

        <div className="flex flex-col gap-2">
          {loading ? (
            <p>Checking subscription...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : !subscribed ? (
            <Button onClick={() => handleAction(plan.planId, "subscribe", plan.amount)}>
              Subscribe
            </Button>
          ) : (
            <>
              <p className="text-green-600 font-medium mb-2">
                You’re subscribed to this plan
              </p>
              <Button
                variant="destructive"
                onClick={() => toast.info("Wait 24hrs before cancelling subscription")}
              >
                Cancel Subscription
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SubscribeClient() {
  const searchParams = useSearchParams();
  const creatorAddress = searchParams.get("creator") || "";

  const [plans, setPlans] = useState<CreatorPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { manageSubscription, error: txError } = useSubscriptionManager();

  // Fetch plans
  useEffect(() => {
    if (!creatorAddress) return;

    const fetchPlans = async () => {
      setLoading(true);
      try {
        const result = await getCreatorPlans(creatorAddress);
        setPlans(result);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch plans");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [creatorAddress]);

  const handleAction = async (
    planId: string,
    action: "subscribe" | "pause" | "cancel",
    amount?: string
  ) => {
    try {
      await manageSubscription(planId, action, amount);
      toast.success(`${action} successful!`);
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to ${action} plan: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Subscribe to Creator</h1>
        <p className="text-white/50">{formatAddress(creatorAddress)}</p>
      </div>

      {loading && <p>Loading plans...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {txError && <p className="text-red-500">Transaction Error: {txError}</p>}

      <div className="grid gap-6 md:grid-cols-1">
        {plans.map((plan) => (
          <PlanCard key={plan.planId} plan={plan} handleAction={handleAction} />
        ))}
        {!loading && plans.length === 0 && <p>No plans available.</p>}
      </div>
    </div>
  );
}
