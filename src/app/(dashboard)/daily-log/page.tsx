"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { LogForm } from "@/components/dashboard/log-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";

export default function DailyLogPage() {
  const { data: members = [], isLoading: isLoadingMembers } = useQuery(
    orpc.listMembers.queryOptions(),
  );
  const { data: logs = [], isLoading: isLoadingLogs } = useQuery(
    orpc.listLogs.queryOptions(),
  );

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const getMember = (id: string) =>
    members.find((m: any) => m.id === id) || ({} as any);

  if (isLoadingMembers || isLoadingLogs) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-track-red"></div>
      </div>
    );
  }

  return (
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
          logs.map((log: any) => {
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
          <LogForm
            members={members}
            onSuccess={() => setIsLogModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
