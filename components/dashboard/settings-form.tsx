"use client"

import { useEffect, useState, useSyncExternalStore, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTheme } from "next-themes"
import { toast } from "sonner"

import { updateSettings } from "@/app/actions/profile"
import { SaveCheckmark } from "@/components/motion/save-checkmark"
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
import { settingsSchema, type SettingsInput } from "@/types/profile"

function subscribe() {
  return () => {}
}

function ThemePreferenceDisplay() {
  const { theme, resolvedTheme } = useTheme()
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)

  const preference = !mounted
    ? "Loading"
    : theme === "system"
      ? `System (${resolvedTheme === "dark" ? "Dark" : "Light"})`
      : theme === "dark"
        ? "Dark"
        : "Light"

  return (
    <div className="rounded-2xl border border-border/60 bg-muted/30 px-3 py-2.5">
      <p className="text-sm font-medium text-foreground">
        Current preference: {preference}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Switch themes with the toggle in the topbar.
      </p>
    </div>
  )
}

type SettingsFormProps = {
  companyName: string
  fullName: string
}

export function SettingsForm({ companyName, fullName }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [savedFlash, setSavedFlash] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      company_name: companyName,
      full_name: fullName,
    },
  })

  useEffect(() => {
    if (!savedFlash) return
    const id = window.setTimeout(() => setSavedFlash(false), 1600)
    return () => window.clearTimeout(id)
  }, [savedFlash])

  function onSubmit(values: SettingsInput) {
    startTransition(async () => {
      const result = await updateSettings(values)

      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof SettingsInput, { message: messages[0] })
          }
        }
      }

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.success) {
        setSavedFlash(true)
        toast.success("Settings saved")
      }
    })
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Workspace settings</CardTitle>
        <CardDescription>
          Update your company and display name. Theme is controlled locally.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent>
          <FieldGroup className="gap-4">
            <Field data-invalid={!!errors.company_name || undefined}>
              <FieldLabel htmlFor="company_name">Company name</FieldLabel>
              <Input
                id="company_name"
                type="text"
                autoComplete="organization"
                placeholder="Fluxis Labs"
                aria-invalid={!!errors.company_name}
                disabled={isPending}
                {...register("company_name")}
              />
              <FieldError errors={[errors.company_name]} />
            </Field>

            <Field data-invalid={!!errors.full_name || undefined}>
              <FieldLabel htmlFor="full_name">Full name</FieldLabel>
              <Input
                id="full_name"
                type="text"
                autoComplete="name"
                placeholder="Demo User"
                aria-invalid={!!errors.full_name}
                disabled={isPending}
                {...register("full_name")}
              />
              <FieldError errors={[errors.full_name]} />
            </Field>

            <Field>
              <FieldLabel>Theme preference</FieldLabel>
              <ThemePreferenceDisplay />
              <FieldDescription>
                Theme is not stored on the server. It follows your device and
                the topbar toggle.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="border-t">
          <Button type="submit" disabled={isPending} className="min-w-36 gap-2">
            {isPending ? (
              "Saving..."
            ) : savedFlash ? (
              <>
                <SaveCheckmark active />
                Saved
              </>
            ) : (
              "Save settings"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
