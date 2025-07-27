"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import SubscriptionCard from "../SubscriptionCard";

type Plan = {
  planId: string;
  name: string;
  description: string;
  amount: string;
  token: string;
  frequency: string;
  createdAt: string;
  subscribers: number;
  revenue: string;
};

type Subscription = {
  subscriber: string;
  planId: string;
  subscribedAt: string;
  service: string;
  amount: string;
  frequency: string;
  nextPayment: string;
  status: "active" | "paused" | "cancelled";
};


const HomePage = () => {
  const createdPlans: Plan[] = []; // Cleared mock data
  const subscriptions: Subscription[] = [];

  return (
    <div className="min-h-screen  ">
      <div className="container mx-auto ">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to SubZero
          </h1>
          <p className="text-muted-foreground">
            Autonomous Web3 subscriptions for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Your Active Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscriptions.length > 0 ? (
                <div className="space-y-4">
                  {subscriptions.map((sub, index) => (
                    <SubscriptionCard key={index} {...sub} />
                  ))}
                  <Link href="/subscriptions">
                    <Button variant="outline" className="w-full mt-4">
                      View All
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  You&apos;re not subscribed to any plans yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center  justify-between">
                Your Created Plans
                <div className=" flex gap-2">
                  <Link href="/dashboard">
                    <Button variant="outline">Dashboard</Button>
                  </Link>
                  <Link href="/create">
                    <Button>Create New Plan</Button>
                  </Link>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {createdPlans.length > 0 ? (
                <div className="space-y-4">
                  {createdPlans.map((plan, index) => (
                    <div
                      key={index}
                      className="flex justify-between border-b border-border pb-2"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {plan.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {plan.subscribers} subscribers
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-foreground">
                          {plan.revenue}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {plan.frequency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  You haven&apos;t created any plans yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
