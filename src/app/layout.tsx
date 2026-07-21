import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/session-provider";
import { DbSyncProvider } from "@/components/db-sync-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FAAB — Premium Luxury Fashion & Lifestyle",
  description:
    "Discover curated collections of premium fashion, accessories, and lifestyle products. Experience luxury redefined with FAAB's exclusive selection.",
  keywords: [
    "luxury fashion",
    "premium lifestyle",
    "designer clothing",
    "exclusive collections",
    "FAAB",
    "high-end fashion",
    "premium accessories",
  ],
  authors: [{ name: "FAAB" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "FAAB — Premium Luxury Fashion & Lifestyle",
    description:
      "Discover curated collections of premium fashion, accessories, and lifestyle products.",
    type: "website",
    siteName: "FAAB",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAAB — Premium Luxury Fashion",
    description:
      "Curated collections of premium fashion, accessories, and lifestyle products.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: ViewPort = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF9F7" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1918" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange={false}
          >
            <DbSyncProvider>
              {children}
            </DbSyncProvider>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}