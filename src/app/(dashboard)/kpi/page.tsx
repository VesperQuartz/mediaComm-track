"use client";

import { useQuery } from "@tanstack/react-query";
import { isBefore } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";

export default function KPIPage() {
  const { data: members = [], isLoading: isLoadingMembers } = useQuery(
    orpc.listMembers.queryOptions(),
  );
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery(
    orpc.listTasks.queryOptions(),
  );

  if (isLoadingMembers || isLoadingTasks) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-track-red"></div>
      </div>
    );
  }

  return (
    <div className="animate-in space-y-6 duration-500 fade-in">
      <div>
        <h2 className="font-serif text-2xl font-bold text-track-dark-red">
          KPI Dashboard
        </h2>
        <p className="text-sm text-track-soft">
          Individual performance scores and analytics
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {members.map((m: any) => {
          const mTasks = tasks.filter((t: any) => t.memberId === m.id);
          const total = mTasks.length;
          const done = mTasks.filter(
            (t: any) => t.status === "Completed",
          ).length;
          const overdue = mTasks.filter(
            (t: any) =>
              t.status !== "Completed" &&
              t.deadline &&
              isBefore(new Date(t.deadline), new Date()),
          ).length;
          const onTime = total > 0 ? Math.round((done / total) * 100) : 0;
          const kpiScore =
            total > 0 ? Math.round(onTime * 0.6 + (done / total) * 40) : 0;
          const scoreColor =
            kpiScore >= 80
              ? "text-track-green"
              : kpiScore >= 60
                ? "text-track-blue"
                : "text-track-red";
          const scoreLabel =
            kpiScore >= 80
              ? "Top Performer 🏆"
              : kpiScore >= 60
                ? "On Track ✅"
                : "Needs Support 🔴";

          return (
            <Card
              key={m.id}
              className="rounded-2xl border-t-4 border-none border-track-red shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <CardContent className="space-y-4 pt-6 text-center">
                <div>
                  <div className="text-sm font-bold text-track-dark">
                    {m.name}
                  </div>
                  <Badge className="mt-1 border-none bg-[#EAF2FF] text-[9px] font-bold text-[#1565C0]">
                    {m.role}
                  </Badge>
                </div>
                <div
                  className={cn(
                    "font-serif text-5xl leading-none font-black",
                    scoreColor,
                  )}
                >
                  {total > 0 ? kpiScore : "—"}
                </div>
                <div className="text-[10px] font-bold tracking-wider text-track-soft uppercase">
                  {total > 0 ? scoreLabel : "No tasks assigned"}
                </div>
                <div className="space-y-3 pt-2 text-left">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-track-mid">
                      <span>On-Time</span>
                      <span>{onTime}%</span>
                    </div>
                    <Progress value={onTime} className="h-1.5 bg-slate-100" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-track-mid">
                      <span>Completed</span>
                      <span>
                        {done}/{total}
                      </span>
                    </div>
                    <Progress
                      value={total > 0 ? (done / total) * 100 : 0}
                      className="h-1.5 bg-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-track-mid">
                      <span>Overdue</span>
                      <span className="text-track-red">{overdue}</span>
                    </div>
                    <Progress
                      value={total > 0 ? (overdue / total) * 100 : 0}
                      className="h-1.5 bg-slate-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
