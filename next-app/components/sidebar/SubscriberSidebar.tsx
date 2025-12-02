"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  CreditCard,
  Rss,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";

export default function SubscriberSidebar() {
  const pathname = usePathname();
  const { collapsed, toggleSidebar } = useSidebar();

  const links = [
    { name: "Home", href: "/", icon: Home },
    { name: "Explore", href: "/discover", icon: Compass },
    { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
    { name: "My Feed", href: "/feed", icon: Rss },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Help", href: "/help", icon: HelpCircle },
  ];

  return (
    <aside
      className={cn(
        "bg-card flex flex-col transition-all duration-300 h-screen rounded-3xl p-6",
        collapsed ? "w-24" : "w-64 "
      )}
    >
      {/* Collapse Button */}
      <button
        onClick={toggleSidebar}
        className="w-10 h-10 bg-primary absolute -top-2 -right-5 flex items-center justify-center 
             hover:bg-primary/90 text-primary-foreground transition rounded-full shadow-md"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <nav className="space-y-4 mt-4">
 

        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          const Icon = link.icon;

          return (
            <div key={link.href} className="transition-all duration-200">
              <Link
                href={link.href}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-3xl text-sm transition-all group shadow-sm",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-foreground hover:text-primary-foreground hover:bg-primary/90"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-all duration-300",
                    collapsed && "mx-auto"
                  )}
                />

                {!collapsed && (
                  <span className="transition-opacity duration-200 truncate">
                    {link.name}
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
