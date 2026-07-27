import { DemoSurfaceNote } from "@/components/dashboard/demo-surface-note"
import { TeamWorkspaceView } from "@/components/dashboard/team-workspace"
import { ContentFade } from "@/components/motion/content-fade"
import { getTeamWorkspace } from "@/lib/data/team"

export const metadata = {
  title: "Team",
  description: "PulseMetrics team invite showcase for your workspace.",
}

export default async function TeamPage() {
  const workspace = await getTeamWorkspace()

  if (!workspace) {
    return (
      <ContentFade>
        <div className="flex flex-1 flex-col gap-2">
          <h2 className="font-mono text-lg font-semibold tracking-tight">
            Team
          </h2>
          <p className="text-sm text-muted-foreground">
            Sign in to manage workspace invites.
          </p>
        </div>
      </ContentFade>
    )
  }

  return (
    <ContentFade>
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-mono text-lg font-semibold tracking-tight">
            Team
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            Invite teammates by email. Data stays owner-scoped until shared
            workspaces land.
          </p>
        </div>

        <DemoSurfaceNote>
          Intentional demo: invites are real rows under your tenant, but there is
          no shared ACL yet. Accept does not grant another account access. A v2
          would add `tenant_members` + membership RLS.
        </DemoSurfaceNote>

        <TeamWorkspaceView workspace={workspace} />
      </div>
    </ContentFade>
  )
}
