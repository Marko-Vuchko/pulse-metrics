import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata = {
  title: "Forgot password - PulseMetrics",
  description: "Reset your PulseMetrics account password.",
}

export default function ForgotPasswordPage() {
  return (
    <Card className="border-primary/15 bg-card/85 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-mono text-2xl tracking-tight">
          <h1 className="text-inherit">Forgot password</h1>
        </CardTitle>
        <CardDescription>
          Enter your email and we will send a reset link if an account exists.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  )
}
