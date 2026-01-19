import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Lora } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Daily Reading | One Great Essay or Poem Every Day",
  description:
    "Discover a carefully selected essay or poem each day. Classic literature from Emerson, Thoreau, Dickinson, Frost, and more.",
  keywords: ["poetry", "essays", "daily reading", "literature", "classics"],
  authors: [{ name: "Daily Reading" }],
  openGraph: {
    title: "Daily Reading",
    description: "One great essay or poem every day",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
