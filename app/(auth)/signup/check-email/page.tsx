import Link from "next/link"
import { Mail } from "lucide-react"

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
  title: "Check your email - PulseMetrics",
  description: "Confirm your email to finish signing up for PulseMetrics.",
}

type CheckEmailPageProps = {
  searchParams: Promise<{ email?: string }>
}

export default async function CheckEmailPage({
  searchParams,
}: CheckEmailPageProps) {
  const params = await searchParams
  const email = params.email?.trim()

  return (
    <Card className="border-primary/15 bg-card/85 backdrop-blur-sm">
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Mail className="size-5" aria-hidden />
        </div>
        <CardTitle className="font-mono text-2xl tracking-tight">
          Check your email
        </CardTitle>
        <CardDescription>
          {email ? (
            <>
              We sent a confirmation link to{" "}
              <span className="font-medium text-foreground">{email}</span>.
              Open it to activate your account, then sign in.
            </>
          ) : (
            <>
              We sent a confirmation link to your inbox. Open it to activate
              your account, then sign in.
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>
          Confirmation emails come from hosted Supabase Auth (real inbox - not
          a local mail catcher). Check spam if you do not see it within a few
          minutes.
        </p>
        <p>
          You cannot sign in until the link is confirmed. After confirming,
          return here and continue to sign in.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:flex-row">
        <Link
          href="/login"
          className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
        >
          Back to sign in
        </Link>
        <Link
          href="/signup"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "w-full sm:w-auto"
          )}
        >
          Use a different email
        </Link>
      </CardFooter>
    </Card>
  )
}
