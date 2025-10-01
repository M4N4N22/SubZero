"use client";

import { useEffect, useState } from "react";
import { useBearby } from "@/hooks/useBearby";
import { getCreatorPlans } from "@/lib/massa/getCreatorPlans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
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

const CreatorDashboard = () => {
  const { connected, address } = useBearby();
  const [createdPlans, setCreatedPlans] = useState<CreatorPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharedLinks, setSharedLinks] = useState<Record<string, string>>({});
  const handleWithdraw = () => {
    toast.info("Withdraw your earning coming soon!");
  };

  useEffect(() => {
    const loadPlans = async () => {
      if (!connected || !address) return;

      try {
        const plans = await getCreatorPlans(address);
        setCreatedPlans(plans);
      } catch (err) {
        console.error("Failed to fetch creator plans:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [connected, address]);

  const generateShareLink = (planId: string) => {
    const link = `${window.location.origin}/subscribe?creator=${address}&planId=${planId}`;
    setSharedLinks((prev) => ({ ...prev, [planId]: link }));
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto">
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Creator Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage and track your subscription plans
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/create">
              <Button>Create New Plan</Button>
            </Link>
            <Button variant="outline" onClick={handleWithdraw}>
              Withdraw
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-muted-foreground text-center">
            Loading plans...
          </div>
        ) : createdPlans.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {createdPlans.map((plan, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">
                    {plan.planName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-1">
                    Plan ID: {plan.planId}
                  </div>
                  <div className="text-sm text-muted-foreground mb-1 hidden">
                    Description: {plan.description}
                  </div>
                  <div className="text-sm text-muted-foreground mb-1 hidden">
                    Token: {plan.token}
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Amount: {plan.amount} MAS
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Frequency: {plan.frequency}
                  </div>
                  <div className="text-sm text-muted-foreground mb-4 hidden">
                    Created At: {plan.createdAt}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => generateShareLink(plan.planId)}
                  >
                    Click to share Your Plan and start earning!
                  </Button>

                  {sharedLinks[plan.planId] && (
                    <div className="mt-2 p-4 border border-dashed rounded-xl text-sm break-all">
                      Ready to share Link:{" "}
                      <a
                        href={sharedLinks[plan.planId]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-500"
                      >
                        {sharedLinks[plan.planId]}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mt-8 border border-dashed">
            <CardContent className="py-12 text-center">
              <div className="text-4xl mb-4">📦</div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                No plans yet
              </h2>
              <p className="text-muted-foreground mb-6">
                You haven’t created any subscription plans. Start now to earn
                recurring income.
              </p>
              <Link href="/create">
                <Button>Create Your First Plan</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreatorDashboard;
