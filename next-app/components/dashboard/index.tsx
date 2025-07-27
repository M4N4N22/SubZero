"use client";

import { useEffect, useState } from "react";
import { useBearby } from "@/hooks/useBearby"; // your custom hook
import { getCreatorPlans } from "@/lib/massa/getCreatorPlans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

type CreatorPlan = {
  name: string;
  frequency: string;
  subscribers: number;
  revenue: string;
};

const CreatorDashboard = () => {
  const { connected, address } = useBearby();
  const [createdPlans, setCreatedPlans] = useState<CreatorPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      console.log("🌀 Loading plans...");
      console.log("Wallet connected:", connected);
      console.log("Wallet address:", address);
  
      if (!connected || !address) {
        console.warn("❗ Wallet not connected or address missing, skipping fetch.");
        return;
      }
  
      try {
        const plans = await getCreatorPlans(address);
        console.log("✅ Plans fetched:", plans);
        setCreatedPlans(plans);
      } catch (err) {
        console.error("❌ Failed to fetch creator plans:", err);
      } finally {
        setLoading(false);
      }
    };
  
    loadPlans();
  }, [connected, address]);
  

  return (
    <div className="min-h-screen">
      <div className="container mx-auto ">
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
          </div>
        </div>

        {loading ? (
          <div className="text-muted-foreground text-center">
            Loading plans...
          </div>
        ) : createdPlans.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {createdPlans.map((plan, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">
                    {plan.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-2">
                    Frequency: {plan.frequency}
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">
                    Subscribers: {plan.subscribers}
                  </div>
                  <div className="text-sm font-medium text-foreground mb-4">
                    Revenue: {plan.revenue}
                  </div>
                  <Button variant="outline" className="w-full" disabled>
                    View Details
                  </Button>
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
