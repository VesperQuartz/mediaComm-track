"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MemberForm } from "@/components/dashboard/member-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";

export default function TeamPage() {
  const queryClient = useQueryClient();

  const { data: members = [], isLoading: isLoadingMembers } = useQuery(
    orpc.listMembers.queryOptions(),
  );
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery(
    orpc.listTasks.queryOptions(),
  );

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  const deleteMemberMutation = useMutation(
    orpc.deleteMember.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.listMembers.queryOptions());
        toast.success("Member removed");
      },
    }),
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
              <TableHead className="py-4 text-xs font-semibold text-white whitespace-nowrap">
                Name
              </TableHead>
              <TableHead className="text-xs font-semibold text-white whitespace-nowrap">
                Role
              </TableHead>
              <TableHead className="text-center text-xs font-semibold text-white whitespace-nowrap">
                Assigned
              </TableHead>
              <TableHead className="text-center text-xs font-semibold text-white whitespace-nowrap">
                Completed
              </TableHead>
              <TableHead className="text-xs font-semibold text-white whitespace-nowrap">
                Performance
              </TableHead>
              <TableHead className="text-right text-xs font-semibold text-white whitespace-nowrap">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m: any) => {
              const mTasks = tasks.filter((t: any) => t.memberId === m.id);
              const done = mTasks.filter(
                (t: any) => t.status === "Completed",
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
                  <TableCell className="py-4 text-xs font-bold text-track-dark whitespace-nowrap">
                    {m.name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge className="border-none bg-[#EAF2FF] text-[9px] font-bold text-[#1565C0]">
                      {m.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-xs font-medium whitespace-nowrap">
                    {mTasks.length}
                  </TableCell>
                  <TableCell className="text-center text-xs font-medium whitespace-nowrap">
                    {done}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
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
                  <TableCell className="text-right whitespace-nowrap">
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
