"use client"

import Link from "next/link"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { updatePasswordFromRecovery } from "@/app/actions/auth"
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
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/types/auth"

type ResetPasswordFormProps = {
  hasSession: boolean
}

export function ResetPasswordForm({ hasSession }: ResetPasswordFormProps) {
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  if (!hasSession) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          This reset link is invalid or expired. Request a new email from the
          forgot password page, then open the latest link.
        </p>
        <Link
          href="/forgot-password"
          className={cn(buttonVariants({ size: "lg" }), "w-full")}
        >
          Request a new link
        </Link>
      </div>
    )
  }

  function onSubmit(values: ResetPasswordInput) {
    startTransition(async () => {
      const result = await updatePasswordFromRecovery(values)

      if (result?.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof ResetPasswordInput, {
              message: messages[0],
            })
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
        <Field data-invalid={!!errors.password || undefined}>
          <FieldLabel htmlFor="reset_password">New password</FieldLabel>
          <Input
            id="reset_password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            disabled={isPending}
            {...register("password")}
          />
          <FieldError errors={[errors.password]} />
        </Field>

        <Field data-invalid={!!errors.confirmPassword || undefined}>
          <FieldLabel htmlFor="reset_confirm">Confirm password</FieldLabel>
          <Input
            id="reset_confirm"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={!!errors.confirmPassword}
            disabled={isPending}
            {...register("confirmPassword")}
          />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? "Updating..." : "Update password"}
      </Button>
    </form>
  )
}
