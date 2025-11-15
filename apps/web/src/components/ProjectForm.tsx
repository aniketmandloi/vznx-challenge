"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { AILoadingIndicator } from "@/components/AILoadingIndicator";
import { AITaskPreview, type GeneratedTask } from "@/components/AITaskPreview";
import type { ProjectStatus } from "@/components/StatusBadge";

interface ProjectFormData {
  name: string;
  description: string;
  status: ProjectStatus;
}

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProjectFormData, aiTasks?: GeneratedTask[]) => Promise<void>;
  initialData?: Partial<ProjectFormData>;
  mode?: "create" | "edit";
}

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long"),
  status: z.enum(["planning", "in-progress", "completed", "on-hold"]),
});

export function ProjectForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = "create",
}: ProjectFormProps) {
  // AI task generation state
  const [aiTasks, setAiTasks] = useState<GeneratedTask[]>([]);
  const [showAiPreview, setShowAiPreview] = useState(false);

  // AI task generation mutation
  const generateTasks = useMutation({
    ...trpc.projects.generateTasks.mutationOptions(),
    onSuccess: (tasks) => {
      setAiTasks(tasks);
      setShowAiPreview(true);
      toast.success(`Generated ${tasks.length} tasks!`);
    },
    onError: (error: any) => {
      // Handle specific error types
      if (error.message?.includes("rate_limit")) {
        toast.error("AI service busy. Please wait 30 seconds and try again.");
      } else if (error.message?.includes("API key")) {
        toast.error("AI configuration error. Please contact support.");
      } else {
        toast.error("Could not generate tasks. Try manually creating them.");
      }
    },
  });


  const form = useForm({
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      status: (initialData?.status || "planning") as ProjectStatus,
    },
    onSubmit: async ({ value }) => {
      // Pass AI tasks to parent if they exist (only in create mode)
      const tasksToCreate =
        mode === "create" && aiTasks.length > 0 ? aiTasks : undefined;

      // Create the project (and tasks will be created by parent if provided)
      await onSubmit(value as ProjectFormData, tasksToCreate);

      // Reset form and AI state
      form.reset();
      setAiTasks([]);
      setShowAiPreview(false);
    },
    validators: {
      onSubmit: projectSchema,
    },
  });

  /**
   * Handle AI task generation
   */
  const handleGenerateTasks = async () => {
    const projectName = form.getFieldValue("name");
    const projectDescription = form.getFieldValue("description");

    if (!projectName || projectName.trim().length === 0) {
      toast.error("Please enter a project name first");
      return;
    }

    await generateTasks.mutateAsync({
      projectName: projectName.trim(),
      projectDescription: projectDescription?.trim() || undefined,
      taskCount: 10, // Default to 10 tasks
    });
  };

  /**
   * Reset state when dialog closes
   */
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset AI state when closing dialog
      setAiTasks([]);
      setShowAiPreview(false);
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Project" : "Edit Project"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new project to start tracking tasks and progress."
              : "Update your project details."}
          </DialogDescription>
        </DialogHeader>

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
                <Label htmlFor={field.name}>Project Name *</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="e.g., Modern Villa Design"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]?.toString()}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Description</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  placeholder="Describe your project... (e.g., 3-bedroom luxury villa with sustainable features)"
                  rows={4}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]?.toString()}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* AI Task Generation Button - Only in Create Mode */}
          {mode === "create" && (
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateTasks}
                disabled={
                  generateTasks.isPending || !form.getFieldValue("name")
                }
                className="w-full border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-colors"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {generateTasks.isPending
                  ? "Generating Tasks..."
                  : "Generate Tasks with AI"}
              </Button>

              {/* AI Loading Indicator */}
              {generateTasks.isPending && <AILoadingIndicator />}

              {/* AI Task Preview */}
              {showAiPreview && aiTasks.length > 0 && (
                <div className="pt-2">
                  <AITaskPreview
                    tasks={aiTasks}
                    onTasksChange={setAiTasks}
                    isLoading={generateTasks.isPending}
                  />
                </div>
              )}

              {/* Separator if AI preview is shown */}
              {showAiPreview && <Separator className="my-4" />}
            </div>
          )}

          <form.Field name="status">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Status</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(value as ProjectStatus)
                  }
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
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

          <form.Subscribe>
            {(state) => (
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    onOpenChange(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!state.canSubmit || state.isSubmitting}
                >
                  {state.isSubmitting
                    ? "Saving..."
                    : mode === "create"
                    ? "Create Project"
                    : "Update Project"}
                </Button>
              </div>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  );
}
