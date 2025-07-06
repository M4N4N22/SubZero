// next-app/app/layout.tsx
import "./globals.css";
//import '@rainbow-me/rainbowkit/styles.css';
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/providers/query-provider";
import { ReactNode } from "react";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";

//import { WagmiProvider } from "@/components/providers/wagmi-provider";
//import RainbowKitWrapper from "@/components/providers/rainbowkit-wrapper";


export const metadata = {
  title: "SubZero",
  description: "Bitcoin Invoice Factoring Protocol on Citrea zkRollup",
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
   
          <QueryProvider>
            <TooltipProvider>
              <Toaster richColors position="top-right" />
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
 
      </body>
    </html>
  );
}
