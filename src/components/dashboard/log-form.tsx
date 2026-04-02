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

export const LogForm = ({
  members,
  onSuccess,
}: {
  members: any[];
  onSuccess: () => void;
}) => {
  const queryClient = useQueryClient();

  const upsertLogMutation = useMutation(
    orpc.upsertLog.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.listLogs.queryOptions());
        onSuccess();
        toast.success("Log entry saved");
      },
    }),
  );

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
              <Select
                value={field.state.value}
                onValueChange={(e) => field.handleChange(String(e))}
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
