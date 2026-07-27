import type { LucideIcon } from "lucide-react"
import {
  BarChart3Icon,
  CreditCardIcon,
  DatabaseIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UserCircleIcon,
  UsersIcon,
  UsersRoundIcon,
} from "lucide-react"

export type DashboardNavItem = {
  title: string
  href: string
  icon: LucideIcon
}

export type DashboardNavGroup = {
  label: string
  items: DashboardNavItem[]
}

export const dashboardNavGroups: DashboardNavGroup[] = [
  {
    label: "Dashboard",
    items: [
      {
        title: "Overview",
        href: "/dashboard",
        icon: LayoutDashboardIcon,
      },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3Icon,
      },
      {
        title: "Metrics",
        href: "/dashboard/metrics",
        icon: DatabaseIcon,
      },
    ],
  },
  {
    label: "Customers",
    items: [
      {
        title: "Customers",
        href: "/dashboard/customers",
        icon: UsersIcon,
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        title: "Team",
        href: "/dashboard/team",
        icon: UsersRoundIcon,
      },
      {
        title: "Billing",
        href: "/dashboard/billing",
        icon: CreditCardIcon,
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: SettingsIcon,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        title: "Account",
        href: "/dashboard/account",
        icon: UserCircleIcon,
      },
    ],
  },
]

export function getPageTitle(pathname: string): string {
  if (
    pathname.startsWith("/dashboard/customers/") &&
    pathname !== "/dashboard/customers"
  ) {
    return "Customer"
  }

  for (const group of dashboardNavGroups) {
    for (const item of group.items) {
      if (item.href === pathname) {
        return item.title
      }
    }
  }

  return "Dashboard"
}

export function getInitials(
  fullName: string | null | undefined,
  email: string
): string {
  const name = fullName?.trim()

  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  return email.slice(0, 2).toUpperCase()
}
