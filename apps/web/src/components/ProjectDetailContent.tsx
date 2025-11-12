"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { StatusBadge, type ProjectStatus } from "@/components/StatusBadge";
import { ProgressBar } from "@/components/ProgressBar";
import { TaskList } from "@/components/TaskList";
import { ProjectForm } from "@/components/ProjectForm";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, Edit, Trash2, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectDetailContentProps {
  projectId: number;
}

export function ProjectDetailContent({ projectId }: ProjectDetailContentProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch project with tasks
  const {
    data: projectData,
    isLoading,
    error,
  } = useQuery(trpc.projects.getById.queryOptions({ id: projectId }));

  // Mutations
  const updateProject = useMutation({
    ...trpc.projects.update.mutationOptions(),
    onMutate: async (updates) => {
      const queryKey = trpc.projects.getById.queryOptions({
        id: projectId,
      }).queryKey;
      await queryClient.cancelQueries({ queryKey });

      // Optimistically update the project
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return { ...old, ...updates };
      });

      return undefined;
    },
    onError: () => {
      toast.error("Failed to update project");
      const queryKey = trpc.projects.getById.queryOptions({
        id: projectId,
      }).queryKey;
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: () => {
      toast.success("Project updated successfully");
    },
    onSettled: () => {
      const projectQueryKey = trpc.projects.getById.queryOptions({
        id: projectId,
      }).queryKey;
      const allProjectsQueryKey = trpc.projects.getAll.queryOptions().queryKey;
      queryClient.invalidateQueries({ queryKey: projectQueryKey });
      queryClient.invalidateQueries({ queryKey: allProjectsQueryKey });
    },
  });

  const deleteProject = useMutation({
    ...trpc.projects.delete.mutationOptions(),
    onSuccess: () => {
      toast.success("Project deleted successfully");
      router.push("/dashboard");
    },
    onError: () => {
      toast.error("Failed to delete project");
    },
  });

  // Calculate task statistics
  const taskStats = useMemo(() => {
    if (!projectData?.tasks) return { total: 0, completed: 0 };
    const total = projectData.tasks.length;
    const completed = projectData.tasks.filter(
      (t) => t.status === "complete"
    ).length;
    return { total, completed };
  }, [projectData?.tasks]);

  const handleUpdateProject = async (data: {
    name: string;
    description: string;
    status: ProjectStatus;
  }) => {
    await updateProject.mutateAsync({
      id: projectId,
      ...data,
    });
    setIsEditDialogOpen(false);
  };

  const handleDeleteProject = async () => {
    await deleteProject.mutateAsync({ id: projectId });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Breadcrumb Skeleton */}
        <Skeleton className="h-6 w-48" />

        {/* Header Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-32" />
        </div>

        {/* Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !projectData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-destructive">
            Project Not Found
          </h2>
          <p className="text-muted-foreground">
            The project you're looking for doesn't exist or you don't have
            access to it.
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/dashboard")}
        className="gap-1 px-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      {/* Project Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight">
                {projectData.name}
              </h1>
              <StatusBadge status={projectData.status} />
            </div>
            {projectData.description && (
              <p className="text-muted-foreground text-lg max-w-3xl">
                {projectData.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span className="text-muted-foreground">
                  {taskStats.completed} of {taskStats.total} tasks completed
                </span>
              </div>
              <ProgressBar value={projectData.progress} showLabel />
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  <span>{taskStats.completed} Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Circle className="h-3.5 w-3.5" />
                  <span>{taskStats.total - taskStats.completed} Remaining</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Tasks Section */}
      <TaskList projectId={projectId} tasks={projectData.tasks} />

      {/* Edit Project Dialog */}
      <ProjectForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateProject}
        mode="edit"
        initialData={{
          name: projectData.name,
          description: projectData.description || "",
          status: projectData.status,
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{projectData.name}"? This action
              cannot be undone and will also delete all {taskStats.total}{" "}
              associated task
              {taskStats.total !== 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={deleteProject.isPending}
            >
              {deleteProject.isPending ? (
                <>
                  <Trash2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
