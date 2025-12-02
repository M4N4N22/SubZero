"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ModeToggle } from "./ThemeToggle";
import { Switch } from "@/components/ui/switch";
import { useCreatorMode } from "@/context/CreatorModeContext";

const WalletButton = dynamic(() => import("./WalletButton"), { ssr: false });

export const Header = () => {
  const { creatorMode, setCreatorMode } = useCreatorMode();

  return (
    <header className="fixed top-0 left-6 right-6 py-4 px-8 bg-card rounded-b-3xl z-10">
      <div className="container mx-auto">
        <div className="flex justify-between items-start">
          {/* Left: Logo */}
          <div className="flex flex-col items-start gap-2 ">
            <Link href="/">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    S
                  </span>
                </div>
                <span className="text-xl font-medium text-foreground">
                  SubZero
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Theme toggle, CreatorMode toggle, Wallet */}
          <div className="flex items-center gap-3">
            <ModeToggle />
            <WalletButton />

            {/* Creator Mode Toggle */}
            <div className="flex items-center gap-2 border py-2 px-4 rounded-full bg-foreground/5">
              <span className="text-sm text-foreground font-medium ">
                Creator Mode
              </span>
              <Switch
                checked={creatorMode}
                onCheckedChange={(v) => setCreatorMode(v)}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
