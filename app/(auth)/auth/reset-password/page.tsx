import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Reset password - PulseMetrics",
  description: "Choose a new password for your PulseMetrics account.",
}

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <Card className="border-primary/15 bg-card/85 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-mono text-2xl tracking-tight">
          <h1 className="text-inherit">Reset password</h1>
        </CardTitle>
        <CardDescription>
          Choose a new password for your account, then continue to the
          dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm hasSession={Boolean(user)} />
      </CardContent>
    </Card>
  )
}
