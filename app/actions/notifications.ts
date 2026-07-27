"use server"

import { revalidatePath } from "next/cache"

import { markNotificationsRead } from "@/lib/data/notifications"

export async function markNotificationReadAction(
  id: string
): Promise<{ error?: string; success?: boolean }> {
  const result = await markNotificationsRead({ ids: [id] })
  if (result.success) {
    revalidatePath("/dashboard", "layout")
  }
  return result
}

export async function markAllNotificationsReadAction(): Promise<{
  error?: string
  success?: boolean
}> {
  const result = await markNotificationsRead({ all: true })
  if (result.success) {
    revalidatePath("/dashboard", "layout")
  }
  return result
}
