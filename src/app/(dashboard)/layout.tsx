import { Bell } from "lucide-react";
import { headers } from "next/headers";
import { Suspense } from "react";
import { NavTabs } from "@/components/dashboard/nav-tabs";
import { TopBar } from "@/components/dashboard/top-bar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { auth } from "@/lib/auth";
import DashboardLoading from "./loading";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-track-bg pb-12">
      <Suspense fallback={<DashboardLoading />}>
        <DashboardShell>{children}</DashboardShell>
      </Suspense>
    </div>
  );
}

async function DashboardShell({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const TARGET_EMAIL = "juliet.godwin@medicaidradiology.com.ng";

  return (
    <>
      <TopBar user={session?.user ?? "Anonymous"} />
      <NavTabs />
      <main className="mx-auto max-w-7xl px-6 pt-8">{children}</main>

      {session?.user.email.toLowerCase() === TARGET_EMAIL.toLowerCase() && (
        <div className="fixed right-6 bottom-6 left-6 z-60 animate-in duration-500 fade-in slide-in-from-bottom-4 sm:right-auto sm:w-full sm:max-w-sm">
          <Alert
            variant="default"
            className="rounded-2xl border-track-red/20 bg-track-pale-red shadow-2xl"
          >
            <Bell className="size-4 text-track-red" aria-hidden="true" />
            <AlertTitle className="font-serif font-bold text-track-dark-red">
              Friendly Reminder
            </AlertTitle>
            <AlertDescription className="font-medium text-track-mid">
              Please remember to give Jimoh his Chips and Chicken
            </AlertDescription>
          </Alert>
        </div>
      )}
    </>
  );
}
