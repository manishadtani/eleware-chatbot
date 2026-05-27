import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AiChatWrapper from "@/app/components/AiChatWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eleware Accounting – CA-Qualified Accounting & Advisory Services | Delhi NCR",
  description:
    "Modern accounting, tax strategy, GST filing, bookkeeping, and compliance services for ambitious businesses across Delhi NCR. Talk to our AI assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}


         <AiChatWrapper />
      </body>
    </html>
  );
}
