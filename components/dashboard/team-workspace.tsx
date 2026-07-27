"use client"

import { useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import {
  acceptTeamInviteDemo,
  createTeamInvite,
  revokeTeamInvite,
} from "@/app/actions/team"
import { Badge } from "@/components/ui/badge"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDisplayDate } from "@/lib/utils"
import {
  TEAM_INVITE_STATUS_LABELS,
  TEAM_MEMBER_ROLES,
  TEAM_MEMBER_ROLE_LABELS,
  createTeamInviteSchema,
  type CreateTeamInviteInput,
  type TeamInviteRow,
  type TeamWorkspace,
} from "@/types/team"

type TeamWorkspaceViewProps = {
  workspace: TeamWorkspace
}

export function TeamWorkspaceView({ workspace }: TeamWorkspaceViewProps) {
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateTeamInviteInput>({
    resolver: zodResolver(createTeamInviteSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  })

  function onInvite(values: CreateTeamInviteInput) {
    startTransition(async () => {
      const result = await createTeamInvite(values)

      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof CreateTeamInviteInput, {
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
        toast.success("Invite created")
        reset({ email: "", role: "member" })
      }
    })
  }

  function onRevoke(invite: TeamInviteRow) {
    startTransition(async () => {
      const result = await revokeTeamInvite({ id: invite.id })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Revoked ${invite.email}`)
    })
  }

  function onAcceptDemo(invite: TeamInviteRow) {
    startTransition(async () => {
      const result = await acceptTeamInviteDemo({ id: invite.id })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Marked ${invite.email} as accepted (demo)`)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Workspace owner</CardTitle>
          <CardDescription>
            User-as-tenant remains the data boundary. Invites are stored for
            this workspace and do not yet share RLS access with other accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Name: </span>
            {workspace.ownerName?.trim() || "Unnamed"}
          </p>
          <p>
            <span className="text-muted-foreground">Email: </span>
            {workspace.ownerEmail}
          </p>
          <p>
            <span className="text-muted-foreground">Company: </span>
            {workspace.companyName?.trim() || "Not set"}
          </p>
        </CardContent>
      </Card>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Invite teammate</CardTitle>
          <CardDescription>
            Creates a pending invite row. No email is sent in this showcase.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onInvite)} noValidate>
          <CardContent>
            <FieldGroup className="gap-4 sm:grid sm:grid-cols-[1fr_160px] sm:items-start">
              <Field data-invalid={!!errors.email || undefined}>
                <FieldLabel htmlFor="invite_email">Email</FieldLabel>
                <Input
                  id="invite_email"
                  type="email"
                  autoComplete="email"
                  placeholder="teammate@company.com"
                  disabled={isPending}
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>
              <Field data-invalid={!!errors.role || undefined}>
                <FieldLabel htmlFor="invite_role">Role</FieldLabel>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select
                      value={field.value || null}
                      onValueChange={(value) => {
                        if (value) field.onChange(value)
                      }}
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id="invite_role"
                        aria-invalid={!!errors.role}
                        className="w-full border-border/70 bg-background"
                      >
                        <SelectValue placeholder="Role">
                          {(value: CreateTeamInviteInput["role"] | null) =>
                            value
                              ? TEAM_MEMBER_ROLE_LABELS[value]
                              : "Role"
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent align="start">
                        {TEAM_MEMBER_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {TEAM_MEMBER_ROLE_LABELS[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.role]} />
              </Field>
            </FieldGroup>
            <FieldDescription className="mt-3">
              Shared multi-user access is the next schema step after invites.
            </FieldDescription>
          </CardContent>
          <CardFooter className="border-t">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Sending..." : "Create invite"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invites</CardTitle>
          <CardDescription>
            Pending invites can be revoked or marked accepted for demo flows.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-0">
          {workspace.invites.length === 0 ? (
            <p className="px-6 text-sm text-muted-foreground">
              No invites yet. Add a teammate above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workspace.invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">{invite.email}</TableCell>
                    <TableCell>
                      {TEAM_MEMBER_ROLE_LABELS[invite.role]}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invite.status === "pending"
                            ? "default"
                            : invite.status === "accepted"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {TEAM_INVITE_STATUS_LABELS[invite.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDisplayDate(invite.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {invite.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => onAcceptDemo(invite)}
                          >
                            Accept
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={isPending}
                            onClick={() => onRevoke(invite)}
                          >
                            Revoke
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
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
