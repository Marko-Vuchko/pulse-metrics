"use server"

import { searchCustomersForCommand } from "@/lib/data/customers"
import type { CommandCustomerHit } from "@/types/customers"

export async function commandSearchCustomers(
  q: string
): Promise<CommandCustomerHit[]> {
  try {
    return await searchCustomersForCommand(q, 8)
  } catch {
    return []
  }
}
