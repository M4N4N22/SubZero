"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  PlusCircle,
  User,
  Upload,
  FileText,
  DollarSign,
  Compass,
  CreditCard,
  Rss,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  const navSections = [
    {
      title: "For Creators",
      links: [
        { name: "Creator Dashboard", href: "/creator/dashboard", icon: Home },
        { name: "Profile", href: "/creator/profile", icon: User },
        { name: "Create Plan", href: "/creator/create", icon: PlusCircle },
        {
          name: "Upload Content",
          href: "/creator/upload-content",
          icon: Upload,
        },
        { name: "My Posts", href: "/creator/my-posts", icon: FileText },
        {
          name: "Monetization",
          href: "/creator/monetization",
          icon: DollarSign,
          comingSoon: true,
        },
      ],
    },
    {
      title: "For Subscribers",
      links: [
        { name: "Discover Creators", href: "/discover", icon: Compass },
        {
          name: "Manage Subscriptions",
          href: "/subscriptions",
          icon: CreditCard,
        },
        {
          name: "My Feed",
          href: "/subscriptions/feed",
          icon: Rss,
          comingSoon: true,
        },
      ],
    },
    {
      title: "Others",
      links: [
     
        { name: "Help / Docs", href: "/help", icon: HelpCircle },
      ],
    },
  ];

  return (
    <aside className="fixed top-[4rem] left-0 h-[calc(100vh-4rem)] w-64 bg-card p-6 flex flex-col z-50 ">
      <nav className="space-y-8 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs uppercase font-semibold tracking-widest text-foreground/50 mb-3">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.links.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);
                const Icon = link.icon;

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                        link.comingSoon
                          ? "text-foreground/40 cursor-not-allowed"
                          : isActive
                          ? "bg-primary text-white"
                          : "text-foreground/70 hover:text-white hover:bg-primary/90"
                      )}
                      aria-disabled={link.comingSoon}
                      onClick={(e) => link.comingSoon && e.preventDefault()}
                    >
                      <Icon className="w-4 h-4" />
                      {link.name}
                      {link.comingSoon && (
                        <span className="ml-auto text-[10px] uppercase bg-foreground/20 text-foreground/70 px-2 py-0.5 rounded">
                          Soon
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
