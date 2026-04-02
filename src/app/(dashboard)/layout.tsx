import { Bell } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
    <div className="min-h-screen bg-track-bg pb-12 relative">
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

  if (!session) {
    redirect("/login");
  }

  const TARGET_EMAIL = "juliet.godwin@medicaidradiology.com.ng";

  return (
    <>
      <TopBar user={session.user} />
      <NavTabs />
      <main className="mx-auto max-w-[1280px] px-6 pt-8">{children}</main>

      {session.user.email.toLowerCase() === TARGET_EMAIL.toLowerCase() && (
        <div className="fixed bottom-6 left-6 right-6 sm:right-auto z-[60] sm:w-full sm:max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Alert
            variant="default"
            className="bg-track-pale-red border-track-red/20 shadow-2xl rounded-2xl"
          >
            <Bell className="size-4 text-track-red" aria-hidden="true" />
            <AlertTitle className="text-track-dark-red font-serif font-bold">
              Friendly Reminder
            </AlertTitle>
            <AlertDescription className="text-track-mid font-medium">
              Please remember to give Jimoh his Chips and Chicken
            </AlertDescription>
          </Alert>
        </div>
      )}
    </>
  );
}
