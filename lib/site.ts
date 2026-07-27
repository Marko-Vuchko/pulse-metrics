const fallbackSiteUrl = "http://localhost:3000"

/** Canonical site origin without trailing slash. */
export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? fallbackSiteUrl
  )
}
