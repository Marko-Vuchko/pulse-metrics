import type { Metadata } from "next"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { getInitials } from "@/components/dashboard/nav"
import { SidebarProvider } from "@/components/dashboard/sidebar-context"
import { Topbar } from "@/components/dashboard/topbar"
import { PageFade } from "@/components/motion/page-fade"
import { listNotifications } from "@/lib/data/notifications"
import { E2E_MOCK_USER, isE2EMockSession } from "@/lib/e2e/mock"
import { createClient } from "@/lib/supabase/server"

const dashboardDescription =
  "PulseMetrics dashboard - overview KPIs, analytics, customers, and account settings."

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | PulseMetrics",
  },
  description: dashboardDescription,
  openGraph: {
    type: "website",
    siteName: "PulseMetrics",
    title: "Dashboard | PulseMetrics",
    description: dashboardDescription,
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
    title: "Dashboard | PulseMetrics",
    description: dashboardDescription,
    images: ["/og.jpg"],
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let email = "user@example.com"
  let fullName: string | null = null

  if (await isE2EMockSession()) {
    email = E2E_MOCK_USER.email
    fullName = E2E_MOCK_USER.fullName
  } else {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    email = user?.email ?? "user@example.com"

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle()

      fullName = profile?.full_name ?? null
    }
  }

  const initials = getInitials(fullName, email)
  const alerts = await listNotifications()

  return (
    <SidebarProvider>
      <div className="bg-atmosphere relative flex min-h-full flex-1">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-noise opacity-[0.035] dark:opacity-[0.06]"
        />

        <div className="relative z-10 flex min-h-full flex-1">
          <AppSidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar
              email={email}
              fullName={fullName}
              initials={initials}
              alerts={alerts}
            />
            <main
              id="main-content"
              tabIndex={-1}
              className="flex flex-1 flex-col p-4 md:p-6 outline-none"
            >
              <PageFade>{children}</PageFade>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
