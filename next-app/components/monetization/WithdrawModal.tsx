"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MASSA_SC_ADDRESS } from "@/lib/constants";
import { useWithdrawEarnings } from "@/lib/massa/creator/useWithdrawEarnings";

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  maxAmount: number;
}

export function WithdrawModal({ open, onClose, maxAmount }: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const { withdraw, loading, error } = useWithdrawEarnings(MASSA_SC_ADDRESS);

  const handleSubmit = async () => {
    const num = Number(amount);

    if (isNaN(num) || num <= 0) {
      toast.error("Enter a valid withdrawal amount");
      return;
    }

    if (num > maxAmount) {
      toast.error("Withdrawal amount exceeds available balance");
      return;
    }

    try {
      const tx = await withdraw(num); // withdraw in MAS
      toast.success(`Withdrawal successful! Tx: ${tx.operationId}`);
      onClose();
      setAmount("");
    } catch (err) {
      toast.error("Withdrawal failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw Earnings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium">Available Balance</label>
            <div className="mt-1 p-2 border rounded-md bg-muted/30 text-sm">
              {maxAmount} MAS
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Amount to Withdraw (MAS)</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Processing..." : "Withdraw"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
