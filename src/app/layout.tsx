import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio.example"),
  title: {
    default: "Portfolio — Apple Developer Academy",
    template: "%s · Portfolio",
  },
  description:
    "IT project showcase portfolio — a slide-based gallery of projects with descriptions, roles, and publication links.",
  keywords: [
    "portfolio",
    "project documentation",
    "design systems",
    "next.js",
    "glassmorphism",
    "typescript",
    "developer portfolio",
  ],
  authors: [{ name: "Studio" }],
  creator: "Studio",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.svg"],
    apple: [{ url: "/favicon.svg" }],
  },
  alternates: {
    types: {
      "application/rss+xml": "/api/feed.xml",
    },
  },
  openGraph: {
    title: "Studio — Portfolio & Project Documentation",
    description:
      "A minimalist portfolio showcasing shipped products, design systems, and open-source work.",
    type: "website",
    siteName: "Studio",
    images: [
      {
        url: "/og-image.png",
        width: 1344,
        height: 768,
        alt: "Studio — Portfolio & Project Documentation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Studio — Portfolio",
    description:
      "A minimalist portfolio with full project documentation.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrains.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
