"use client";

import { useState, useRef } from "react";
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
import { Sparkles, AlertCircle, Clock, WifiOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { AILoadingIndicator } from "@/components/AILoadingIndicator";
import { AITaskPreview, type GeneratedTask } from "@/components/AITaskPreview";
import type { ProjectStatus } from "@/components/StatusBadge";
import { fireRealisticConfetti } from "@/lib/confetti";

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
  const [aiError, setAiError] = useState<{
    type:
      | "rate_limit"
      | "api_key"
      | "timeout"
      | "network"
      | "invalid_response"
      | "unknown";
    message: string;
    retryable: boolean;
  } | null>(null);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 2;

  /**
   * Enhanced error handler with specific error types and retry logic
   */
  const handleAIError = (error: any) => {
    const errorMessage = error?.message || error?.toString() || "Unknown error";

    // Reset AI preview on error
    setShowAiPreview(false);

    // Rate limit error
    if (errorMessage.includes("rate_limit") || errorMessage.includes("429")) {
      setAiError({
        type: "rate_limit",
        message:
          "AI service is currently busy. Please wait 30 seconds and try again.",
        retryable: true,
      });
      toast.error("AI service busy", {
        description: "Please wait 30 seconds before retrying.",
        icon: <Clock className="h-4 w-4" />,
      });
      return;
    }

    // API key error
    if (
      errorMessage.includes("API key") ||
      errorMessage.includes("401") ||
      errorMessage.includes("403")
    ) {
      setAiError({
        type: "api_key",
        message: "AI configuration error. Please contact support.",
        retryable: false,
      });
      toast.error("Configuration Error", {
        description: "Please contact support to resolve this issue.",
        icon: <AlertCircle className="h-4 w-4" />,
      });
      return;
    }

    // Timeout error
    if (
      errorMessage.includes("timeout") ||
      errorMessage.includes("ECONNABORTED")
    ) {
      setAiError({
        type: "timeout",
        message: "Request timed out. The AI service took too long to respond.",
        retryable: true,
      });
      toast.error("Request Timeout", {
        description: "The request took too long. Please try again.",
        icon: <Clock className="h-4 w-4" />,
      });
      return;
    }

    // Network error
    if (
      errorMessage.includes("network") ||
      errorMessage.includes("ENOTFOUND") ||
      errorMessage.includes("ECONNREFUSED")
    ) {
      setAiError({
        type: "network",
        message:
          "Network connection error. Please check your internet connection.",
        retryable: true,
      });
      toast.error("Network Error", {
        description: "Please check your internet connection and try again.",
        icon: <WifiOff className="h-4 w-4" />,
      });
      return;
    }

    // Invalid response
    if (
      errorMessage.includes("parse") ||
      errorMessage.includes("JSON") ||
      errorMessage.includes("invalid")
    ) {
      setAiError({
        type: "invalid_response",
        message: "Received invalid response from AI. Please try again.",
        retryable: true,
      });
      toast.error("Invalid Response", {
        description: "Received an unexpected response. Please try again.",
        icon: <AlertCircle className="h-4 w-4" />,
      });
      return;
    }

    // Unknown error
    setAiError({
      type: "unknown",
      message: "Could not generate tasks. Please try manually creating them.",
      retryable: true,
    });
    toast.error("Generation Failed", {
      description: "Could not generate tasks. You can create them manually.",
      icon: <AlertCircle className="h-4 w-4" />,
    });
  };

  // AI task generation mutation
  const generateTasks = useMutation({
    ...trpc.projects.generateTasks.mutationOptions(),
    onSuccess: (tasks) => {
      setAiTasks(tasks);
      setShowAiPreview(true);
      setAiError(null);
      retryCountRef.current = 0;

      toast.success("Tasks Generated!", {
        description: `Successfully generated ${tasks.length} tasks for your project.`,
        icon: <Sparkles className="h-4 w-4" />,
      });
    },
    onError: handleAIError,
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

      // Show success feedback
      if (mode === "create") {
        // Fire confetti for new project creation
        fireRealisticConfetti();

        // Show success toast
        if (tasksToCreate && tasksToCreate.length > 0) {
          toast.success("Project Created!", {
            description: `Created project with ${tasksToCreate.length} AI-generated tasks!`,
            duration: 5000,
          });
        } else {
          toast.success("Project Created!", {
            description: "Your new project has been created successfully.",
            duration: 4000,
          });
        }
      } else {
        toast.success("Project Updated!", {
          description: "Your project has been updated successfully.",
        });
      }

      // Reset form and AI state
      form.reset();
      setAiTasks([]);
      setShowAiPreview(false);
      setAiError(null);

      // Close the dialog after successful submission
      onOpenChange(false);
    },
    validators: {
      onSubmit: projectSchema,
    },
  });

  /**
   * Handle AI task generation with retry logic
   */
  const handleGenerateTasks = async () => {
    const projectName = form.state.values.name;
    const projectDescription = form.state.values.description;

    if (!projectName || projectName.trim().length === 0) {
      toast.error("Please enter a project name first");
      return;
    }

    // Clear previous error
    setAiError(null);

    await generateTasks.mutateAsync({
      projectName: projectName.trim(),
      projectDescription: projectDescription?.trim() || undefined,
      taskCount: 10, // Default to 10 tasks
    });
  };

  /**
   * Retry AI task generation
   */
  const handleRetryGeneration = async () => {
    if (retryCountRef.current >= MAX_RETRIES) {
      toast.error("Maximum retries reached", {
        description: "Please try again later or create tasks manually.",
      });
      return;
    }

    retryCountRef.current += 1;
    await handleGenerateTasks();
  };

  /**
   * Reset state when dialog closes
   */
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset AI state when closing dialog
      setAiTasks([]);
      setShowAiPreview(false);
      setAiError(null);
      retryCountRef.current = 0;
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {mode === "create" ? "Create New Project" : "Edit Project"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new project to start tracking tasks and progress."
              : "Update your project details."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {/* Scrollable content wrapper */}

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
                <form.Subscribe selector={(state) => state.values.name}>
                  {(projectName) => (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateTasks}
                      disabled={
                        generateTasks.isPending ||
                        !projectName ||
                        projectName.trim().length === 0
                      }
                      className="w-full border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-colors"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {generateTasks.isPending
                        ? "Generating Tasks..."
                        : "Generate Tasks with AI"}
                    </Button>
                  )}
                </form.Subscribe>

                {/* AI Loading Indicator */}
                {generateTasks.isPending && <AILoadingIndicator />}

                {/* AI Error State with Retry */}
                {aiError && !generateTasks.isPending && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-2">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-destructive">
                            {aiError.type === "rate_limit" &&
                              "Rate Limit Reached"}
                            {aiError.type === "api_key" &&
                              "Configuration Error"}
                            {aiError.type === "timeout" && "Request Timeout"}
                            {aiError.type === "network" && "Network Error"}
                            {aiError.type === "invalid_response" &&
                              "Invalid Response"}
                            {aiError.type === "unknown" && "Generation Failed"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {aiError.message}
                          </p>
                        </div>

                        {/* Retry button for retryable errors */}
                        {aiError.retryable && (
                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={handleRetryGeneration}
                              disabled={retryCountRef.current >= MAX_RETRIES}
                              className="h-8 text-xs"
                            >
                              <RefreshCw className="mr-1.5 h-3 w-3" />
                              Retry{" "}
                              {retryCountRef.current > 0 &&
                                `(${retryCountRef.current}/${MAX_RETRIES})`}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setAiError(null)}
                              className="h-8 text-xs"
                            >
                              Dismiss
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

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
        </div>
        {/* End scrollable content wrapper */}
      </DialogContent>
    </Dialog>
  );
}
