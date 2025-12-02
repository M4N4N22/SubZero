"use client";

import { ReactNode } from "react";
import { Header } from "@/components/Header";
import CreatorSidebar from "@/components/sidebar/CreatorSidebar";
import SubscriberSidebar from "@/components/sidebar/SubscriberSidebar";
import { usePathname } from "next/navigation";
import { useCreatorMode } from "@/context/CreatorModeContext";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const { creatorMode, transitioning } = useCreatorMode();
  const { collapsed } = useSidebar();

  const isCreatorRoute = creatorMode || pathname.startsWith("/creator");

  return (
    <div
      className={cn(
        "flex h-screen w-full bg-background overflow-hidden transition-all duration-300 ease-out",
        transitioning ? "opacity-50 " : "opacity-100"
      )}
    >
      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-[6rem] left-6  transition-all duration-300 ease-out z-10 ",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {isCreatorRoute ? <CreatorSidebar /> : <SubscriberSidebar />}
      </div>

      {/* Main content */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-out",
          collapsed ? "ml-20" : "ml-64"
        )}
      >
        <Header />
        <main className="flex-1 overflow-y-auto px-20 py-32">
          {children}
        </main>
      </div>
    </div>
  );
}
