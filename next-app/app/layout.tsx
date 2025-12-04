// next-app/app/layout.tsx
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/providers/query-provider";
import { ReactNode } from "react";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { SidebarProvider } from "@/context/SidebarContext";
import { CreatorModeProvider } from "@/context/CreatorModeContext";

export const metadata = {
  title: "SubZero",
  description: "",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <SidebarProvider>
          <QueryProvider>
            <TooltipProvider>
              <Toaster richColors position="bottom-right" />
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
              </ThemeProvider>
            </TooltipProvider>
          </QueryProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}
