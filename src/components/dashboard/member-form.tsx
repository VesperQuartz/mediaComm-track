"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { orpc } from "@/lib/orpc";

export const MemberForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const queryClient = useQueryClient();

  const upsertMemberMutation = useMutation(
    orpc.upsertMember.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.listMembers.queryOptions());
        onSuccess();
        toast.success("Member saved");
      },
    }),
  );

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
                onValueChange={(e) => field.handleChange(String(e))}
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
