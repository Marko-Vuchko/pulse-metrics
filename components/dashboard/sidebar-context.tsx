"use client"

import * as React from "react"

const STORAGE_KEY = "pulse-sidebar-collapsed"

type SidebarContextValue = {
  collapsed: boolean
  setCollapsed: (value: boolean) => void
  toggle: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function subscribeCollapsed(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  window.addEventListener("pulse-sidebar", onStoreChange)
  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener("pulse-sidebar", onStoreChange)
  }
}

function getCollapsedSnapshot() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

function getCollapsedServerSnapshot() {
  return false
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const collapsed = React.useSyncExternalStore(
    subscribeCollapsed,
    getCollapsedSnapshot,
    getCollapsedServerSnapshot
  )

  const setCollapsed = React.useCallback((value: boolean) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0")
    } catch {
      // ignore quota / private mode
    }
    window.dispatchEvent(new Event("pulse-sidebar"))
  }, [])

  const toggle = React.useCallback(() => {
    setCollapsed(!collapsed)
  }, [collapsed, setCollapsed])

  const value = React.useMemo(
    () => ({ collapsed, setCollapsed, toggle }),
    [collapsed, setCollapsed, toggle]
  )

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) {
    throw new Error("useSidebar must be used within SidebarProvider")
  }
  return ctx
}
