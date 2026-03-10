"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { differenceInDays, format, isBefore } from "date-fns";
import {
  AlertCircle,
  BarChart3,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  LineChart,
  Pencil,
  Plus,
  Target,
  Trash2,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";

// --- Types ---
type Task = any;
type Member = any;
type Log = any;

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const queryClient = useQueryClient();

  // --- Live Data Queries ---
  const { data: members = [], isLoading: isLoadingMembers } = useQuery(
    orpc.listMembers.queryOptions(),
  );
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery(
    orpc.listTasks.queryOptions(),
  );
  const { data: logs = [], isLoading: isLoadingLogs } = useQuery(
    orpc.listLogs.queryOptions(),
  );

  // --- Mutations ---
  const upsertTaskMutation = useMutation(
    orpc.upsertTask.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.listTasks.queryOptions());
        setIsTaskModalOpen(false);
        setEditingTask(null);
        toast.success("Task saved");
      },
    }),
  );

  const deleteTaskMutation = useMutation(
    orpc.deleteTask.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.listTasks.queryOptions());
        toast.success("Task deleted");
      },
    }),
  );

  const upsertLogMutation = useMutation(
    orpc.upsertLog.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.listLogs.queryOptions());
        setIsLogModalOpen(false);
        toast.success("Log entry saved");
      },
    }),
  );

  const upsertMemberMutation = useMutation(
    orpc.upsertMember.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.listMembers.queryOptions());
        setIsMemberModalOpen(false);
        toast.success("Member saved");
      },
    }),
  );

  const deleteMemberMutation = useMutation(
    orpc.deleteMember.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.listMembers.queryOptions());
        toast.success("Member removed");
      },
    }),
  );

  // --- Modal States ---
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // --- Derived State ---
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(
      (t: Task) => t.status === "Completed",
    ).length;
    const overdue = tasks.filter(
      (t: Task) =>
        t.status !== "Completed" &&
        t.deadline &&
        isBefore(new Date(t.deadline), new Date()),
    ).length;
    const inProgress = tasks.filter(
      (t: Task) =>
        t.status === "In Progress" &&
        !isBefore(new Date(t.deadline || ""), new Date()),
    ).length;
    const onTimeRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, overdue, inProgress, onTimeRate };
  }, [tasks]);

  const getMember = (id: string) =>
    members.find((m: Member) => m.id === id) || ({} as Member);

  if (isLoadingMembers || isLoadingTasks || isLoadingLogs) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-track-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-track-red"></div>
      </div>
    );
  }

  // --- Forms ---

  const TaskForm = ({
    task,
    onSuccess,
  }: {
    task?: Task | null;
    onSuccess: () => void;
  }) => {
    const form = useForm({
      defaultValues: {
        name: task?.name || "",
        memberId: task?.memberId || "",
        priority: (task?.priority as "High" | "Medium" | "Low") || "Medium",
        start: task?.start || format(new Date(), "yyyy-MM-dd"),
        deadline: task?.deadline || "",
        pct: task?.pct || 0,
        desc: task?.desc || "",
        status:
          (task?.status as "Not Started" | "In Progress" | "Completed") ||
          "Not Started",
        quality: task?.quality || "",
        lateReason: task?.lateReason || "",
        feedback: task?.feedback || "",
      },
      onSubmit: async ({ value }) => {
        upsertTaskMutation.mutate({
          ...value,
          id: task?.id,
          status: value.pct === 100 ? "Completed" : value.status,
        });
      },
    });

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4 py-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 grid gap-2">
            <Label className="text-[10px] font-bold text-track-mid uppercase">
              Task Name *
            </Label>
            <form.Field name="name">
              {(field) => (
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Design TEDx Event Flyer"
                  className="h-10 rounded-lg"
                  required
                />
              )}
            </form.Field>
          </div>
          <div className="grid gap-2">
            <Label className="text-[10px] font-bold text-track-mid uppercase">
              Assign To *
            </Label>
            <form.Field name="memberId">
              {(field) => (
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue placeholder="Select member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m: Member) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </form.Field>
          </div>
          <div className="grid gap-2">
            <Label className="text-[10px] font-bold text-track-mid uppercase">
              Priority
            </Label>
            <form.Field name="priority">
              {(field) => (
                <Select
                  value={field.state.value}
                  onValueChange={(val) => field.handleChange(val as any)}
                >
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </form.Field>
          </div>
          <div className="grid gap-2">
            <Label className="text-[10px] font-bold text-track-mid uppercase">
              Deadline *
            </Label>
            <form.Field name="deadline">
              {(field) => (
                <Input
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="h-10 rounded-lg"
                  required
                />
              )}
            </form.Field>
          </div>
          <div className="grid gap-2">
            <Label className="text-[10px] font-bold text-track-mid uppercase">
              % Complete
            </Label>
            <form.Field name="pct">
              {(field) => (
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  className="h-10 rounded-lg"
                />
              )}
            </form.Field>
          </div>
          <div className="col-span-2 grid gap-2">
            <Label className="text-[10px] font-bold text-track-mid uppercase">
              Description / Notes
            </Label>
            <form.Field name="desc">
              {(field) => (
                <Textarea
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Brief task description..."
                  className="min-h-[80px] rounded-lg"
                />
              )}
            </form.Field>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            className="h-10 rounded-lg px-6"
          >
            Cancel
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || upsertTaskMutation.isPending}
                className="h-10 rounded-lg bg-track-red px-6 text-white hover:bg-track-deep-red"
              >
                {isSubmitting || upsertTaskMutation.isPending
                  ? "Saving..."
                  : task
                    ? "Save Changes"
                    : "Add Task"}
              </Button>
            )}
          </form.Subscribe>
        </DialogFooter>
      </form>
    );
  };

  const LogForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const form = useForm({
      defaultValues: {
        memberId: "",
        date: format(new Date(), "yyyy-MM-dd"),
        completed: "",
        progress: "",
        blockers: "",
        hours: "",
      },
      onSubmit: async ({ value }) => {
        upsertLogMutation.mutate(value);
      },
    });

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4 py-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label className="text-[10px] font-bold text-track-mid uppercase">
              Team Member *
            </Label>
            <form.Field name="memberId">
              {(field) => (
                //@ts-ignore
                <Select
                  value={field.state.value}
                  //@ts-ignore
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue placeholder="Select member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m: Member) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </form.Field>
          </div>
          <div className="grid gap-2">
            <Label className="text-[10px] font-bold text-track-mid uppercase">
              Date
            </Label>
            <form.Field name="date">
              {(field) => (
                <Input
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="h-10 rounded-lg"
                />
              )}
            </form.Field>
          </div>
          <div className="col-span-2 grid gap-2">
            <Label className="text-[10px] font-bold text-track-mid uppercase">
              Tasks Completed Today
            </Label>
            <form.Field name="completed">
              {(field) => (
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="List what was finished today..."
                  className="h-20 rounded-lg"
                />
              )}
            </form.Field>
          </div>
          <div className="col-span-2 grid gap-2">
            <Label className="text-[10px] font-bold text-track-mid uppercase">
              Blockers / Challenges
            </Label>
            <form.Field name="blockers">
              {(field) => (
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Any issues preventing delivery?"
                  className="h-20 rounded-lg"
                />
              )}
            </form.Field>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            className="h-10 rounded-lg px-6"
          >
            Cancel
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || upsertLogMutation.isPending}
                className="h-10 rounded-lg bg-track-red px-6 text-white hover:bg-track-deep-red"
              >
                {isSubmitting || upsertLogMutation.isPending
                  ? "Saving..."
                  : "Save Entry"}
              </Button>
            )}
          </form.Subscribe>
        </DialogFooter>
      </form>
    );
  };

  const MemberForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const form = useForm({
      defaultValues: {
        name: "",
        role: "Graphic Designer",
        dept: "",
        contact: "",
      },
      onSubmit: async ({ value }) => {
        upsertMemberMutation.mutate(value);
      },
    });

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4 py-4"
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label className="text-[10px] font-bold text-track-mid uppercase">
              Full Name *
            </Label>
            <form.Field name="name">
              {(field) => (
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="h-10 rounded-lg"
                  required
                />
              )}
            </form.Field>
          </div>
          <div className="grid gap-2">
            <Label className="text-[10px] font-bold text-track-mid uppercase">
              Role *
            </Label>
            <form.Field name="role">
              {(field) => (
                <Select
                  value={field.state.value}
                  //@ts-ignore
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Photographer & Video Editor">
                      Photographer & Video Editor
                    </SelectItem>
                    <SelectItem value="Graphic Designer">
                      Graphic Designer
                    </SelectItem>
                    <SelectItem value="Social Media Manager">
                      Social Media Manager
                    </SelectItem>
                    <SelectItem value="Media Personnel">
                      Media Personnel
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </form.Field>
          </div>
          <div className="grid gap-2">
            <Label className="text-[10px] font-bold text-track-mid uppercase">
              Department
            </Label>
            <form.Field name="dept">
              {(field) => (
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="h-10 rounded-lg"
                />
              )}
            </form.Field>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            className="h-10 rounded-lg px-6"
          >
            Cancel
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || upsertMemberMutation.isPending}
                className="h-10 rounded-lg bg-track-red px-6 text-white hover:bg-track-deep-red"
              >
                {isSubmitting || upsertMemberMutation.isPending
                  ? "Saving..."
                  : "Add Member"}
              </Button>
            )}
          </form.Subscribe>
        </DialogFooter>
      </form>
    );
  };

  // --- Sections ---

  const TopBar = () => (
    <div className="sticky top-0 z-50 flex h-16 items-center justify-between bg-track-deep-red px-6 text-white shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-track-red font-serif text-xl font-black">
          C
        </div>
        <div>
          <h1 className="font-serif text-lg leading-tight font-bold">
            Medicaid Group MediaComm Track
          </h1>
          <p className="text-[10px] text-white/60">
            Medicaid Group · Communications Team
          </p>
        </div>
      </div>
      <div className="text-xs font-medium text-white/70">
        {format(new Date(), "EEE, d MMMM yyyy")}
      </div>
    </div>
  );

  const NavTabs = () => (
    <div className="no-scrollbar overflow-x-auto border-b border-white/10 bg-track-dark-red px-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex h-auto justify-start gap-1 bg-transparent p-0">
          {[
            { id: "dashboard", label: "📊 Dashboard" },
            { id: "tasks", label: "✅ Tasks" },
            { id: "daily", label: "📅 Daily Log" },
            { id: "kpi", label: "🏆 KPI" },
            { id: "team", label: "👥 Team" },
            { id: "member-analysis", label: "👤 Member Analysis" },
            { id: "team-analysis", label: "📈 Team Analysis" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="rounded-none border-b-3 border-transparent px-5 py-3 text-xs font-medium text-white/70 transition-all data-[state=active]:border-b-3 data-[state=active]:border-[#FADBD8] data-[state=active]:bg-transparent data-[state=active]:text-white"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );

  const StatTile = ({
    label,
    value,
    sub,
    color,
  }: {
    label: string;
    value: string | number;
    sub: string;
    color?: string;
  }) => (
    <div
      className={cn(
        "rounded-2xl border-l-4 bg-white p-4 py-5 shadow-sm transition-transform hover:-translate-y-0.5",
        color === "blue"
          ? "border-track-blue"
          : color === "green"
            ? "border-track-green"
            : color === "amber"
              ? "border-track-amber"
              : color === "red"
                ? "border-track-red"
                : "border-track-red",
      )}
    >
      <div className="mb-1 text-[10px] font-semibold tracking-wider text-track-soft uppercase">
        {label}
      </div>
      <div className="font-serif text-3xl leading-none font-bold text-track-dark">
        {value}
      </div>
      <div className="mt-1 text-[10px] text-track-soft">{sub}</div>
    </div>
  );

  const DashboardSection = () => {
    const chartData = members.map((m: Member) => {
      const mTasks = tasks.filter((t: Task) => t.memberId === m.id);
      return {
        name: m.name.split(" ")[0],
        completed: mTasks.filter((t: Task) => t.status === "Completed").length,
        inProgress: mTasks.filter(
          (t: Task) =>
            t.status === "In Progress" &&
            !isBefore(new Date(t.deadline || ""), new Date()),
        ).length,
        overdue: mTasks.filter(
          (t: Task) =>
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
            <Plus className="size-4" /> New Task
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
                <ChartContainer config={chartConfig} className="aspect-auto h-full">
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
                    <ChartLegend content={<ChartLegendContent className="text-[10px]" />} />
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

          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-lg text-track-dark-red">
                <AlertCircle className="size-5" /> Late Turnaround Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.filter(
                  (t: Task) =>
                    t.status !== "Completed" &&
                    t.deadline &&
                    isBefore(new Date(t.deadline), new Date()),
                ).length > 0 ? (
                  tasks
                    .filter(
                      (t: Task) =>
                        t.status !== "Completed" &&
                        t.deadline &&
                        isBefore(new Date(t.deadline), new Date()),
                    )
                    .map((t: Task) => (
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
                    <p className="text-sm">No overdue tasks right now</p>
                  </div>
                )}
              </div>
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
                    On-time rate of {stats.onTimeRate}%. Team is delivering
                    well.
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
      </div>
    );
  };

  const TasksSection = () => {
    const membersx = useQuery(orpc.listMembers.queryOptions());
    const [filterMember, setFilterMember] = useState<string>("All Members");
    const [filterStatus, setFilterStatus] = useState<string>("All Statuses");
    const [filterPriority, setFilterPriority] =
      useState<string>("All Priorities");

    const filteredTasks = tasks.filter((t: Task) => {
      console.log("T is", t);
      const matchMember =
        filterMember === "All Members" ||
        membersx.data?.find((m) => m.id === t.memberId)?.name === filterMember;
      const matchStatus =
        filterStatus === "All Statuses" || t.status === filterStatus;
      const matchPriority =
        filterPriority === "All Priorities" || t.priority === filterPriority;
      return matchMember && matchStatus && matchPriority;
    });

    const roleBadgeColor = (role: string) => {
      if (!role) return "";
      if (role.includes("Social"))
        return "bg-[#E8F8F0] text-[#2E7D52] border-none";
      if (role.includes("Graphic") || role.includes("Design"))
        return "bg-[#EAF2FF] text-[#1565C0] border-none";
      if (role.includes("Media Personnel") || role.includes("PR"))
        return "bg-[#EDF4FF] text-[#0D3B8E] border-none";
      return "bg-[#FCE4F3] text-[#E91E8C] border-none";
    };

    return (
      <div className="animate-in space-y-6 duration-500 fade-in">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-track-dark-red">
              Task Tracker
            </h2>
            <p className="text-sm text-track-soft">
              Assign, monitor and track all team tasks
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="h-10 rounded-lg bg-track-red px-6 text-xs font-semibold text-white shadow-sm transition-all hover:bg-track-deep-red active:scale-95"
          >
            <Plus className="size-4" /> New Task
          </Button>
        </div>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <Select
                value={filterMember} //@ts-ignore
                onValueChange={(e) => setFilterMember(e)}
                defaultValue="All Members"
              >
                <SelectTrigger className="h-9 w-[180px] rounded-lg border-2 border-gray-400 text-xs focus:border-red-500">
                  <SelectValue placeholder="All Members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={filterMember}>All Members</SelectItem>
                  {members?.map((m: Member) => (
                    <SelectItem key={m.id} value={m.name}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filterStatus} //@ts-ignore
                onValueChange={setFilterStatus}
              >
                <SelectTrigger className="h-9 w-[180px] rounded-lg border-2 border-gray-400 text-xs focus:border-red-500">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Statuses">All Statuses</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterPriority} //@ts-ignore
                onValueChange={setFilterPriority}
              >
                <SelectTrigger className="h-9 w-[180px] rounded-lg border-2 border-gray-400 text-xs focus:border-red-500">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent className="">
                  <SelectItem value="All Priorities">All Priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border-none shadow-sm">
          <Table>
            <TableHeader className="bg-track-dark-red">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="py-4 text-xs font-semibold text-white">
                  Task
                </TableHead>
                <TableHead className="text-xs font-semibold text-white">
                  Assigned To
                </TableHead>
                <TableHead className="text-xs font-semibold text-white">
                  Role
                </TableHead>
                <TableHead className="text-xs font-semibold text-white">
                  Deadline
                </TableHead>
                <TableHead className="text-xs font-semibold text-white">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-white">
                  % Done
                </TableHead>
                <TableHead className="text-right text-xs font-semibold text-white">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((t: Task) => (
                  <TableRow
                    key={t.id}
                    className="border-track-border/30 hover:bg-track-pale-red/50"
                  >
                    <TableCell className="py-4">
                      <div className="text-xs font-bold text-track-dark">
                        {t.name}
                      </div>
                      {t.desc && (
                        <div className="mt-0.5 line-clamp-1 text-[10px] text-track-soft">
                          {t.desc}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-track-mid">
                      {getMember(t.memberId).name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "px-2 py-0.5 text-[9px] font-bold",
                          roleBadgeColor(getMember(t.memberId).role),
                        )}
                      >
                        {getMember(t.memberId).role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-track-mid">
                          {t.deadline}
                        </span>
                        {t.status !== "Completed" &&
                          t.deadline &&
                          (isBefore(new Date(t.deadline), new Date()) ? (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-track-red">
                              <AlertCircle className="size-2.5" /> Overdue
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-track-blue">
                              <Clock className="size-2.5" />{" "}
                              {differenceInDays(
                                new Date(t.deadline),
                                new Date(),
                              )}
                              d left
                            </span>
                          ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-none px-2 py-0.5 text-[9px] font-bold shadow-none",
                          t.status === "Completed"
                            ? "bg-track-light-green text-track-green"
                            : t.status === "In Progress"
                              ? "bg-track-light-blue text-track-blue"
                              : "bg-slate-100 text-track-soft",
                        )}
                      >
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex w-24 items-center gap-2">
                        <Progress value={t.pct} className="h-1.5" />
                        <span className="text-[10px] font-bold text-track-mid">
                          {t.pct}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          onClick={() => {
                            setEditingTask(t);
                            setIsTaskModalOpen(true);
                          }}
                          variant="ghost"
                          size="icon"
                          className="size-7 text-track-soft hover:text-track-blue"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          onClick={() => {
                            if (confirm("Delete this task?"))
                              deleteTaskMutation.mutate({ id: t.id });
                          }}
                          variant="ghost"
                          size="icon"
                          className="size-7 text-track-soft hover:text-track-red"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-track-soft"
                  >
                    No tasks found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    );
  };

  const DailyLogSection = () => (
    <div className="animate-in space-y-6 duration-500 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-track-dark-red">
            Daily Check-In Log
          </h2>
          <p className="text-sm text-track-soft">
            Record what each team member worked on today
          </p>
        </div>
        <Button
          onClick={() => setIsLogModalOpen(true)}
          className="h-10 rounded-lg bg-track-red px-6 text-xs font-semibold text-white shadow-sm transition-all hover:bg-track-deep-red active:scale-95"
        >
          <Plus className="size-4" /> Add Log Entry
        </Button>
      </div>

      <div className="grid gap-4">
        {logs.length > 0 ? (
          logs.map((log: Log) => {
            const m = getMember(log.memberId);
            return (
              <Card
                key={log.id}
                className={cn(
                  "relative overflow-hidden rounded-2xl border-none shadow-sm",
                  log.blockers ? "border-l-4 border-track-red" : "",
                )}
              >
                {log.blockers && (
                  <div className="absolute top-3 right-3 animate-pulse rounded-full bg-track-red px-2 py-0.5 text-[8px] font-bold tracking-wider text-white uppercase">
                    Blocker
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-bold text-track-dark">
                      {m.name}
                    </div>
                    <Badge className="border-none bg-[#EAF2FF] text-[9px] font-bold text-[#1565C0]">
                      {m.role}
                    </Badge>
                    <div className="flex items-center gap-1 text-[10px] font-medium text-track-soft">
                      <CalendarIcon className="size-3" /> {log.date}{" "}
                      {log.hours && `· ${log.hours}hrs`}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {log.completed && (
                    <div className="text-xs text-track-mid">
                      <strong className="flex items-center gap-1 text-track-dark">
                        <CheckCircle2 className="size-3 text-track-green" />{" "}
                        Completed:
                      </strong>{" "}
                      {log.completed}
                    </div>
                  )}
                  {log.progress && (
                    <div className="text-xs text-track-mid">
                      <strong className="flex items-center gap-1 text-track-dark">
                        <Clock className="size-3 text-track-blue" /> In
                        Progress:
                      </strong>{" "}
                      {log.progress}
                    </div>
                  )}
                  {log.blockers && (
                    <div className="text-xs text-track-red">
                      <strong className="flex items-center gap-1">
                        <AlertCircle className="size-3" /> Blocker:
                      </strong>{" "}
                      {log.blockers}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="rounded-2xl bg-white p-12 text-center text-track-soft shadow-sm">
            <CalendarIcon className="mx-auto mb-3 size-12 opacity-20" />
            <p className="text-sm">
              No log entries yet. Add your first daily check-in.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const KPISection = () => (
    <div className="animate-in space-y-6 duration-500 fade-in">
      <div className="sec-header">
        <h2 className="font-serif text-2xl font-bold text-track-dark-red">
          KPI Dashboard
        </h2>
        <p className="text-sm text-track-soft">
          Individual performance scores and analytics
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {members.map((m: Member) => {
          const mTasks = tasks.filter((t: Task) => t.memberId === m.id);
          const total = mTasks.length;
          const done = mTasks.filter(
            (t: Task) => t.status === "Completed",
          ).length;
          const overdue = mTasks.filter(
            (t: Task) =>
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

  const TeamSection = () => (
    <div className="animate-in space-y-6 duration-500 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-track-dark-red">
            Team Roster
          </h2>
          <p className="text-sm text-track-soft">
            Manage team members and their roles
          </p>
        </div>
        <Button
          onClick={() => setIsMemberModalOpen(true)}
          className="h-10 rounded-lg bg-track-red px-6 text-xs font-semibold text-white shadow-sm transition-all hover:bg-track-deep-red active:scale-95"
        >
          <Plus className="size-4" /> Add Member
        </Button>
      </div>
      <Card className="overflow-hidden rounded-2xl border-none shadow-sm">
        <Table>
          <TableHeader className="bg-track-dark-red">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="py-4 text-xs font-semibold text-white">
                Name
              </TableHead>
              <TableHead className="text-xs font-semibold text-white">
                Role
              </TableHead>
              <TableHead className="text-center text-xs font-semibold text-white">
                Assigned
              </TableHead>
              <TableHead className="text-center text-xs font-semibold text-white">
                Completed
              </TableHead>
              <TableHead className="text-xs font-semibold text-white">
                Performance
              </TableHead>
              <TableHead className="text-right text-xs font-semibold text-white">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m: Member) => {
              const mTasks = tasks.filter((t: Task) => t.memberId === m.id);
              const done = mTasks.filter(
                (t: Task) => t.status === "Completed",
              ).length;
              const rate =
                mTasks.length > 0
                  ? Math.round((done / mTasks.length) * 100)
                  : 0;
              return (
                <TableRow
                  key={m.id}
                  className="border-track-border/30 hover:bg-track-pale-red/50"
                >
                  <TableCell className="py-4 text-xs font-bold text-track-dark">
                    {m.name}
                  </TableCell>
                  <TableCell>
                    <Badge className="border-none bg-[#EAF2FF] text-[9px] font-bold text-[#1565C0]">
                      {m.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-xs font-medium">
                    {mTasks.length}
                  </TableCell>
                  <TableCell className="text-center text-xs font-medium">
                    {done}
                  </TableCell>
                  <TableCell>
                    <div className="flex w-32 items-center gap-2">
                      <Progress
                        value={rate}
                        className={cn(
                          "h-1.5",
                          rate >= 80
                            ? "[&>div]:bg-track-green"
                            : rate >= 60
                              ? "[&>div]:bg-track-blue"
                              : "[&>div]:bg-track-red",
                        )}
                      />
                      <span className="text-[10px] font-bold text-track-mid">
                        {rate}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => {
                        if (confirm("Remove this member?"))
                          deleteMemberMutation.mutate({ id: m.id });
                      }}
                      variant="outline"
                      size="sm"
                      className="h-7 border-track-border text-[10px] text-track-soft hover:text-track-red"
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const MemberAnalysisSection = () => {
    const [selectedMemberName, setSelectedMemberName] = useState<string>(
      "-- Choose a member --",
    );

    // membersx.data?.find((m) => m.id === t.memberId)?.name === filterMember;
    const membersx = useQuery(orpc.listMembers.queryOptions());
    const mTasks = tasks.filter(
      (t: Task) =>
        membersx.data?.find((m) => m.id === t.memberId)?.name ===
        selectedMemberName,
    );
    const total = mTasks.length;
    const done = mTasks.filter((t: Task) => t.status === "Completed").length;
    const onTimeRate = total > 0 ? Math.round((done / total) * 100) : 0;
    const overdue = mTasks.filter(
      (t: Task) =>
        t.status !== "Completed" &&
        t.deadline &&
        isBefore(new Date(t.deadline), new Date()),
    ).length;

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
              //@ts-ignore
              onValueChange={setSelectedMemberName}
            >
              <SelectTrigger
                id="member-select"
                className="h-10 w-60 rounded-lg border-2 border-gray-400 text-xs focus:border-red-500"
              >
                <SelectValue placeholder="-- Choose a member --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key={1} value={"-- Choose a member --"}>
                  -- Choose a member --
                </SelectItem>
                {members.map((m: Member) => (
                  <SelectItem key={m.id} value={m.name}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        {selectedMemberName && (
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
                  value: logs.filter(
                    (l: Log) => l.memberId === selectedMemberName,
                  ).length,
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
                    {mTasks.slice(0, 5).map((t: Task) => (
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
  };

  const TeamAnalysisSection = () => {
    const leaderboard = members
      .map((m: Member) => {
        const mt = tasks.filter((t: Task) => t.memberId === m.id);
        const d = mt.filter((t: Task) => t.status === "Completed").length;
        const ot = mt.length > 0 ? Math.round((d / mt.length) * 100) : 0;
        return { ...m, score: ot, total: mt.length, done: d };
      })
      .sort((a: any, b: any) => b.score - a.score);

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
              value: logs.filter((l: Log) => l.blockers).length,
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
  };

  return (
    <div className="min-h-screen bg-track-bg pb-12">
      <TopBar />
      <NavTabs />
      <main className="mx-auto max-w-[1280px] px-6 pt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent
            value="dashboard"
            className="m-0 border-none p-0 outline-none"
          >
            <DashboardSection />
          </TabsContent>
          <TabsContent
            value="tasks"
            className="m-0 border-none p-0 outline-none"
          >
            <TasksSection />
          </TabsContent>
          <TabsContent
            value="daily"
            className="m-0 border-none p-0 outline-none"
          >
            <DailyLogSection />
          </TabsContent>
          <TabsContent value="kpi" className="m-0 border-none p-0 outline-none">
            <KPISection />
          </TabsContent>
          <TabsContent
            value="team"
            className="m-0 border-none p-0 outline-none"
          >
            <TeamSection />
          </TabsContent>
          <TabsContent
            value="member-analysis"
            className="m-0 border-none p-0 outline-none"
          >
            <MemberAnalysisSection />
          </TabsContent>
          <TabsContent
            value="team-analysis"
            className="m-0 border-none p-0 outline-none"
          >
            <TeamAnalysisSection />
          </TabsContent>
        </Tabs>
      </main>

      {/* --- Modals --- */}
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
            onSuccess={() => setIsTaskModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isLogModalOpen} onOpenChange={setIsLogModalOpen}>
        <DialogContent className="rounded-2xl sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-track-dark-red">
              📅 Daily Check-In
            </DialogTitle>
            <DialogDescription>
              Record today's work and challenges.
            </DialogDescription>
          </DialogHeader>
          <LogForm onSuccess={() => setIsLogModalOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isMemberModalOpen} onOpenChange={setIsMemberModalOpen}>
        <DialogContent className="rounded-2xl sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-track-dark-red">
              👤 Add Team Member
            </DialogTitle>
            <DialogDescription>
              Add a new member to the Communications team.
            </DialogDescription>
          </DialogHeader>
          <MemberForm onSuccess={() => setIsMemberModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
