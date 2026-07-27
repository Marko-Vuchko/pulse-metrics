"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LogOutIcon } from "lucide-react"
import { toast } from "sonner"

import { signOut } from "@/app/actions/auth"
import { changePassword, updateAccountName } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  accountNameSchema,
  changePasswordSchema,
  type AccountNameInput,
  type ChangePasswordInput,
} from "@/types/profile"

type AccountFormsProps = {
  email: string
  fullName: string
}

export function AccountForms({ email, fullName }: AccountFormsProps) {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <AccountProfileCard email={email} fullName={fullName} />
      <ChangePasswordCard />
      <SignOutCard />
    </div>
  )
}

function AccountProfileCard({
  email,
  fullName,
}: {
  email: string
  fullName: string
}) {
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AccountNameInput>({
    resolver: zodResolver(accountNameSchema),
    defaultValues: {
      full_name: fullName,
    },
  })

  function onSubmit(values: AccountNameInput) {
    startTransition(async () => {
      const result = await updateAccountName(values)

      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof AccountNameInput, { message: messages[0] })
          }
        }
      }

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.success) {
        toast.success("Account updated")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Your email is fixed. Update the name shown in the dashboard.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                readOnly
                disabled
                autoComplete="email"
              />
              <FieldDescription>
                Email cannot be changed in this version.
              </FieldDescription>
            </Field>

            <Field data-invalid={!!errors.full_name || undefined}>
              <FieldLabel htmlFor="account_full_name">Full name</FieldLabel>
              <Input
                id="account_full_name"
                type="text"
                autoComplete="name"
                placeholder="Demo User"
                aria-invalid={!!errors.full_name}
                disabled={isPending}
                {...register("full_name")}
              />
              <FieldError errors={[errors.full_name]} />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="border-t">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save name"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

function ChangePasswordCard() {
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  function onSubmit(values: ChangePasswordInput) {
    startTransition(async () => {
      const result = await changePassword(values)

      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof ChangePasswordInput, {
              message: messages[0],
            })
          }
        }
      }

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.success) {
        reset()
        toast.success("Password updated")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          Choose a new password for your PulseMetrics account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent>
          <FieldGroup className="gap-4">
            <Field data-invalid={!!errors.password || undefined}>
              <FieldLabel htmlFor="password">New password</FieldLabel>
              <Input
                id="password"
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
              <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
              <Input
                id="confirmPassword"
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
        </CardContent>
        <CardFooter className="border-t">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Updating..." : "Update password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

function SignOutCard() {
  const [isPending, startTransition] = useTransition()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign out</CardTitle>
        <CardDescription>
          End your session on this device and return to the login page.
        </CardDescription>
      </CardHeader>
      <CardFooter className="border-t">
        <Button
          type="button"
          variant="destructive"
          disabled={isPending}
          onClick={() => {
            startTransition(() => {
              void signOut()
            })
          }}
        >
          <LogOutIcon data-icon="inline-start" />
          {isPending ? "Signing out..." : "Sign out"}
        </Button>
      </CardFooter>
    </Card>
  )
}
