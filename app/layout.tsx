import type { Metadata } from "next"
import { Geist, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { getSiteUrl } from "@/lib/site"
import { cn } from "@/lib/utils"

import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const siteUrl = getSiteUrl()

const siteDescription =
  "Premium SaaS analytics dashboard for indie hackers and small businesses. Built by Fluxis Labs."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PulseMetrics",
    template: "%s | PulseMetrics",
  },
  description: siteDescription,
  applicationName: "PulseMetrics",
  authors: [{ name: "Fluxis Labs" }],
  creator: "Fluxis Labs",
  publisher: "Fluxis Labs",
  keywords: [
    "PulseMetrics",
    "SaaS analytics",
    "MRR dashboard",
    "indie hackers",
    "Fluxis Labs",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "PulseMetrics",
    title: "PulseMetrics",
    description: siteDescription,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "PulseMetrics - SaaS analytics by Fluxis Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PulseMetrics",
    description: siteDescription,
    images: ["/og.jpg"],
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
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased font-sans",
        geist.variable,
        jetbrainsMono.variable
      )}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <a
          href="#main-content"
          className="bg-background text-foreground focus-visible:ring-ring sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-2xl focus:border focus:border-border focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus-visible:ring-3 focus-visible:outline-none"
        >
          Skip to content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors closeButton />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}
