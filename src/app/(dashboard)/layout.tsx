import { Bell } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NavTabs } from "@/components/dashboard/nav-tabs";
import { TopBar } from "@/components/dashboard/top-bar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const TARGET_EMAIL = "juliet.godwin@medicaidradiology.com.ng";

  return (
    <div className="min-h-screen bg-track-bg pb-12 relative">
      <TopBar user={session.user} />
      <NavTabs />
      <main className="mx-auto max-w-[1280px] px-6 pt-8">{children}</main>

      {session.user.email === TARGET_EMAIL && (
        <div className="fixed bottom-6 right-6 z-[60] w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
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
    </div>
  );
}
