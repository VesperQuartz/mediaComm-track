"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { differenceInDays, isBefore } from "date-fns";
import { AlertCircle, Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TaskForm } from "@/components/dashboard/task-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";

export default function TasksPage() {
  const queryClient = useQueryClient();
  const session = authClient.useSession();

  const { data: members = [], isLoading: isLoadingMembers } = useQuery(
    orpc.listMembers.queryOptions(),
  );
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery(
    orpc.listTasks.queryOptions(),
  );

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);

  const [filterMember, setFilterMember] = useState<string>("All Members");
  const [filterStatus, setFilterStatus] = useState<string>("All Statuses");
  const [filterPriority, setFilterPriority] =
    useState<string>("All Priorities");
  const [taskSearch, setTaskSearch] = useState("");
  const [taskPage, setTaskPage] = useState(1);
  const tasksPerPage = 10;

  const deleteTaskMutation = useMutation(
    orpc.deleteTask.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.listTasks.queryOptions());
        toast.success("Task deleted");
      },
      onError: (e) => {
        toast.error(e.message);
      },
    }),
  );

  const getMember = (id: string) =>
    members.find((m: any) => m.id === id) || ({} as any);

  if (isLoadingMembers || isLoadingTasks) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-track-red"></div>
      </div>
    );
  }

  const filteredTasks = tasks.filter((t: any) => {
    const member = getMember(t.memberId);
    const memberName = member.name?.toLowerCase() || "";
    const taskName = t.name?.toLowerCase() || "";
    const taskDesc = t.desc?.toLowerCase() || "";
    const search = taskSearch.toLowerCase();

    const matchSearch =
      memberName.includes(search) ||
      taskName.includes(search) ||
      taskDesc.includes(search);

    const matchMember =
      filterMember === "All Members" || member.name === filterMember;
    const matchStatus =
      filterStatus === "All Statuses" || t.status === filterStatus;
    const matchPriority =
      filterPriority === "All Priorities" || t.priority === filterPriority;
    return matchSearch && matchMember && matchStatus && matchPriority;
  });

  const paginatedTasks = filteredTasks.slice(
    (taskPage - 1) * tasksPerPage,
    taskPage * tasksPerPage,
  );

  const totalTaskPages = Math.ceil(filteredTasks.length / tasksPerPage);

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
      </div>

      <Card className="rounded-2xl border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative w-[250px]">
              <Input
                placeholder="Search tasks, members..."
                value={taskSearch}
                onChange={(e) => {
                  setTaskSearch(e.target.value);
                  setTaskPage(1);
                }}
                className="h-9 rounded-lg border-2 border-gray-400 text-xs focus:border-red-500"
              />
            </div>

            <Select
              value={filterMember}
              onValueChange={(val) => {
                setFilterMember(String(val));
                setTaskPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-45 rounded-lg border-2 border-gray-400 text-xs focus:border-red-500">
                <SelectValue placeholder="All Members" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Members">All Members</SelectItem>
                {members?.map((m: any) => (
                  <SelectItem key={m.id} value={m.name}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterStatus}
              onValueChange={(val) => {
                setFilterStatus(String(val));
                setTaskPage(1);
              }}
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
              value={filterPriority}
              onValueChange={(val) => {
                setFilterPriority(String(val));
                setTaskPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[180px] rounded-lg border-2 border-gray-400 text-xs focus:border-red-500">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
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
              <TableHead className="max-w-[400px] min-w-[200px] py-4 text-xs font-semibold text-white">
                Task
              </TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap text-white">
                Assigned To
              </TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap text-white">
                Role
              </TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap text-white">
                Deadline
              </TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap text-white">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap text-white">
                % Done
              </TableHead>
              <TableHead className="text-right text-xs font-semibold whitespace-nowrap text-white">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTasks.length > 0 ? (
              paginatedTasks.map((t: any) => (
                <TableRow
                  key={t.id}
                  className="border-track-border/30 hover:bg-track-pale-red/50"
                >
                  <TableCell className="max-w-[400px] min-w-[200px] py-4">
                    <div className="text-xs font-bold break-words text-track-dark">
                      {t.name}
                    </div>
                    {t.desc && (
                      <div className="mt-0.5 line-clamp-2 text-[10px] break-words text-track-soft">
                        {t.desc}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-medium whitespace-nowrap text-track-mid">
                    {getMember(t.memberId).name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      className={cn(
                        "px-2 py-0.5 text-[9px] font-bold",
                        roleBadgeColor(getMember(t.memberId).role),
                      )}
                    >
                      {getMember(t.memberId).role}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
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
                            {differenceInDays(new Date(t.deadline), new Date())}
                            d left
                          </span>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
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
                  <TableCell className="whitespace-nowrap">
                    <div className="flex w-24 items-center gap-2">
                      <Progress value={t.pct} className="h-1.5" />
                      <span className="text-[10px] font-bold text-track-mid">
                        {t.pct}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
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
                      {session.data && (
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
                      )}
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

        {totalTaskPages > 1 && (
          <div className="border-t p-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={taskPage === 1}
                    onClick={() => setTaskPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <span className="px-4 text-xs text-track-soft">
                    Page {taskPage} of {totalTaskPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={taskPage === totalTaskPages}
                    onClick={() =>
                      setTaskPage((p) => Math.min(totalTaskPages, p + 1))
                    }
                  >
                    Next
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
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
