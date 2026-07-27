import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import {
  E2E_MOCK_COOKIE,
  isE2EMockAuthEnabled,
} from "@/lib/e2e/mock-auth"
import type { Database } from "@/types/database"

function applyAuthRedirects(
  request: NextRequest,
  response: NextResponse,
  user: unknown
) {
  const pathname = request.nextUrl.pathname

  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    const redirectResponse = NextResponse.redirect(url)
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  if (
    user &&
    (pathname.startsWith("/login") ||
      pathname.startsWith("/signup") ||
      pathname.startsWith("/forgot-password"))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    const redirectResponse = NextResponse.redirect(url)
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  return response
}

/** CI / Playwright mock auth - no Supabase session round-trip. */
function updateMockSession(request: NextRequest) {
  const response = NextResponse.next({ request })
  const mockUser =
    request.cookies.get(E2E_MOCK_COOKIE)?.value === "1" ? { mock: true } : null
  return applyAuthRedirects(request, response, mockUser)
}

export async function updateSession(request: NextRequest) {
  if (isE2EMockAuthEnabled()) {
    return updateMockSession(request)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and getClaims().
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  return applyAuthRedirects(request, supabaseResponse, user)
}
