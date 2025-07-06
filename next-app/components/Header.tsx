"use client";


import dynamic from "next/dynamic";
const WalletButton = dynamic(() => import("./WalletButton"), { ssr: false });

import Link from "next/link";
import { ModeToggle } from "./ThemeToggle";


import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card backdrop-blur-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  S
                </span>
              </div>
              <span className="text-xl font-semibold">SubZero</span>
            </div>
          </Link>

          {/* Middle: NavigationMenu */}
          <NavigationMenu>
            <NavigationMenuList className="hidden md:flex gap-6">
              <NavigationMenuItem>
                <NavigationMenuLink
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                  href="/home"
                >
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                  href="/dashboard"
                >
                  Dashboard
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                  href="/create"
                >
                  Create Plan
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                  href="/subscriptions"
                >
                  My Subscriptions
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right: Theme toggle & WalletButton */}
          <div className="flex items-center gap-4">
            <ModeToggle />
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
};
