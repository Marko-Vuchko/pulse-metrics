import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Sign in - PulseMetrics",
  description: "Sign in to your PulseMetrics account.",
}

export default function LoginPage() {
  return (
    <Card className="border-primary/15 bg-card/85 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-mono text-2xl tracking-tight">
          <h1 className="text-inherit">Sign in</h1>
        </CardTitle>
        <CardDescription>
          Enter your email and password to access your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  )
}
