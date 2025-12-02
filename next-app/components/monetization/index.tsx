"use client";

import { useBearby } from "@/hooks/useBearby";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { MASSA_SC_ADDRESS } from "@/lib/constants";
import { WithdrawButton } from "@/components/monetization/WithdrawButton";
import { useCreatorBalance } from "@/lib/massa/creator/useCreatorBalance";
import { useWithdrawalHistory } from "@/lib/massa/creator/useWithdrawalHistory";
import { useWithdrawEarnings } from "@/lib/massa/creator/useWithdrawEarnings";

const Monetization = () => {
  const { connected, address } = useBearby();

  // IMPORTANT: use SC address, NOT wallet address
  const {
    balance,
    loading: balanceLoading,
    error: balanceError,
  } = useCreatorBalance(MASSA_SC_ADDRESS);

  const {
    history: withdrawalHistory,
    loading: historyLoading,
    error: historyError,
  } = useWithdrawalHistory(MASSA_SC_ADDRESS);

  const {
    withdraw,
    loading: withdrawLoading,
    error: withdrawError,
  } = useWithdrawEarnings(MASSA_SC_ADDRESS);



  return (
    <div className="min-h-screen">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-1">
              Monetization
            </h1>
            <p className="text-muted-foreground">
              Manage payouts, withdrawal settings, and financial controls.
            </p>
          </div>
        </div>

        {/* Balance Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              Available Balance
            </CardTitle>
          </CardHeader>

          <CardContent>
            {balanceLoading ? (
              <div className="text-muted-foreground">Loading balance...</div>
            ) : balanceError ? (
              <div className="text-red-500">{balanceError}</div>
            ) : (
              <div className="text-4xl font-bold">{balance} MAS</div>
            )}

            <p className="text-muted-foreground text-sm mt-2">
              This is your withdrawable earnings accumulated from subscriber
              payments.
            </p>

            <WithdrawButton balance={balance ?? 0} />

            {withdrawError && (
              <div className="text-red-500 text-sm mt-2">{withdrawError}</div>
            )}
          </CardContent>
        </Card>

        {/* Payout Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              Payout Settings
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-sm font-medium mb-2">Payout Wallet</div>
            <div className="p-3 border rounded-lg bg-muted/20 text-sm break-all">
              {address || "Connect wallet"}
            </div>

            <p className="text-muted-foreground text-sm mt-3">
              Your Massa wallet automatically receives payouts after you
              withdraw.
            </p>
          </CardContent>
        </Card>

        {/* Withdrawal History */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              Withdrawal History
            </CardTitle>
          </CardHeader>

          <CardContent>
            {historyLoading ? (
              <div className="text-muted-foreground">Loading history...</div>
            ) : historyError ? (
              <div className="text-red-500">{historyError}</div>
            ) : withdrawalHistory.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                No withdrawals made yet.
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawalHistory.map((w, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg flex flex-col gap-1"
                  >
                    <div className="text-sm">
                      <span className="font-medium">Amount:</span> {w.amount}{" "}
                      MAS
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {new Date(w.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Monetization;
