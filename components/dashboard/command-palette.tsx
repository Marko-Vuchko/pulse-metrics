"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  BarChart3Icon,
  CreditCardIcon,
  DatabaseIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MoonIcon,
  PlusIcon,
  SettingsIcon,
  SunIcon,
  UserCircleIcon,
  UsersIcon,
  UsersRoundIcon,
} from "lucide-react"

import { commandSearchCustomers } from "@/app/actions/command"
import { signOut } from "@/app/actions/auth"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import type { CommandCustomerHit } from "@/types/customers"

type CommandPaletteProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const NAV_ITEMS = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboardIcon,
    keywords: "home dashboard",
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3Icon,
    keywords: "charts metrics",
  },
  {
    title: "Metrics",
    href: "/dashboard/metrics",
    icon: DatabaseIcon,
    keywords: "ingest csv import upsert",
  },
  {
    title: "Customers",
    href: "/dashboard/customers",
    icon: UsersIcon,
    keywords: "roster crm",
  },
  {
    title: "Team",
    href: "/dashboard/team",
    icon: UsersRoundIcon,
    keywords: "invites members workspace",
  },
  {
    title: "Billing",
    href: "/dashboard/billing",
    icon: CreditCardIcon,
    keywords: "plans checkout subscription",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: SettingsIcon,
    keywords: "company profile",
  },
  {
    title: "Account",
    href: "/dashboard/account",
    icon: UserCircleIcon,
    keywords: "password security",
  },
] as const

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [query, setQuery] = React.useState("")
  const [customers, setCustomers] = React.useState<CommandCustomerHit[]>([])
  const [searching, setSearching] = React.useState(false)

  function handleOpenChange(next: boolean) {
    if (!next) {
      setQuery("")
      setCustomers([])
      setSearching(false)
    }
    onOpenChange(next)
  }

  React.useEffect(() => {
    if (!open) return

    let cancelled = false
    const handle = window.setTimeout(() => {
      setSearching(true)
      void commandSearchCustomers(query).then((hits) => {
        if (!cancelled) {
          setCustomers(hits)
          setSearching(false)
        }
      })
    }, 180)

    return () => {
      cancelled = true
      window.clearTimeout(handle)
    }
  }, [open, query])

  function run(action: () => void) {
    handleOpenChange(false)
    action()
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Command palette"
      description="Jump to a page, search customers, or run a quick action."
    >
      <CommandInput
        placeholder="Search pages, customers, actions..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {searching ? "Searching..." : "No results found."}
        </CommandEmpty>

        <CommandGroup heading="Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <CommandItem
                key={item.href}
                value={`${item.title} ${item.keywords}`}
                onSelect={() => run(() => router.push(item.href))}
              >
                <Icon />
                <span>{item.title}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>

        {customers.length > 0 ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Customers">
              {customers.map((customer) => (
                <CommandItem
                  key={customer.id}
                  value={`customer ${customer.name} ${customer.email} ${customer.company ?? ""}`}
                  onSelect={() =>
                    run(() =>
                      router.push(`/dashboard/customers/${customer.id}`)
                    )
                  }
                >
                  <UsersIcon />
                  <span className="min-w-0 flex-1 truncate">
                    {customer.name}
                    <span className="ml-2 text-muted-foreground">
                      {customer.email}
                    </span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}

        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            value="Add customer create new"
            onSelect={() =>
              run(() => router.push("/dashboard/customers?create=1"))
            }
          >
            <PlusIcon />
            <span>Add customer</span>
          </CommandItem>
          <CommandItem
            value="Toggle theme dark light"
            onSelect={() =>
              run(() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              )
            }
          >
            {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
            <span>Toggle theme</span>
            <CommandShortcut>T</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="Sign out logout"
            onSelect={() =>
              run(() => {
                void signOut()
              })
            }
          >
            <LogOutIcon />
            <span>Sign out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

export function useCommandPaletteHotkey(onOpen: () => void): void {
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        onOpen()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onOpen])
}
