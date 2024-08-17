import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MyToaster from "@/app/components/my-toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Asset Uploader",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MyToaster />
        {children}
      </body>
    </html>
  );
}
