"use client";

import { ReactNode } from "react";
import { Header } from "@/components/Header";
import Sidebar from "@/components/Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-background text-white overflow-hidden">
      {/* Fixed Sidebar */}
      <div className="fixed top-0 left-0 h-full w-64 z-40">
        <Sidebar />
      </div>

      {/* Main Section */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Fixed Header */}
 
          <Header />


        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto pt-[6rem] px-20 pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}
