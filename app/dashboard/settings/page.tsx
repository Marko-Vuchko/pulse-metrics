import { SettingsForm } from "@/components/dashboard/settings-form"
import { ContentFade } from "@/components/motion/content-fade"
import { getProfile } from "@/lib/data/profile"

export const metadata = {
  title: "Settings",
  description: "PulseMetrics settings - company, profile, and theme.",
}

export default async function SettingsPage() {
  const profile = await getProfile()

  return (
    <ContentFade>
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-mono text-lg font-semibold tracking-tight">
            Settings
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            Manage company details and how your profile appears in the
            dashboard.
          </p>
        </div>

        <SettingsForm
          companyName={profile?.company_name ?? ""}
          fullName={profile?.full_name ?? ""}
        />
      </div>
    </ContentFade>
  )
}
