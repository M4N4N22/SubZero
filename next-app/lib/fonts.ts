import { Sora, JetBrains_Mono as FontMono } from "next/font/google";

export const fontSans = Sora({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});
