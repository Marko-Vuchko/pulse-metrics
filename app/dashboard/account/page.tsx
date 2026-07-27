import { AccountForms } from "@/components/dashboard/account-forms"
import { ContentFade } from "@/components/motion/content-fade"
import { getProfile } from "@/lib/data/profile"

export const metadata = {
  title: "Account",
  description: "PulseMetrics account - profile, password, and sign out.",
}

export default async function AccountPage() {
  const profile = await getProfile()

  return (
    <ContentFade>
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-mono text-lg font-semibold tracking-tight">
            Account
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            Update your display name, change your password, or sign out.
          </p>
        </div>

        <AccountForms
          email={profile?.email ?? ""}
          fullName={profile?.full_name ?? ""}
        />
      </div>
    </ContentFade>
  )
}
