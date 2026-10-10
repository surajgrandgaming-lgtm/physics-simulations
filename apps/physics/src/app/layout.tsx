import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    template: "%s | TopCoaching",
    default: "TopCoaching Physics Simulations",
  },
  description:
    "Interactive 3D Physics simulations and challenges for JEE preparation.",
  keywords: ["JEE", "physics", "gamified learning", "3D challenges", "simulations"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-[#040712] text-slate-100 min-h-screen flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200`}>
        <div className="flex-1 w-full relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
