import { AppSidebar, AppTabBar } from "@/components/layout/app-nav";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-svh">
      <AppSidebar />
      <main className="flex-1 px-4 pt-8 pb-28 md:px-10 md:pt-12 md:pb-12">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
          {children}
        </div>
      </main>
      <AppTabBar />
    </div>
  );
}
