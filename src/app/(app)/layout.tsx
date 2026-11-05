import { EncryptionGate } from "@/components/encryption/encryption-gate";
import { AppSidebar, AppTabBar } from "@/components/layout/app-nav";
import { TimezoneDetector } from "@/components/settings/timezone-detector";
import { shouldDetectTimezone } from "@/domain/profiles/profile";
import { getAppContext } from "@/infrastructure/container";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { user, useCases } = await getAppContext();
  const [keys, profile] = await Promise.all([
    useCases.getUserKeys(user.id),
    useCases.getProfile(user.id),
  ]);

  return (
    <EncryptionGate userId={user.id} keys={keys}>
      {profile && shouldDetectTimezone(profile) && <TimezoneDetector />}
      <div className="flex min-h-svh">
        <AppSidebar />
        <main className="flex-1 pt-[max(2rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[calc(7rem_+_env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] md:pt-[max(3rem,env(safe-area-inset-top))] md:pr-[max(2.5rem,env(safe-area-inset-right))] md:pb-[max(3rem,env(safe-area-inset-bottom))] md:pl-10">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
            {children}
          </div>
        </main>
        <AppTabBar />
      </div>
    </EncryptionGate>
  );
}
