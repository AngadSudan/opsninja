import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import PWARegister from "@/component/PWARegister";
import Providers from "@/component/Providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ops Ninja",
  description:
    "AI-powered operations workspace — turn meeting transcripts into structured action items with human approval.",
  applicationName: "Ops Ninja",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ops Ninja",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAFAF8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>
          {children}
        </Providers>
        <PWARegister />
      </body>
    </html>
  );
}
