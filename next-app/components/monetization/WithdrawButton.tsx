"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WithdrawModal } from "./WithdrawModal";

export function WithdrawButton({ balance }: { balance: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className="mt-4 w-36" onClick={() => setOpen(true)}>Withdraw</Button>
      
      <WithdrawModal 
        open={open} 
        onClose={() => setOpen(false)} 
        maxAmount={balance}
      />
    </>
  );
}
