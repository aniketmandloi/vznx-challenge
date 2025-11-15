/**
 * DashboardContent Component
 *
 * Main dashboard view that displays:
 * - Quick statistics (total/in-progress/completed projects, task completion rate)
 * - Search bar for filtering projects by name/description
 * - Status filter tabs (all/planning/in-progress/completed/on-hold)
 * - Sorting options (name/progress/date)
 * - Project cards grid with stagger animations
 * - Create/Edit/Delete project functionality with optimistic updates
 */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuickStats } from "@/components/QuickStats";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectForm } from "@/components/ProjectForm";
import { EmptyState } from "@/components/EmptyState";
import { ProjectCardSkeleton } from "@/components/ProjectCardSkeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, FolderKanban, Trash2, Search, X } from "lucide-react";
import type { ProjectStatus } from "@/components/StatusBadge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FilterStatus = "all" | ProjectStatus;
type SortOption = "name" | "progress" | "date";

interface DashboardContentProps {
  userName?: string;
}

export function DashboardContent({ userName }: DashboardContentProps) {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<{
    id: number;
    name: string;
    description: string | null;
    status: ProjectStatus;
  } | null>(null);

  // Fetch projects
  const { data: projects = [], isLoading } = useQuery(
    trpc.projects.getAll.queryOptions()
  );
  const queryClient = useQueryClient();

  // Mutations with optimistic updates
  const createProject = useMutation({
    ...trpc.projects.create.mutationOptions(),
    onMutate: async (newProject) => {
      const queryKey = trpc.projects.getAll.queryOptions().queryKey;
      await queryClient.cancelQueries({ queryKey });
      const previousProjects = queryClient.getQueryData(queryKey);

      // Optimistically add the new project
      queryClient.setQueryData(queryKey, (old: any = []) => [
        ...old,
        {
          id: Date.now(), // Temporary ID
          name: newProject.name,
          status: newProject.status,
          progress: 0,
          description: newProject.description || null,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: "",
          totalTasks: 0,
          completedTasks: 0,
        },
      ]);

      return { previousProjects };
    },
    onError: (_err, _newProject, context) => {
      const queryKey = trpc.projects.getAll.queryOptions().queryKey;
      queryClient.setQueryData(queryKey, context?.previousProjects);
      toast.error("Failed to create project");
    },
    onSuccess: () => {
      toast.success("Project created successfully");
    },
    onSettled: () => {
      const queryKey = trpc.projects.getAll.queryOptions().queryKey;
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateProject = useMutation({
    ...trpc.projects.update.mutationOptions(),
    onMutate: async (updatedProject) => {
      const queryKey = trpc.projects.getAll.queryOptions().queryKey;
      await queryClient.cancelQueries({ queryKey });
      const previousProjects = queryClient.getQueryData(queryKey);

      // Optimistically update the project
      queryClient.setQueryData(queryKey, (old: any = []) =>
        old.map((p: any) =>
          p.id === updatedProject.id
            ? {
                ...p,
                name: updatedProject.name,
                status: updatedProject.status,
                description: updatedProject.description || null,
                updatedAt: new Date(),
              }
            : p
        )
      );

      return { previousProjects };
    },
    onError: (_err, _updatedProject, context) => {
      const queryKey = trpc.projects.getAll.queryOptions().queryKey;
      queryClient.setQueryData(queryKey, context?.previousProjects);
      toast.error("Failed to update project");
    },
    onSuccess: () => {
      toast.success("Project updated successfully");
    },
    onSettled: () => {
      const queryKey = trpc.projects.getAll.queryOptions().queryKey;
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteProject = useMutation({
    ...trpc.projects.delete.mutationOptions(),
    onMutate: async (variables) => {
      const queryKey = trpc.projects.getAll.queryOptions().queryKey;
      await queryClient.cancelQueries({ queryKey });
      const previousProjects = queryClient.getQueryData(queryKey);

      // Optimistically remove the project
      queryClient.setQueryData(queryKey, (old: any = []) =>
        old.filter((p: any) => p.id !== variables.id)
      );

      return { previousProjects };
    },
    onError: (_err, _variables, context) => {
      const queryKey = trpc.projects.getAll.queryOptions().queryKey;
      queryClient.setQueryData(queryKey, context?.previousProjects);
      toast.error("Failed to delete project");
    },
    onSuccess: () => {
      toast.success("Project deleted successfully");
    },
    onSettled: () => {
      const queryKey = trpc.projects.getAll.queryOptions().queryKey;
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Calculate stats from projects
  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const inProgressProjects = projects.filter(
      (p) => p.status === "in-progress"
    ).length;
    const completedProjects = projects.filter(
      (p) => p.status === "completed"
    ).length;
    const totalTasks = projects.reduce(
      (sum, p) => sum + (p.totalTasks || 0),
      0
    );
    const completedTasks = projects.reduce(
      (sum, p) => sum + (p.completedTasks || 0),
      0
    );

    return {
      totalProjects,
      inProgressProjects,
      completedProjects,
      totalTasks,
      completedTasks,
    };
  }, [projects]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((p) => p.status === filterStatus);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "progress":
          return b.progress - a.progress;
        case "date":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    return sorted;
  }, [projects, searchQuery, filterStatus, sortBy]);

  // Batch task creation mutation
  const createManyTasks = useMutation({
    ...trpc.tasks.createMany.mutationOptions(),
    onSuccess: (result) => {
      toast.success(`Created ${result.count} AI-generated tasks!`);
    },
    onError: () => {
      toast.error("Failed to create tasks. You can add them manually later.");
    },
  });

  const handleCreateProject = async (
    data: {
      name: string;
      description: string;
      status: ProjectStatus;
    },
    aiTasks?: Array<{ name: string; order: number; estimatedDuration?: string }>
  ) => {
    // Create the project first
    const newProject = await createProject.mutateAsync(data);

    // If AI tasks were provided, create them in batch
    if (aiTasks && aiTasks.length > 0 && newProject?.id) {
      try {
        await createManyTasks.mutateAsync({
          projectId: newProject.id,
          tasks: aiTasks.map((task) => ({
            name: task.name,
            order: task.order,
          })),
        });
      } catch (error) {
        // Task creation failed, but project was created successfully
        console.error("Failed to create AI tasks:", error);
      }
    }
  };

  const handleUpdateProject = async (data: {
    name: string;
    description: string;
    status: ProjectStatus;
  }) => {
    if (projectToEdit) {
      await updateProject.mutateAsync({
        id: projectToEdit.id,
        name: data.name,
        description: data.description,
        status: data.status,
      });
      setIsEditDialogOpen(false);
      setProjectToEdit(null);
    }
  };

  const handleDeleteProject = async () => {
    if (projectToDelete) {
      await deleteProject.mutateAsync({ id: projectToDelete });
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const openEditDialog = (project: {
    id: number;
    name: string;
    description: string | null;
    status: ProjectStatus;
  }) => {
    setProjectToEdit(project);
    setIsEditDialogOpen(true);
  };

  const confirmDelete = (projectId: number) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          {userName && (
            <p className="text-muted-foreground mt-1">
              Welcome back, {userName}
            </p>
          )}
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          size="lg"
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-5 w-5" />
          New Project
        </Button>
      </div>

      {/* Quick Stats */}
      <QuickStats {...stats} />

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search projects by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={filterStatus}
          onValueChange={(value) => setFilterStatus(value as FilterStatus)}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-5 sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="on-hold">On Hold</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as SortOption)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date Created</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredAndSortedProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={
            filterStatus === "all"
              ? "No projects yet"
              : `No ${filterStatus.replace("-", " ")} projects`
          }
          description={
            filterStatus === "all"
              ? "Get started by creating your first project to track tasks and progress."
              : `You don't have any ${filterStatus.replace(
                  "-",
                  " "
                )} projects. Try changing the filter or create a new project.`
          }
          action={
            filterStatus === "all"
              ? {
                  label: "Create First Project",
                  onClick: () => setIsCreateDialogOpen(true),
                }
              : undefined
          }
        />
      ) : (
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {filteredAndSortedProjects.map((project) => (
            <motion.div
              key={project.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <ProjectCard
                id={project.id}
                name={project.name}
                status={project.status}
                progress={project.progress}
                taskCount={project.totalTasks || 0}
                completedTasks={project.completedTasks || 0}
                onClick={() =>
                  router.push(`/dashboard/projects/${project.id}` as any)
                }
                onEdit={() =>
                  openEditDialog({
                    id: project.id,
                    name: project.name,
                    description: project.description || null,
                    status: project.status,
                  })
                }
                onDelete={() => confirmDelete(project.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Project Dialog */}
      <ProjectForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateProject}
        mode="create"
      />

      {/* Edit Project Dialog */}
      {projectToEdit && (
        <ProjectForm
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setProjectToEdit(null);
          }}
          onSubmit={handleUpdateProject}
          initialData={{
            name: projectToEdit.name,
            description: projectToEdit.description || "",
            status: projectToEdit.status,
          }}
          mode="edit"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot
              be undone and will also delete all associated tasks.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setProjectToDelete(null);
              }}
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
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
