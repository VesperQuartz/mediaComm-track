"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { differenceInDays, isBefore } from "date-fns";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  LineChart,
  Plus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { StatTile } from "@/components/dashboard/stat-tile";
import { TaskForm } from "@/components/dashboard/task-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const session = authClient.useSession();

  const { data: members = [], isLoading: isLoadingMembers } = useQuery(
    orpc.listMembers.queryOptions(),
  );
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery(
    orpc.listTasks.queryOptions(),
  );
  const { data: logs = [], isLoading: isLoadingLogs } = useQuery(
    orpc.listLogs.queryOptions(),
  );

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t: any) => t.status === "Completed").length;
    const overdue = tasks.filter(
      (t: any) =>
        t.status !== "Completed" &&
        t.deadline &&
        isBefore(new Date(t.deadline), new Date()),
    ).length;
    const inProgress = tasks.filter(
      (t: any) =>
        t.status === "In Progress" &&
        !isBefore(new Date(t.deadline || ""), new Date()),
    ).length;
    const onTimeRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, overdue, inProgress, onTimeRate };
  }, [tasks]);

  const getMember = (id: string) =>
    members.find((m: any) => m.id === id) || ({} as any);

  const [alertSearch, setAlertSearch] = useState("");
  const [alertPage, setAlertPage] = useState(1);
  const alertsPerPage = 5;

  const overdueTasks = useMemo(() => {
    return tasks.filter(
      (t: any) =>
        t.status !== "Completed" &&
        t.deadline &&
        isBefore(new Date(t.deadline), new Date()),
    );
  }, [tasks]);

  const filteredAlerts = useMemo(() => {
    return overdueTasks.filter((t: any) => {
      const memberName = getMember(t.memberId).name?.toLowerCase() || "";
      const taskName = t.name?.toLowerCase() || "";
      const search = alertSearch.toLowerCase();
      return memberName.includes(search) || taskName.includes(search);
    });
  }, [overdueTasks, alertSearch, members]);

  const paginatedAlerts = useMemo(() => {
    const start = (alertPage - 1) * alertsPerPage;
    return filteredAlerts.slice(start, start + alertsPerPage);
  }, [filteredAlerts, alertPage]);

  const totalAlertPages = Math.ceil(filteredAlerts.length / alertsPerPage);

  if (isLoadingMembers || isLoadingTasks || isLoadingLogs) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-track-red"></div>
      </div>
    );
  }

  const chartData = members.map((m: any) => {
    const mTasks = tasks.filter((t: any) => t.memberId === m.id);
    return {
      name: m.name.split(" ")[0],
      completed: mTasks.filter((t: any) => t.status === "Completed").length,
      inProgress: mTasks.filter(
        (t: any) =>
          t.status === "In Progress" &&
          !isBefore(new Date(t.deadline || ""), new Date()),
      ).length,
      overdue: mTasks.filter(
        (t: any) =>
          t.status !== "Completed" &&
          t.deadline &&
          isBefore(new Date(t.deadline), new Date()),
      ).length,
    };
  });

  const chartConfig = {
    completed: { label: "Completed", color: "#2E7D52" },
    inProgress: { label: "In Progress", color: "#E91E8C" },
    overdue: { label: "Overdue", color: "#0D3B8E" },
  } satisfies ChartConfig;

  return (
    <div className="animate-in space-y-6 duration-500 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-track-dark-red">
            Good day, Head of Communications 👋
          </h2>
          <p className="text-sm text-track-soft">
            Here's your team's productivity snapshot for today
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          className="h-10 rounded-lg bg-track-red px-6 text-xs font-semibold text-white shadow-sm transition-all hover:bg-track-deep-red active:scale-95"
        >
          {session.data && (
            <Button
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="h-10 rounded-lg bg-track-red px-6 text-xs font-semibold text-white shadow-sm transition-all hover:bg-track-deep-red active:scale-95"
            >
              <Plus className="size-4" /> New Task
            </Button>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatTile
          label="Total Tasks"
          value={stats.total}
          sub="All active tasks"
          color="blue"
        />
        <StatTile
          label="Completed"
          value={stats.completed}
          sub="On time delivery"
          color="green"
        />
        <StatTile
          label="In Progress"
          value={stats.inProgress}
          sub="Active right now"
          color="amber"
        />
        <StatTile
          label="Overdue"
          value={stats.overdue}
          sub="Needs attention"
          color="red"
        />
        <StatTile
          label="On-Time Rate"
          value={`${stats.onTimeRate}%`}
          sub="Delivery performance"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 font-serif text-lg text-track-dark-red">
              <BarChart3 className="size-5" /> Task Completion by Member
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 h-[250px] w-full">
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-full"
              >
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="name"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend
                    content={<ChartLegendContent className="text-[10px]" />}
                  />
                  <Bar
                    dataKey="completed"
                    fill="var(--color-completed)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="inProgress"
                    fill="var(--color-inProgress)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="overdue"
                    fill="var(--color-overdue)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col rounded-2xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2 font-serif text-lg text-track-dark-red">
              <AlertCircle className="size-5" /> Late Turnaround Alerts
            </CardTitle>
            <div className="relative w-40">
              <Input
                placeholder="Search alerts..."
                value={alertSearch}
                onChange={(e) => {
                  setAlertSearch(e.target.value);
                  setAlertPage(1);
                }}
                className="h-8 pr-8 text-[10px]"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden pt-2">
            <ScrollArea className="h-[250px] pr-4">
              <div className="space-y-3">
                {paginatedAlerts.length > 0 ? (
                  paginatedAlerts.map((t: any) => (
                    <div
                      key={t.id}
                      className="group flex items-center justify-between rounded-xl border border-track-border/50 p-3 transition-colors hover:bg-track-pale-red"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-xl">🔴</div>
                        <div>
                          <div className="text-xs leading-tight font-bold text-track-dark">
                            {t.name}
                          </div>
                          <div className="mt-0.5 text-[10px] text-track-soft">
                            {getMember(t.memberId).name} ·{" "}
                            {differenceInDays(
                              new Date(),
                              new Date(t.deadline || ""),
                            )}{" "}
                            days overdue
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setEditingTask(t);
                          setIsTaskModalOpen(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="h-7 border-track-red text-[10px] text-track-red hover:bg-track-light-red"
                      >
                        Update
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-track-soft">
                    <CheckCircle2 className="mb-2 size-10 text-track-green opacity-50" />
                    <p className="text-sm">No alerts found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
            {totalAlertPages > 1 && (
              <div className="mt-4 border-t pt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={alertPage === 1}
                        onClick={() => setAlertPage((p) => Math.max(1, p - 1))}
                        className="text-[10px]"
                      >
                        Previous
                      </Button>
                    </PaginationItem>
                    <PaginationItem>
                      <span className="px-2 text-[10px] text-track-soft">
                        Page {alertPage} of {totalAlertPages}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={alertPage === totalAlertPages}
                        onClick={() =>
                          setAlertPage((p) => Math.min(totalAlertPages, p + 1))
                        }
                        className="text-[10px]"
                      >
                        Next
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-lg text-track-dark-red">
            <LineChart className="size-5" /> Productivity Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {stats.overdue > 0 && (
              <div className="flex items-center gap-3 border-b border-track-border/30 py-3 last:border-0">
                <div className="text-lg">⚠️</div>
                <div className="text-xs text-track-mid">
                  <strong className="text-track-dark">Task Backlog:</strong>{" "}
                  {stats.overdue} task{stats.overdue > 1 ? "s are" : " is"}{" "}
                  overdue. Immediate follow-up recommended.
                </div>
              </div>
            )}
            {stats.onTimeRate >= 80 ? (
              <div className="flex items-center gap-3 border-b border-track-border/30 py-3 last:border-0">
                <div className="text-lg">✅</div>
                <div className="text-xs text-track-mid">
                  <strong className="text-track-dark">
                    Strong Performance:
                  </strong>{" "}
                  On-time rate of {stats.onTimeRate}%. Team is delivering well.
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-b border-track-border/30 py-3 last:border-0">
                <div className="text-lg">📉</div>
                <div className="text-xs text-track-mid">
                  <strong className="text-track-dark">
                    Performance Warning:
                  </strong>{" "}
                  On-time rate is {stats.onTimeRate}%. Consider reviewing
                  workload distribution.
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 border-b border-track-border/30 py-3 last:border-0">
              <div className="text-lg">🏆</div>
              <div className="text-xs text-track-mid">
                <strong className="text-track-dark">Top Performer:</strong>{" "}
                {members[0]?.name || "N/A"} has high completion rates.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isTaskModalOpen}
        onOpenChange={(open) => {
          setIsTaskModalOpen(open);
          if (!open) setEditingTask(null);
        }}
      >
        <DialogContent className="rounded-2xl sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-track-dark-red">
              {editingTask ? "✏️ Update Task" : "➕ Add New Task"}
            </DialogTitle>
            <DialogDescription>
              {editingTask
                ? "Update existing task details."
                : "Create a new assignment for your team."}
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            task={editingTask}
            members={members}
            onSuccess={() => setIsTaskModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
