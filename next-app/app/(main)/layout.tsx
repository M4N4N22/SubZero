"use client";

import { ReactNode } from "react";
import { Header } from "@/components/Header";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="relative min-h-screen w-full bg-background">
      {/* Top 30% background overlay */}
      <div className=" top-0 left-0 w-full h-[40vh] bg-foreground/10 pointer-events-none z-0 absolute" />

      {/* Content Layer */}
      <div className="relative z-10 px-40 py-20">
        <Header />
        <main className="pt-16 px-6 pb-6">{children}</main>
      </div>
    </div>
  );
}
