"use client";

import { useQuery } from "@tanstack/react-query";
import { isBefore } from "date-fns";
import { LineChart, Trophy, Users } from "lucide-react";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";

export default function TeamAnalysisPage() {
  const { data: members = [], isLoading: isLoadingMembers } = useQuery(
    orpc.listMembers.queryOptions(),
  );
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery(
    orpc.listTasks.queryOptions(),
  );
  const { data: logs = [], isLoading: isLoadingLogs } = useQuery(
    orpc.listLogs.queryOptions(),
  );

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t: any) => t.status === "Completed").length;
    const overdue = tasks.filter(
      (t: any) =>
        t.status !== "Completed" &&
        t.deadline &&
        isBefore(new Date(t.deadline), new Date()),
    ).length;
    const onTimeRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, overdue, onTimeRate };
  }, [tasks]);

  const leaderboard = useMemo(() => {
    return members
      .map((m: any) => {
        const mt = tasks.filter((t: any) => t.memberId === m.id);
        const d = mt.filter((t: any) => t.status === "Completed").length;
        const ot = mt.length > 0 ? Math.round((d / mt.length) * 100) : 0;
        return { ...m, score: ot, total: mt.length, done: d };
      })
      .sort((a: any, b: any) => b.score - a.score);
  }, [members, tasks]);

  if (isLoadingMembers || isLoadingTasks || isLoadingLogs) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-track-red"></div>
      </div>
    );
  }

  return (
    <div className="animate-in space-y-6 duration-500 fade-in">
      <div>
        <h2 className="flex items-center gap-2 font-serif text-2xl font-bold text-track-dark-red">
          <LineChart className="size-6" /> Team Productivity Analysis
        </h2>
        <p className="text-sm text-track-soft">
          Communications team performance as a collective unit
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
        {[
          { label: "Members", value: members.length },
          { label: "Tasks", value: stats.total },
          { label: "Done", value: stats.completed, border: "green" },
          { label: "Overdue", value: stats.overdue, border: "red" },
          { label: "On-Time", value: `${stats.onTimeRate}%` },
          { label: "Quality", value: "4.6" },
          { label: "Hours", value: "48" },
          {
            label: "Blockers",
            value: logs.filter((l: any) => l.blockers).length,
            border: "red",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={cn(
              "rounded-xl bg-white p-3 text-center shadow-sm",
              s.border === "green"
                ? "border-t-2 border-track-green"
                : s.border === "red"
                  ? "border-t-2 border-track-red"
                  : "",
            )}
          >
            <div className="font-serif text-xl font-black text-track-dark">
              {s.value}
            </div>
            <div className="mt-1 text-[8px] font-bold text-track-soft uppercase">
              {s.label}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg text-track-dark-red">
              <Trophy className="size-5" /> Performance Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard.map((m: any, i: number) => (
                <div
                  key={m.id}
                  className="flex items-center gap-4 border-b border-track-border/30 py-2 last:border-0"
                >
                  <div className="w-8 text-center font-serif text-xl font-black text-track-soft">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-track-dark">
                      {m.name}
                    </div>
                    <div className="text-[10px] text-track-soft">
                      {m.role} · {m.done}/{m.total} tasks
                    </div>
                  </div>
                  <div
                    className={cn(
                      "font-serif text-xl font-black",
                      m.score >= 80 ? "text-track-green" : "text-track-blue",
                    )}
                  >
                    {m.score}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg text-track-dark-red">
              <Users className="size-5" /> Team Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  icon: "🚨",
                  title: "Overdue Tasks",
                  text: `${stats.overdue} overdue tasks across the team. Immediate review needed.`,
                },
                {
                  icon: "🏆",
                  title: "On-Time Rate",
                  text: `Outstanding on-time rate of ${stats.onTimeRate}%. Team is delivering at a high level.`,
                },
                {
                  icon: "🥇",
                  title: "Top Performer",
                  text: `Top Performer: ${leaderboard[0]?.name || "N/A"} with a KPI score of ${leaderboard[0]?.score || 0}.`,
                },
              ].map((insight) => (
                <div key={insight.title} className="flex items-start gap-3">
                  <div className="text-lg">{insight.icon}</div>
                  <div className="text-xs text-track-mid">
                    <strong className="text-track-dark">
                      {insight.title}:
                    </strong>{" "}
                    {insight.text}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
