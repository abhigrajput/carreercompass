import type { Metadata } from "next";
import { Syne, Outfit, Noto_Sans_Kannada } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/components/AppProviders";
import { ConditionalNavbar } from "@/components/ConditionalNavbar";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const kannada = Noto_Sans_Kannada({
  subsets: ["kannada"],
  variable: "--font-noto-kannada",
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareerCompass Karnataka — AI Career Guide for Students | ಕನ್ನಡ",
  description:
    "Free AI-powered career guidance for Karnataka students in Class 10, 11, 12. Find your path in Kannada, Hindi or English. Bengaluru, Mysuru, Hubballi.",
  keywords:
    "career guidance Karnataka, career counselling Bangalore, SSLC career, Karnataka CET guidance, Kannada career guide, class 10 career",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    title: "CareerCompass Karnataka",
    description: "Find your career path. Free. In Kannada.",
    url: "https://careercompass.vercel.app",
    siteName: "CareerCompass Karnataka",
    locale: "kn_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CareerCompass Karnataka",
    description: "Free AI career guide for Karnataka students",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          outfit.className,
          syne.variable,
          outfit.variable,
          kannada.variable,
        )}
      >
        <AppProviders>
          <ConditionalNavbar />
          <main className="min-h-screen">{children}</main>
        </AppProviders>
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        ) : null}
      </body>
    </html>
  );
}
