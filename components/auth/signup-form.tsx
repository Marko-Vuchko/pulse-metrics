"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { toast } from "sonner"

import { signUp } from "@/app/actions/auth"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { signUpSchema, type SignUpInput } from "@/types/auth"

function passwordStrength(password: string): {
  score: number
  label: string
} {
  let score = 0
  if (password.length >= 6) score += 1
  if (password.length >= 10) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  const label =
    score <= 1
      ? "Weak"
      : score === 2
        ? "Fair"
        : score === 3
          ? "Good"
          : "Strong"

  return { score: Math.min(score, 4), label }
}

export function SignupForm() {
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const passwordValue = watch("password") ?? ""
  const strength = passwordStrength(passwordValue)
  function onSubmit(values: SignUpInput) {
    startTransition(async () => {
      const result = await signUp(values)

      if (result?.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof SignUpInput, { message: messages[0] })
          }
        }
      }

      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <FieldGroup className="gap-4">
        <Field data-invalid={!!errors.email || undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={!!errors.email}
            disabled={isPending}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={!!errors.password || undefined}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              aria-invalid={!!errors.password}
              disabled={isPending}
              className="pr-10"
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </Button>
          </div>
          {passwordValue ? (
            <div className="mt-2 space-y-1.5" aria-live="polite">
              <div className="flex gap-1">
                {Array.from({ length: 4 }).map((_, index) => (
                  <span
                    key={index}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      index < strength.score
                        ? strength.score <= 1
                          ? "bg-destructive"
                          : strength.score === 2
                            ? "bg-warning"
                            : "bg-success"
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <p className="font-mono text-[11px] text-muted-foreground">
                Strength: {strength.label}
              </p>
            </div>
          ) : null}
          <FieldError errors={[errors.password]} />
        </Field>

        <Field data-invalid={!!errors.confirmPassword || undefined}>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your password"
              aria-invalid={!!errors.confirmPassword}
              disabled={isPending}
              className="pr-10"
              {...register("confirmPassword")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
              aria-label={
                showConfirm ? "Hide confirm password" : "Show confirm password"
              }
              onClick={() => setShowConfirm((value) => !value)}
            >
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </Button>
          </div>
          <FieldError errors={[errors.confirmPassword]} />
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? "Creating account..." : "Create account"}
      </Button>

      <OAuthButtons />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
