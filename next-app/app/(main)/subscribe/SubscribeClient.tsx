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

const SC_ADDRESS = "AS1g86F28S7N8GQ33oysd8wm6SSmNMyZxhgLJVybxLc44bM9Bvqw";

function PlanCard({
  plan,
  handleAction,
}: {
  plan: CreatorPlan;
  handleAction: (
    planId: string,
    action: "subscribe" | "pause" | "cancel",
    amount?: string,
    refresh?: () => void
  ) => void;
}) {
  const { subscribed, loading, error, refresh } = useSubscriptionStatus(
    plan.planId,
    SC_ADDRESS
  );

  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async (
    action: "subscribe" | "cancel",
    amount?: string
  ) => {
    try {
      setIsProcessing(true);
      await handleAction(plan.planId, action, amount, refresh);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{plan.planName}</CardTitle>
      </CardHeader>
      <CardContent>
        {plan.description && (
          <p className="mb-2 text-gray-700">{plan.description}</p>
        )}
        <p className="mb-1">
          <strong>Amount:</strong> {plan.amount} MAS
        </p>
        <p className="mb-4">
          <strong>Renewal:</strong> {plan.frequency}
        </p>

        <div className="flex flex-col gap-2">
        {loading ? (
            <p>Checking subscription...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : !subscribed ? (
            <Button
              disabled={isProcessing}
              onClick={() => handleClick("subscribe", plan.amount)}
            >
              {isProcessing ? "Processing your request, hold on..." : "Subscribe"}
            </Button>
          ) : (
            <>
              <p className="text-green-600 font-medium mb-2">
                You’re subscribed to this plan
              </p>
              <Button
                variant="destructive"
                onClick={() =>
                  handleAction(plan.planId, "cancel", undefined, refresh)
                }
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

  useEffect(() => {
    if (!creatorAddress) {
      setLoading(false);
      setError("No creator address provided in URL");
      return;
    }

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
    amount?: string,
    refresh?: () => void
  ) => {
    try {
      await manageSubscription(planId, action, amount);
      toast.success(`${action === "subscribe" ? "Subscribed" : "Cancelled"} successfully!`);
      refresh?.(); // Refresh subscription status
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.message
          ? `Failed to ${action} plan: ${err.message}`
          : `Unable to ${action} at the moment`
      );
    }
  };

  if (!creatorAddress)
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <h2 className="text-2xl font-semibold">Invalid or Missing Creator</h2>
        <p className="text-muted-foreground mt-2">
          Please access this page with a valid <code>?creator=address</code> query.
        </p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto bg-card p-8 rounded-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Subscribe to Creator</h1>
        <p className="text-foreground/50">{formatAddress(creatorAddress)}</p>
      </div>

      {loading && <p>Loading plans...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {txError && <p className="text-red-500">Transaction Error: {txError}</p>}

      {!loading && !error && (
        <div className="grid gap-6 md:grid-cols-1">
          {plans.length > 0 ? (
            plans.map((plan) => (
              <PlanCard
                key={plan.planId}
                plan={plan}
                handleAction={handleAction}
              />
            ))
          ) : (
            <p className="text-foreground/70">
              The creator has no active plans.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
