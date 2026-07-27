import Link from "next/link"
import { ExternalLink } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Set up Google sign-in - PulseMetrics",
  description:
    "Step-by-step checklist to enable Google OAuth for PulseMetrics with Supabase.",
}

const STEPS = [
  {
    title: "Open Google Cloud",
    body: "Create or select a Google Cloud project, then open Google Auth Platform (APIs & Services → OAuth / Google Auth).",
  },
  {
    title: "Configure consent and scopes",
    body: "Set audience and branding. Ensure scopes include openid, userinfo.email, and userinfo.profile.",
  },
  {
    title: "Create a Web OAuth client",
    body: "Create an OAuth client ID of type Web application. Add Authorized JavaScript origins for local and production hosts (for example http://localhost:3000).",
  },
  {
    title: "Add the Supabase redirect URI",
    body: "Under Authorized redirect URIs, paste the callback from your hosted Supabase Google provider page: https://<project-ref>.supabase.co/auth/v1/callback.",
  },
  {
    title: "Enable Google in Supabase",
    body: "In the hosted Supabase dashboard, open Authentication → Providers → Google. Paste the Client ID and Client Secret, then enable the provider.",
  },
  {
    title: "Allow the app callback URL",
    body: "Under Authentication → URL configuration, add Redirect URLs for http://localhost:3000/auth/callback and your production /auth/callback. PulseMetrics already ships this route for the PKCE code exchange.",
  },
] as const

export default function SetupGooglePage() {
  return (
    <Card className="border-primary/15 bg-card/85 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-mono text-2xl tracking-tight">
          Set up Google sign-in
        </CardTitle>
        <CardDescription>
          Scoped on purpose for portfolio demos - not an unfinished login. The{" "}
          <code className="font-mono text-xs">/auth/callback</code> route
          already completes the PKCE exchange. Follow this checklist when you
          want live Google on hosted Supabase; email and password stay the
          primary review path.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <ol className="space-y-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span
                aria-hidden
                className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-semibold text-primary"
              >
                {index + 1}
              </span>
              <div className="space-y-1">
                <p className="font-medium text-foreground">{step.title}</p>
                <p className="text-sm text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="rounded-2xl border border-border/80 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Already prepared</p>
          <p className="mt-1">
            The app callback at{" "}
            <code className="font-mono text-xs text-foreground">
              /auth/callback
            </code>{" "}
            exchanges the OAuth code for a session. After credentials are
            configured, point{" "}
            <code className="font-mono text-xs text-foreground">
              signInWithOAuth
            </code>{" "}
            at that URL - no extra route work required.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            href="https://supabase.com/dashboard/project/_/auth/providers"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full gap-2 sm:w-auto"
            )}
          >
            Supabase providers
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
          <a
            href="https://supabase.com/docs/guides/auth/social-login/auth-google"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full gap-2 sm:w-auto"
            )}
          >
            Google guide
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        </div>
      </CardContent>
      <CardFooter>
        <Link
          href="/login"
          className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
        >
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  )
}
