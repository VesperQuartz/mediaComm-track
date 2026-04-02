"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/lib/orpc";

export const TaskForm = ({
  task,
  members,
  onSuccess,
}: {
  task?: any;
  members: any[];
  onSuccess: () => void;
}) => {
  const queryClient = useQueryClient();

  const upsertTaskMutation = useMutation(
    orpc.upsertTask.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.listTasks.queryOptions());
        onSuccess();
        toast.success("Task saved");
      },
    }),
  );

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
                  {members.map((m: any) => (
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
