"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
  { id: "dashboard", label: "📊 Dashboard", href: "/" },
  { id: "tasks", label: "✅ Tasks", href: "/tasks" },
  { id: "daily", label: "📅 Daily Log", href: "/daily-log" },
  { id: "kpi", label: "🏆 KPI", href: "/kpi" },
  { id: "team", label: "👥 Team", href: "/team" },
  {
    id: "member-analysis",
    label: "👤 Member Analysis",
    href: "/member-analysis",
  },
  { id: "team-analysis", label: "📈 Team Analysis", href: "/team-analysis" },
];

export const NavTabs = () => {
  const pathname = usePathname();
  const activeTab =
    TABS.find((tab) => tab.href === pathname)?.id || "dashboard";

  return (
    <div className="no-scrollbar overflow-x-auto border-b border-white/10 bg-track-dark-red px-4">
      <Tabs value={activeTab} className="w-full">
        <TabsList className="flex h-auto justify-start gap-1 bg-transparent p-0">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              nativeButton={false}
              render={(props) => (
                <Link href={tab.href} {...props}>
                  {tab.label}
                </Link>
              )}
              className="rounded-none border-b-3 border-transparent px-5 py-3 text-xs font-medium text-white/70 transition-all data-[state=active]:border-b-3 data-[state=active]:border-[#FADBD8] data-[state=active]:bg-transparent data-[state=active]:text-white"
            />
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};
