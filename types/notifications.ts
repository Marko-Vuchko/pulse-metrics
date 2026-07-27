export type NotificationSeverity = "info" | "warning" | "success"

export type NotificationAlert = {
  id: string
  title: string
  description: string
  severity: NotificationSeverity
  href: string
  /** Relative label for display, e.g. "2h ago". */
  timeLabel: string
  unread: boolean
}
