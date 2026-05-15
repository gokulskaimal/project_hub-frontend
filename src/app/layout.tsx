import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/store/Providers";
import { Toaster } from "react-hot-toast";
import GlobalLoader from "@/components/ui/GlobalLoader";
import NextTopLoader from "nextjs-toploader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Hub | Premium Project Management",
  description:
    "The authoritative platform for modern project management and team efficiency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <NextTopLoader color="#2563EB" showSpinner={false} />
          <GlobalLoader />
          {children}
          <Toaster position="top-right" />
        </Providers>
        <script
          src="https://checkout.razorpay.com/v1/checkout.js"
          async
        ></script>
      </body>
    </html>
  );
}
