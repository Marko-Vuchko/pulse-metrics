"use client"

import { useEffect } from "react"

const STORAGE_KEY = "pulse-onboarding-checklist"

/** Persist "Explore analytics" checklist progress without UI. */
export function MarkAnalyticsExplored() {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ exploredAnalytics: true })
      )
      window.dispatchEvent(new Event("pulse-onboarding"))
    } catch {
      // ignore
    }
  }, [])

  return null
}
