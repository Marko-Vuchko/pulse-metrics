"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { requestPasswordReset } from "@/app/actions/auth"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/types/auth"

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [sentTo, setSentTo] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  function onSubmit(values: ForgotPasswordInput) {
    startTransition(async () => {
      const result = await requestPasswordReset(values)

      if (result?.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof ForgotPasswordInput, {
              message: messages[0],
            })
          }
        }
      }

      if (result?.error) {
        toast.error(result.error)
        return
      }

      if (result?.success) {
        setSentTo(values.email.trim())
        toast.success("Reset email sent")
      }
    })
  }

  if (sentTo) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          If an account exists for{" "}
          <span className="font-medium text-foreground">{sentTo}</span>, we
          sent a password reset link. Open it to choose a new password.
        </p>
        <p className="text-sm text-muted-foreground">
          Check spam if you do not see it within a few minutes. The link expires
          after a short time.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setSentTo(null)}
          >
            Try another email
          </Button>
          <Link
            href="/login"
            className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <FieldGroup className="gap-4">
        <Field data-invalid={!!errors.email || undefined}>
          <FieldLabel htmlFor="forgot_email">Email</FieldLabel>
          <Input
            id="forgot_email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={!!errors.email}
            disabled={isPending}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? "Sending..." : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
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
