"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { TaskItem } from "@/components/TaskItem";
import { TaskForm } from "@/components/TaskForm";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, ListTodo, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Task = {
  id: number;
  name: string;
  status: "incomplete" | "complete";
  projectId: number;
  assignedToId: string | null;
  order: number;
  createdAt: Date | string;
  updatedAt: Date | string;
};

interface TaskListProps {
  projectId: number;
  tasks: Task[];
  availableUsers?: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

export function TaskList({
  projectId,
  tasks,
  availableUsers = [],
}: TaskListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Mutations with optimistic updates
  const createTask = useMutation({
    ...trpc.tasks.create.mutationOptions(),
    onMutate: async (newTask) => {
      const queryKey = trpc.projects.getById.queryOptions({
        id: projectId,
      }).queryKey;
      await queryClient.cancelQueries({ queryKey });

      // Optimistically add the new task
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tasks: [
            ...old.tasks,
            {
              id: Date.now(), // Temporary ID
              name: newTask.name,
              status: "incomplete" as const,
              projectId,
              assignedToId: newTask.assignedToId || null,
              order: old.tasks.length,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        };
      });

      return undefined;
    },
    onError: () => {
      toast.error("Failed to create task");
      const queryKey = trpc.projects.getById.queryOptions({
        id: projectId,
      }).queryKey;
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: () => {
      toast.success("Task created successfully");
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

  const toggleTaskStatus = useMutation({
    ...trpc.tasks.toggleStatus.mutationOptions(),
    onMutate: async (variables) => {
      const queryKey = trpc.projects.getById.queryOptions({
        id: projectId,
      }).queryKey;
      await queryClient.cancelQueries({ queryKey });

      // Optimistically toggle the task status
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map((task: Task) =>
            task.id === variables.id
              ? {
                  ...task,
                  status:
                    task.status === "complete" ? "incomplete" : "complete",
                }
              : task
          ),
        };
      });

      return undefined;
    },
    onError: () => {
      toast.error("Failed to update task");
      const queryKey = trpc.projects.getById.queryOptions({
        id: projectId,
      }).queryKey;
      queryClient.invalidateQueries({ queryKey });
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

  const deleteTask = useMutation({
    ...trpc.tasks.delete.mutationOptions(),
    onMutate: async (variables) => {
      const queryKey = trpc.projects.getById.queryOptions({
        id: projectId,
      }).queryKey;
      await queryClient.cancelQueries({ queryKey });

      // Optimistically remove the task
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.filter((task: Task) => task.id !== variables.id),
        };
      });

      return undefined;
    },
    onError: () => {
      toast.error("Failed to delete task");
      const queryKey = trpc.projects.getById.queryOptions({
        id: projectId,
      }).queryKey;
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: () => {
      toast.success("Task deleted successfully");
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

  const handleCreateTask = async (data: {
    name: string;
    assignedToId: string | null;
  }) => {
    await createTask.mutateAsync({
      name: data.name,
      projectId,
      assignedToId: data.assignedToId || undefined,
    });
  };

  const handleToggleStatus = (taskId: number) => {
    toggleTaskStatus.mutate({ id: taskId });
  };

  const handleDeleteTask = async () => {
    if (taskToDelete) {
      await deleteTask.mutateAsync({ id: taskToDelete });
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const confirmDelete = (taskId: number) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <ListTodo className="h-6 w-6" />
          Tasks
        </h2>
        <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No tasks yet"
          description="Get started by adding your first task to this project."
          action={{
            label: "Add First Task",
            onClick: () => setIsAddDialogOpen(true),
          }}
        />
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              id={task.id}
              name={task.name}
              status={task.status}
              onToggleStatus={handleToggleStatus}
              onDelete={() => confirmDelete(task.id)}
            />
          ))}
        </div>
      )}

      {/* Add Task Dialog */}
      <TaskForm
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleCreateTask}
        availableUsers={availableUsers}
        projectId={projectId}
        mode="dialog"
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setTaskToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTask}
              disabled={deleteTask.isPending}
            >
              {deleteTask.isPending ? (
                <>
                  <Trash2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
