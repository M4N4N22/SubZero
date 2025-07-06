"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SubscriptionCard from "@/components/SubscriptionCard";
import Link from "next/link";

type Subscription = {
  status: "active" | "paused" | "cancelled";
  amount: string;
  service: string;
  frequency: string;
  nextPayment: string;
  icon?: React.ReactNode;
  date?: string;
};

const Dashboard = () => {
  const subscriptions: Subscription[] = [];
  const totalMonthly = subscriptions
    .filter((sub) => sub.status === "active")
    .reduce((total, sub) => total + parseFloat(sub.amount.replace("$", "")), 0);
  const upcomingPayments: Subscription[] = [];

  return (
    <div className="min-h-screen  ">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your autonomous subscriptions
            </p>
          </div>
          <Link href="/create">
            <Button className="hidden" variant="default" size="lg">
              Create Subscription
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Subscriptions
              </CardTitle>
              <div className="h-4 w-4 text-secondary">📊</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {subscriptions.filter((sub) => sub.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">
                +0 from last month
              </p>
            </CardContent>
          </Card>

          <Card className="">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Commitment
              </CardTitle>
              <div className="h-4 w-4 text-accent">💰</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ${totalMonthly.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Per month</p>
            </CardContent>
          </Card>

          <Card className="">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Next Payment
              </CardTitle>
              <div className="h-4 w-4 text-premium">📅</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">-</div>
              <p className="text-xs text-muted-foreground"></p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Subscriptions List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-foreground">
                Your Subscriptions
              </h2>
              <Button variant="outline" size="sm">
                Filter
              </Button>
            </div>

            <div className="space-y-4">
              {subscriptions.map((subscription, index) => (
                <SubscriptionCard
                  key={index}
                  service={subscription.service}
                  amount={subscription.amount}
                  frequency={subscription.frequency}
                  nextPayment={subscription.nextPayment}
                  status={subscription.status}
                  icon={subscription.icon}
                />
              ))}
            </div>

            {subscriptions.length === 0 && (
              <Card className="border border-dashed border-border">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-6xl mb-4">📱</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No subscriptions yet
                  </h3>
                  <p className="text-muted-foreground text-center mb-6"></p>
                  <Link href="/create">
                    <Button
                      className="hidden
                    "
                      variant="default"
                    >
                      Create Your First Subscription
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Upcoming Payments */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">
              Upcoming Payments
            </h2>

            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Next 7 Days</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingPayments.map((payment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {payment.service}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {payment.amount}
                      </p>
                      <p className="text-xs text-yellow-500">Pending</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className=" bg-muted/30">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Need Help?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Learn how to optimize your subscription management.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Docs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
