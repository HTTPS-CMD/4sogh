import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "چهارسوق",
  description: "اولین پلترفم جامع کسب و کار",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      {/* این ویژگی را حتماً به بادی اضافه کنید */}
      <body suppressHydrationWarning className="...">
        {children}
      </body>
    </html>
  );
}
