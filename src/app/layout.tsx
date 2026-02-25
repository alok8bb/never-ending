import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/components/theme-script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://reads.alk.pw"),
  title: "Never Ending",
  description: "Things worth reading, curated by Shreyansh & Alok",
  openGraph: {
    type: "website",
    siteName: "Never Ending",
    url: "https://reads.alk.pw",
    title: "Never Ending",
    description: "Things worth reading, curated by Shreyansh & Alok",
    images: [
      {
        url: "https://reads.alk.pw/og.png",
        width: 1200,
        height: 630,
        alt: "Never Ending",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Never Ending",
    description: "Things worth reading, curated by Shreyansh & Alok",
    images: [
      {
        url: "https://reads.alk.pw/og.png",
        width: 1200,
        height: 630,
        alt: "Never Ending",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
        <script
          defer
          src="https://analytics.alk.pw/script.js"
          data-website-id="7b643f91-c7a6-4aa7-9978-b0b3134bb69f"
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
