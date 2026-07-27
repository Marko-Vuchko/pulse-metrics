"use client"

import { useRef, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DownloadIcon, UploadIcon } from "lucide-react"
import { toast } from "sonner"

import {
  exportMetricsCsv,
  upsertMetricPoint,
  upsertMetricPointsBulk,
} from "@/app/actions/metrics"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { METRICS_CSV_TEMPLATE, parseMetricsCsv } from "@/lib/metrics/csv"
import { formatCurrency, formatDisplayDate, formatPercentRate } from "@/lib/utils"
import {
  metricPointFormSchema,
  type MetricPointFormInput,
  type MetricPointListItem,
  type MetricPointWriteInput,
} from "@/types/metrics"

type MetricsIngestWorkspaceProps = {
  recent: MetricPointListItem[]
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function MetricsIngestWorkspace({
  recent,
}: MetricsIngestWorkspaceProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [csvPreviewCount, setCsvPreviewCount] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<MetricPointFormInput, unknown, MetricPointWriteInput>({
    resolver: zodResolver(metricPointFormSchema),
    defaultValues: {
      date: todayIso(),
      mrr: "0",
      active_users: "0",
      churn_rate: "0",
      arpu: "0",
    },
  })

  function onManualSubmit(values: MetricPointWriteInput) {
    startTransition(async () => {
      const result = await upsertMetricPoint(values)

      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof MetricPointFormInput, {
              message: messages[0],
            })
          }
        }
      }

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(`Saved metrics for ${values.date}`)
      reset({
        date: values.date,
        mrr: String(values.mrr),
        active_users: String(values.active_users),
        churn_rate: String(values.churn_rate),
        arpu: String(values.arpu),
      })
    })
  }

  function downloadTemplate() {
    const blob = new Blob([METRICS_CSV_TEMPLATE], {
      type: "text/csv;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "pulse-metrics-template.csv"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function downloadExport() {
    startTransition(async () => {
      const exported = await exportMetricsCsv()
      if (exported.error || !exported.csv || !exported.filename) {
        toast.error(exported.error ?? "Export failed.")
        return
      }
      const blob = new Blob([exported.csv], {
        type: "text/csv;charset=utf-8",
      })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = exported.filename
      anchor.click()
      URL.revokeObjectURL(url)
      toast.success("Metrics CSV downloaded")
    })
  }

  function onFileChange(file: File | null) {
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? "")
      const parsed = parseMetricsCsv(text)
      if (!parsed.ok) {
        setCsvPreviewCount(null)
        toast.error(parsed.error)
        return
      }

      setCsvPreviewCount(parsed.rows.length)
      startTransition(async () => {
        const result = await upsertMetricPointsBulk(parsed.rows)
        if (result.error) {
          toast.error(result.error)
          return
        }
        toast.success(
          `Imported ${result.upserted ?? parsed.rows.length} metric day(s)`
        )
        setCsvPreviewCount(null)
        if (fileRef.current) fileRef.current.value = ""
      })
    }
    reader.onerror = () => toast.error("Could not read that file.")
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="manual">
        <TabsList>
          <TabsTrigger value="manual">Manual entry</TabsTrigger>
          <TabsTrigger value="csv">CSV import</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-4">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Add or update a day</CardTitle>
              <CardDescription>
                Upserts by date for your workspace. Overwrites an existing day
                if the date already exists.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onManualSubmit)} noValidate>
              <CardContent>
                <FieldGroup className="gap-4 sm:grid sm:grid-cols-2">
                  <Field data-invalid={!!errors.date || undefined}>
                    <FieldLabel htmlFor="metric_date">Date</FieldLabel>
                    <Input
                      id="metric_date"
                      type="date"
                      disabled={isPending}
                      aria-invalid={!!errors.date}
                      {...register("date")}
                    />
                    <FieldError errors={[errors.date]} />
                  </Field>
                  <Field data-invalid={!!errors.mrr || undefined}>
                    <FieldLabel htmlFor="metric_mrr">MRR (EUR)</FieldLabel>
                    <Input
                      id="metric_mrr"
                      type="number"
                      step="0.01"
                      min={0}
                      disabled={isPending}
                      aria-invalid={!!errors.mrr}
                      {...register("mrr")}
                    />
                    <FieldError errors={[errors.mrr]} />
                  </Field>
                  <Field data-invalid={!!errors.active_users || undefined}>
                    <FieldLabel htmlFor="metric_users">Active users</FieldLabel>
                    <Input
                      id="metric_users"
                      type="number"
                      step="1"
                      min={0}
                      disabled={isPending}
                      aria-invalid={!!errors.active_users}
                      {...register("active_users")}
                    />
                    <FieldError errors={[errors.active_users]} />
                  </Field>
                  <Field data-invalid={!!errors.churn_rate || undefined}>
                    <FieldLabel htmlFor="metric_churn">Churn rate</FieldLabel>
                    <Input
                      id="metric_churn"
                      type="number"
                      step="0.0001"
                      min={0}
                      max={1}
                      disabled={isPending}
                      aria-invalid={!!errors.churn_rate}
                      {...register("churn_rate")}
                    />
                    <FieldDescription>
                      Fraction 0-1 (e.g. 0.025 = 2.5%).
                    </FieldDescription>
                    <FieldError errors={[errors.churn_rate]} />
                  </Field>
                  <Field
                    className="sm:col-span-2"
                    data-invalid={!!errors.arpu || undefined}
                  >
                    <FieldLabel htmlFor="metric_arpu">ARPU (EUR)</FieldLabel>
                    <Input
                      id="metric_arpu"
                      type="number"
                      step="0.01"
                      min={0}
                      disabled={isPending}
                      aria-invalid={!!errors.arpu}
                      {...register("arpu")}
                    />
                    <FieldError errors={[errors.arpu]} />
                  </Field>
                </FieldGroup>
              </CardContent>
              <CardFooter className="border-t">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save point"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="csv" className="mt-4">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Import CSV</CardTitle>
              <CardDescription>
                Header required: date, mrr, active_users, churn_rate, arpu.
                Existing dates are overwritten.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={downloadTemplate}
                >
                  <DownloadIcon className="size-4" aria-hidden />
                  Download template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending || recent.length === 0}
                  onClick={downloadExport}
                >
                  <DownloadIcon className="size-4" aria-hidden />
                  Export CSV
                </Button>
                <Button
                  type="button"
                  disabled={isPending}
                  onClick={() => fileRef.current?.click()}
                >
                  <UploadIcon className="size-4" aria-hidden />
                  {isPending ? "Importing..." : "Choose CSV"}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="sr-only"
                  onChange={(event) =>
                    onFileChange(event.target.files?.[0] ?? null)
                  }
                />
              </div>
              {csvPreviewCount !== null ? (
                <p className="text-sm text-muted-foreground">
                  Importing {csvPreviewCount} row(s)...
                </p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Recent points</CardTitle>
          <CardDescription>
            Newest {recent.length} days in your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {recent.length === 0 ? (
            <p className="px-6 text-sm text-muted-foreground">
              No metric points yet. Add a day or import a CSV.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>MRR</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Churn</TableHead>
                  <TableHead>ARPU</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{formatDisplayDate(row.date)}</TableCell>
                    <TableCell>{formatCurrency(row.mrr)}</TableCell>
                    <TableCell>{row.active_users}</TableCell>
                    <TableCell>{formatPercentRate(row.churn_rate)}</TableCell>
                    <TableCell>{formatCurrency(row.arpu)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
