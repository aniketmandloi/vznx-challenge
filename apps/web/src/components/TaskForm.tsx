"use client";

import { useForm } from "@tanstack/react-form";
import z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface TaskFormData {
  name: string;
  assignedToId: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface TaskFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  availableUsers?: User[];
  mode?: "inline" | "dialog";
  projectId: number;
}

const taskSchema = z.object({
  name: z.string().min(1, "Task name is required").max(200, "Name too long"),
  assignedToId: z.string().nullable(),
});

export function TaskForm({
  open = false,
  onOpenChange,
  onSubmit,
  availableUsers = [],
  mode = "dialog",
  projectId,
}: TaskFormProps) {
  const form = useForm({
    defaultValues: {
      name: "",
      assignedToId: null as string | null,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value as TaskFormData);
      form.reset();
      if (onOpenChange) onOpenChange(false);
    },
    validators: {
      onSubmit: taskSchema,
    },
  });

  const FormContent = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field name="name">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Task Name *</Label>
            <Input
              id={field.name}
              name={field.name}
              placeholder="e.g., Design wireframes"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              autoFocus
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]?.toString()}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {availableUsers.length > 0 && (
        <form.Field name="assignedToId">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Assign To</Label>
              <Select
                value={field.state.value || ""}
                onValueChange={(value) =>
                  field.handleChange(value === "" ? null : value)
                }
              >
                <SelectTrigger id={field.name}>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors[0]?.toString()}
                </p>
              )}
            </div>
          )}
        </form.Field>
      )}

      <form.Subscribe>
        {(state) => (
          <div className="flex justify-end gap-3">
            {mode === "dialog" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  if (onOpenChange) onOpenChange(false);
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={!state.canSubmit || state.isSubmitting}
              className={mode === "inline" ? "w-full" : ""}
            >
              {state.isSubmitting ? (
                "Adding..."
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </>
              )}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );

  if (mode === "inline") {
    return (
      <div className="rounded-lg border p-4 bg-muted/50">
        <FormContent />
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Create a new task for this project. You can assign it to a team
            member.
          </DialogDescription>
        </DialogHeader>
        <FormContent />
      </DialogContent>
    </Dialog>
  );
}
