import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata = {
  title: "Sign up - PulseMetrics",
  description: "Create a PulseMetrics account.",
}

export default function SignupPage() {
  return (
    <Card className="border-primary/15 bg-card/85 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-mono text-2xl tracking-tight">
          <h1 className="text-inherit">Create account</h1>
        </CardTitle>
        <CardDescription>
          Sign up with email and password. We will send a confirmation link to
          your inbox.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
    </Card>
  )
}
