"use client";

import { useEffect } from "react";
import { useCreatorInsights } from "@/lib/massa/useCreatorInsights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { Loader2, RotateCcw } from "lucide-react";
import { format,parseISO  } from "date-fns";

interface CreatorInsightsProps {
  address?: string;
}

export default function CreatorInsights({ address }: CreatorInsightsProps) {
  const { insights, loading, reload } = useCreatorInsights(address);

  function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-md bg-black/80 backdrop-blur-md p-3 text-xs text-white shadow-md">
          <p className="font-semibold">
            {format(parseISO(label), "eeee, MMM d, yyyy")}
          </p>
          <p>{payload[0].value.toFixed(2)} MAS</p>
        </div>
      );
    }
    return null;
  }

  useEffect(() => {
    if (address) reload(address);
  }, [address]);

  if (loading || !insights) {
    return (
      <div className="flex justify-center items-center py-12 text-muted-foreground gap-2">
        <Loader2 className="animate-spin w-5 h-5" />
        Loading insights...
      </div>
    );
  }

  const { overview, plans, earningsGraph, subscribers } = insights;

  return (
    <div className="mt-10 space-y-8">
      {/* Header + Refresh Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium text-foreground">Overview</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => reload(address!)}
          className="flex items-center gap-1"
        >
          <RotateCcw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Subscribers</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-primary">
            {overview.totalSubscribers}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Subscribers</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-green-500">
            {overview.activeSubscribers}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-red-600">
            {overview.totalRevenue.toFixed(2)} MAS
          </CardContent>
        </Card>
      </div>

      {/* Earnings Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Over Time (MAS)</CardTitle>
        </CardHeader>
        <CardContent>
          {earningsGraph.length > 0 ? (
               <ResponsiveContainer width="100%" height={300}>
               <AreaChart data={earningsGraph}>
                 {/* Gradient fill */}
                 <defs>
                   <linearGradient id="earningsColor" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#015FFD" stopOpacity={0.4} />
                     <stop offset="80%" stopColor="#015FFD" stopOpacity={0.05} />
                   </linearGradient>
                 </defs>
         
                 {/* Area line */}
                 <Area
                   type="monotone"
                   dataKey="revenue"
                   stroke="#015FFD"
                   strokeWidth={2}
                   fill="url(#earningsColor)"
                 />
         
                 {/* X Axis */}
                 <XAxis
                   dataKey="date"
                   axisLine={false}
                   tickLine={false}
                   tickFormatter={(str) => {
                     const date = parseISO(str);
                     // Show label every 7 days for readability
                     return date.getDate() % 7 === 0 ? format(date, "MMM d") : "";
                   }}
                   tick={{ fill: "#888", fontSize: 12 }}
                 />
         
                 {/* Y Axis */}
                 <YAxis
                   axisLine={false}
                   tickLine={false}
                   tickCount={5}
                   tickFormatter={(num) => `${num.toFixed(2)}`}
                   tick={{ fill: "#888", fontSize: 12 }}
                 />
         
                 {/* Tooltip */}
                 <Tooltip content={<CustomTooltip />} />
         
                 {/* Subtle grid */}
                 <CartesianGrid opacity={0.1} vertical={false} />
               </AreaChart>
             </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">
              No revenue data yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Plan Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <p className="text-muted-foreground">No plans available.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card
                  key={plan.planId}
                  className="border border-border bg-muted/30"
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      {plan.planName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <div>Price: {plan.price} MAS</div>
                    <div>
                      Active Subs: {plan.activeSubscribers}/{plan.subscribers}
                    </div>
                    <div className="font-semibold">
                      Revenue: {plan.revenue.toFixed(2)} MAS
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscriber Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriber Details</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {subscribers.length === 0 ? (
            <p className="text-muted-foreground">No subscribers yet.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="text-left py-2 px-3">Wallet</th>
                  <th className="text-left py-2 px-3">Plan</th>
                  <th className="text-left py-2 px-3">Joined</th>
                  <th className="text-left py-2 px-3">Status</th>
                  <th className="text-left py-2 px-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s, i) => (
                  <tr
                    key={`${s.wallet}-${s.planId}-${i}`}
                    className="border-b border-border hover:bg-muted/10"
                  >
                    <td className="py-2 px-3">{s.wallet}</td>
                    <td className="py-2 px-3">{s.planName}</td>
                    <td className="py-2 px-3">
                      {s.joinedAt
                        ? format(new Date(s.joinedAt), "MMM d, yyyy")
                        : "-"}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          s.paused
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {s.paused ? "Paused" : "Active"}
                      </span>
                    </td>
                    <td className="py-2 px-3">{s.amount} MAS</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
