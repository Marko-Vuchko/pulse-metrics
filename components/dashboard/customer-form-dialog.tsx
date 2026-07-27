"use client"

import { useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { createCustomer, updateCustomer } from "@/app/actions/customers"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CUSTOMER_MUTABLE_STATUSES,
  CUSTOMER_MUTABLE_STATUS_LABELS,
  PLAN_NAMES,
  customerFormSchema,
  type CustomerFormInput,
  type CustomerFormValues,
  type CustomerMutableStatus,
  type CustomerRow,
  type PlanName,
} from "@/types/customers"

const EMPTY_DEFAULTS: CustomerFormInput = {
  name: "",
  email: "",
  company: "",
  status: undefined as unknown as CustomerMutableStatus,
  mrr: "",
  plan_name: undefined as unknown as PlanName,
}

function rowToFormValues(row: CustomerRow): CustomerFormInput {
  const status =
    row.status === "archived"
      ? ("active" as CustomerMutableStatus)
      : (row.status as CustomerMutableStatus)

  return {
    name: row.name,
    email: row.email,
    company: row.company ?? "",
    status,
    mrr: Number(row.mrr).toFixed(2),
    plan_name: row.plan_name,
  }
}

type CustomerFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  customer?: CustomerRow | null
  returnPath: string
  onRequestDelete?: () => void
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  mode,
  customer,
  returnPath,
  onRequestDelete,
}: CustomerFormDialogProps) {
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<CustomerFormInput, unknown, CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues:
      mode === "edit" && customer ? rowToFormValues(customer) : EMPTY_DEFAULTS,
  })

  function onSubmit(values: CustomerFormValues) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createCustomer(values, returnPath)
          : await updateCustomer(
              { ...values, id: customer!.id },
              returnPath
            )

      if (result?.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof CustomerFormInput, { message: messages[0] })
          }
        }
      }

      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-mono tracking-tight">
            {mode === "create" ? "Add customer" : "Edit customer"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new customer with empty fields - fill in the details below."
              : "Update customer details. Status changes update cancellation date automatically."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <FieldGroup className="gap-4">
            <Field data-invalid={!!errors.name || undefined}>
              <FieldLabel htmlFor="customer-name">Name</FieldLabel>
              <Input
                id="customer-name"
                autoComplete="off"
                placeholder="Ada Lovelace"
                aria-invalid={!!errors.name}
                disabled={isPending}
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.email || undefined}>
              <FieldLabel htmlFor="customer-email">Email</FieldLabel>
              <Input
                id="customer-email"
                type="email"
                autoComplete="off"
                placeholder="ada@example.com"
                aria-invalid={!!errors.email}
                disabled={isPending}
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={!!errors.company || undefined}>
              <FieldLabel htmlFor="customer-company">Company</FieldLabel>
              <Input
                id="customer-company"
                autoComplete="off"
                placeholder="Analytical Engines Ltd"
                aria-invalid={!!errors.company}
                disabled={isPending}
                {...register("company")}
              />
              <FieldError errors={[errors.company]} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.status || undefined}>
                <FieldLabel htmlFor="customer-status">Status</FieldLabel>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      value={field.value || null}
                      onValueChange={(value) => {
                        if (value) field.onChange(value)
                      }}
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id="customer-status"
                        aria-invalid={!!errors.status}
                        className="w-full border-border/70 bg-background"
                      >
                        <SelectValue placeholder="Select status">
                          {(value: CustomerMutableStatus | null) =>
                            value
                              ? CUSTOMER_MUTABLE_STATUS_LABELS[value]
                              : "Select status"
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent align="start">
                        {CUSTOMER_MUTABLE_STATUSES.map((option) => (
                          <SelectItem key={option} value={option}>
                            {CUSTOMER_MUTABLE_STATUS_LABELS[option]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.status]} />
              </Field>

              <Field data-invalid={!!errors.plan_name || undefined}>
                <FieldLabel htmlFor="customer-plan">Plan</FieldLabel>
                <Controller
                  control={control}
                  name="plan_name"
                  render={({ field }) => (
                    <Select
                      value={field.value || null}
                      onValueChange={(value) => {
                        if (value) field.onChange(value)
                      }}
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id="customer-plan"
                        aria-invalid={!!errors.plan_name}
                        className="w-full border-border/70 bg-background"
                      >
                        <SelectValue placeholder="Select plan">
                          {(value: PlanName | null) => value ?? "Select plan"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent align="start">
                        {PLAN_NAMES.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.plan_name]} />
              </Field>
            </div>

            <Field data-invalid={!!errors.mrr || undefined}>
              <FieldLabel htmlFor="customer-mrr">MRR (EUR)</FieldLabel>
              <Input
                id="customer-mrr"
                inputMode="decimal"
                placeholder="0.00"
                aria-invalid={!!errors.mrr}
                disabled={isPending}
                {...register("mrr")}
              />
              <FieldError errors={[errors.mrr]} />
            </Field>
          </FieldGroup>

          <DialogFooter className="gap-2 sm:justify-between">
            {mode === "edit" ? (
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={() => onRequestDelete?.()}
              >
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? mode === "create"
                    ? "Creating..."
                    : "Saving..."
                  : mode === "create"
                    ? "Create customer"
                    : "Save changes"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
