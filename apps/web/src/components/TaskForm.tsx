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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";

interface TaskFormData {
  name: string;
  assignedToId: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
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
                value={field.state.value || "unassigned"}
                onValueChange={(value) =>
                  field.handleChange(value === "unassigned" ? null : value)
                }
              >
                <SelectTrigger id={field.name}>
                  <SelectValue placeholder="Unassigned">
                    {field.state.value
                      ? (() => {
                          const selectedUser = availableUsers.find(
                            (u) => u.id === field.state.value
                          );
                          return selectedUser ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage
                                  src={selectedUser.image || undefined}
                                  alt={selectedUser.name}
                                />
                                <AvatarFallback className="text-[9px]">
                                  {selectedUser.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                {selectedUser.name || selectedUser.email}
                              </span>
                            </div>
                          ) : (
                            "Unassigned"
                          );
                        })()
                      : "Unassigned"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">
                    <div className="flex items-center gap-2">Unassigned</div>
                  </SelectItem>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage
                            src={user.image || undefined}
                            alt={user.name}
                          />
                          <AvatarFallback className="text-[9px]">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name || user.email}</span>
                      </div>
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
