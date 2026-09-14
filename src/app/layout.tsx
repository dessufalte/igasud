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
  metadataBase: new URL("https://studio.example"),
  title: {
    default: "Studio — Portfolio & Project Documentation",
    template: "%s · Studio",
  },
  description:
    "A minimalist portfolio showcasing shipped products, design systems, and open-source work — each with full project documentation, architecture notes, and roadmaps.",
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
  openGraph: {
    title: "Studio — Portfolio & Project Documentation",
    description:
      "A minimalist portfolio showcasing shipped products, design systems, and open-source work.",
    type: "website",
    siteName: "Studio",
    images: [
      {
        url: "/favicon.svg",
        width: 64,
        height: 64,
        alt: "Studio logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Studio — Portfolio",
    description:
      "A minimalist portfolio with full project documentation.",
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
