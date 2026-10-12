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
  metadataBase: new URL("https://igasud.tech"),
  title: {
    default: "Igasud Studio — Game Simulation Engine & Autonomous AI Lab",
    template: "%s · Igasud Studio",
  },
  description:
    "Igasud Studio develops high-throughput web-native game simulation engines with Component-Material Data Abstractions and dual-loop reinforcement learning paired with Anthropic Claude cognitive orchestration.",
  keywords: [
    "game simulation engine",
    "data-oriented design",
    "component-material abstraction",
    "reinforcement learning",
    "neuro-symbolic ai",
    "anthropic claude",
    "webgpu",
    "webassembly",
    "physics simulation",
    "igasud studio",
  ],
  authors: [{ name: "Igasud Studio" }],
  creator: "Igasud Studio",
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
    title: "Igasud Studio — Game Simulation Engine & Autonomous AI Lab",
    description:
      "High-performance deterministic web simulation engine with Component-Material abstractions and Claude-orchestrated reinforcement learning.",
    type: "website",
    siteName: "Igasud Studio",
    images: [
      {
        url: "/og-image.png",
        width: 1344,
        height: 768,
        alt: "Igasud Studio — Simulation Engine & AI Architecture",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Igasud Studio — Game Simulation Engine & Autonomous AI Lab",
    description:
      "High-performance deterministic web simulation engine with Component-Material abstractions and Claude-orchestrated reinforcement learning.",
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
