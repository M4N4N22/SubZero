"use client";

import { useState } from "react";
import { SmartContract, Args } from "@massalabs/massa-web3";
import { getWallets } from "@massalabs/wallet-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSubscriptionManager } from "@/lib/massa/useSubscriptionManager";
import { useSubscriptionStatus } from "@/lib/massa/useSubscriptionStatus";

type Plan = {
  planId: string;
  name: string;
  frequency: string;
  amount: string;
};

const SC_ADDRESS = "AS1g86F28S7N8GQ33oysd8wm6SSmNMyZxhgLJVybxLc44bM9Bvqw";

export default function ViewPlans({
  creatorAddress,
}: {
  creatorAddress: string;
}) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { manageSubscription } = useSubscriptionManager();

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const wallets = await getWallets();
      if (!wallets.length) throw new Error("No wallets found");

      const wallet = wallets[0];
      await wallet.connect();
      const accounts = await wallet.accounts();
      const provider = accounts[0];

      const contract = new SmartContract(provider, SC_ADDRESS);
      const res = await contract.read(
        "getPlansByCreator",
        new Args().addString(creatorAddress),
        { maxGas: BigInt(500_000_000) }
      );

      const args = new Args(res.value);
      const parsedPlans: Plan[] = [];

      try {
        while (true) {
          const planId = args.nextString();
          const planName = args.nextString();
          const frequency = args.nextString();
          args.nextU32(); // placeholder
          const amount = args.nextString();

          parsedPlans.push({
            planId,
            name: planName,
            frequency,
            amount,
          });
        }
      } catch {
        // end of args
      }

      setPlans(parsedPlans);
    } catch (err) {
      console.error("Error fetching plans:", err);
      toast.error("Failed to load plans for this creator.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    planId: string,
    action: "subscribe" | "pause" | "cancel",
    amount?: string,
    refresh?: () => void
  ) => {
    try {
      await manageSubscription(planId, action, amount);
      toast.success(
        action === "subscribe"
          ? "Subscribed successfully!"
          : "Subscription cancelled!"
      );
      refresh?.();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.message
          ? `Failed to ${action}: ${err.message}`
          : `Unable to ${action} right now`
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full"
          variant="outline"
          size="sm"
          onClick={() => {
            setOpen(true);
            fetchPlans();
          }}
        >
          View Plans
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg bg-background border border-border">
        <DialogHeader>
          <DialogTitle>Creator Plans</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            No plans found for this creator.
          </div>
        ) : (
          <div className="grid gap-4">
            {plans.map((plan) => (
              <PlanCard
                key={plan.planId}
                plan={plan}
                handleAction={handleAction}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------------------------- */
/* -------------------- PLAN CARD ---------------------- */
/* ---------------------------------------------------- */

function PlanCard({
  plan,
  handleAction,
}: {
  plan: Plan;
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
    <Card className="p-4 border border-border hover:bg-muted/30 transition">
      <div className="flex justify-between mb-2">
        <div>
          <p className="font-semibold text-lg">{plan.name}</p>
          <p className="text-sm text-muted-foreground">
            {plan.frequency} • {plan.amount} MAS
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">
          Checking subscription...
        </p>
      ) : error ? (
        <p className="text-sm text-red-500">Error: {error}</p>
      ) : !subscribed ? (
        <Button
          disabled={isProcessing}
          onClick={() => handleClick("subscribe", plan.amount)}
          className="mt-2 w-full"
        >
          {isProcessing ? "Processing..." : "Subscribe"}
        </Button>
      ) : (
        <div className="flex flex-col gap-2 mt-2">
          <p className="text-green-600 font-medium text-sm">
            You’re subscribed to this plan
          </p>
          <Button
            variant="destructive"
            disabled={isProcessing}
            onClick={() => {
              toast.info("This feature is in development");
            }}
          >
            Cancel Subscription
          </Button>
        </div>
      )}
    </Card>
  );
}
