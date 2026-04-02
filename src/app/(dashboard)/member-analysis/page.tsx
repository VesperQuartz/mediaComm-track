"use client";

import { useQuery } from "@tanstack/react-query";
import { isBefore } from "date-fns";
import { Clock, Target, User } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";

export default function MemberAnalysisPage() {
  const [selectedMemberName, setSelectedMemberName] = useState<string>(
    "-- Choose a member --",
  );

  const { data: members = [], isLoading: isLoadingMembers } = useQuery(
    orpc.listMembers.queryOptions(),
  );
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery(
    orpc.listTasks.queryOptions(),
  );
  const { data: logs = [], isLoading: isLoadingLogs } = useQuery(
    orpc.listLogs.queryOptions(),
  );

  const getMemberByName = (name: string) =>
    members.find((m: any) => m.name === name);

  const selectedMember = getMemberByName(selectedMemberName);

  const mTasks = tasks.filter((t: any) => t.memberId === selectedMember?.id);
  const total = mTasks.length;
  const done = mTasks.filter((t: any) => t.status === "Completed").length;
  const onTimeRate = total > 0 ? Math.round((done / total) * 100) : 0;
  const overdue = mTasks.filter(
    (t: any) =>
      t.status !== "Completed" &&
      t.deadline &&
      isBefore(new Date(t.deadline), new Date()),
  ).length;

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
          <User className="size-6" /> Individual Productivity Analysis
        </h2>
        <p className="text-sm text-track-soft">
          Deep-dive performance dashboard for each team member
        </p>
      </div>

      <Card className="rounded-2xl border-none shadow-sm">
        <CardContent className="flex items-center gap-4 p-4">
          <Label
            htmlFor="member-select"
            className="text-[10px] font-bold whitespace-nowrap text-track-mid uppercase"
          >
            Select Team Member
          </Label>
          <Select
            value={selectedMemberName}
            //@ts-expect-error
            onValueChange={setSelectedMemberName}
          >
            <SelectTrigger
              id="member-select"
              className="h-10 w-60 rounded-lg border-2 border-gray-400 text-xs focus:border-red-500"
            >
              <SelectValue placeholder="-- Choose a member --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-- Choose a member --">
                -- Choose a member --
              </SelectItem>
              {members.map((m: any) => (
                <SelectItem key={m.id} value={m.name}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedMember && (
        <div className="animate-in space-y-6 duration-500 slide-in-from-bottom-2">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Total Tasks", value: total, color: "blue" },
              { label: "Completed", value: done, color: "green" },
              { label: "Overdue", value: overdue, color: "red" },
              {
                label: "On-Time Rate",
                value: `${onTimeRate}%`,
                color: "blue",
              },
              { label: "Avg Quality", value: "4.8", color: "green" },
              {
                label: "Log Entries",
                value: logs.filter((l: any) => l.memberId === selectedMember.id)
                  .length,
                color: "deep-red",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={cn(
                  "rounded-2xl border-t-3 bg-white p-4 text-center shadow-sm",
                  s.color === "blue"
                    ? "border-track-blue"
                    : s.color === "green"
                      ? "border-track-green"
                      : s.color === "red"
                        ? "border-track-red"
                        : "border-track-deep-red",
                )}
              >
                <div className="font-serif text-2xl font-black text-track-dark">
                  {s.value}
                </div>
                <div className="mt-1 text-[9px] font-bold tracking-wider text-track-soft uppercase">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-lg text-track-dark-red">
                  <Target className="size-5" /> Overall KPI Score
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="relative flex size-32 items-center justify-center rounded-full border-8 border-track-green/20 bg-track-green/5">
                  <div className="text-center">
                    <div className="font-serif text-4xl font-black text-track-green">
                      {onTimeRate}
                    </div>
                    <div className="text-[10px] font-bold text-track-soft">
                      / 100
                    </div>
                  </div>
                </div>
                <Badge className="mt-4 border-none bg-track-green px-4 py-1 text-white">
                  🏆 Top Performer
                </Badge>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-lg text-track-dark-red">
                  <Clock className="size-5" /> Recent Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mTasks.slice(0, 5).map((t: any) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between border-b border-track-border/30 py-2 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "size-2 rounded-full",
                            t.priority === "High"
                              ? "bg-track-red"
                              : "bg-track-amber",
                          )}
                        />
                        <div className="text-xs font-bold text-track-dark">
                          {t.name}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-none bg-slate-100 text-[8px]"
                      >
                        {t.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
