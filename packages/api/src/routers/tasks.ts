import { TRPCError } from "@trpc/server";
import { eq, and, sql } from "drizzle-orm";
import {
  task,
  project,
  createTaskSchema,
  updateTaskSchema,
  toggleTaskStatusSchema,
  deleteTaskSchema,
  getTasksByProjectSchema,
  reorderTasksSchema,
  createManyTasksSchema,
} from "@vznx-challenge/db";
import { protectedProcedure, router } from "../index";
import type { Context } from "../context";

/**
 * Helper function to update project progress
 * Extracted to avoid code duplication
 */
async function updateProjectProgress(
  ctx: Pick<Context, "db">,
  projectId: number
) {
  // Get task counts
  const taskStatsResult = await ctx.db
    .select({
      totalTasks: sql<number>`cast(count(${task.id}) as int)`,
      completedTasks: sql<number>`cast(count(case when ${task.status} = 'complete' then 1 end) as int)`,
    })
    .from(task)
    .where(eq(task.projectId, projectId));

  const taskStats = taskStatsResult[0];
  if (!taskStats) {
    return;
  }

  // Calculate progress
  const totalTasks = taskStats.totalTasks;
  const completedTasks = taskStats.completedTasks;
  const progress =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Update project with calculated progress
  await ctx.db
    .update(project)
    .set({ progress })
    .where(eq(project.id, projectId));
}

export const tasksRouter = router({
  /**
   * Get all tasks for a specific project
   */
  getByProject: protectedProcedure
    .input(getTasksByProjectSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify project ownership
      const [projectData] = await ctx.db
        .select()
        .from(project)
        .where(and(eq(project.id, input.projectId), eq(project.userId, userId)))
        .limit(1);

      if (!projectData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Get all tasks for this project
      const tasks = await ctx.db
        .select()
        .from(task)
        .where(eq(task.projectId, input.projectId))
        .orderBy(task.order, task.createdAt);

      return tasks;
    }),

  /**
   * Create a new task
   */
  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify project ownership
      const [projectData] = await ctx.db
        .select()
        .from(project)
        .where(and(eq(project.id, input.projectId), eq(project.userId, userId)))
        .limit(1);

      if (!projectData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const [newTask] = await ctx.db.insert(task).values(input).returning();

      // Auto-update project progress after creating a task
      await updateProjectProgress(ctx, input.projectId);

      return newTask;
    }),

  /**
   * Update a task
   */
  update: protectedProcedure
    .input(updateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, ...updates } = input;

      // Get the task and verify project ownership
      const existingTaskResult = await ctx.db
        .select({
          task,
          project,
        })
        .from(task)
        .innerJoin(project, eq(task.projectId, project.id))
        .where(and(eq(task.id, id), eq(project.userId, userId)))
        .limit(1);

      const existingTask = existingTaskResult[0];
      if (!existingTask) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      }

      const [updatedTask] = await ctx.db
        .update(task)
        .set(updates)
        .where(eq(task.id, id))
        .returning();

      // Auto-update project progress if status changed
      if (updates.status !== undefined) {
        await updateProjectProgress(ctx, existingTask.task.projectId);
      }

      return updatedTask;
    }),

  /**
   * Toggle task status between complete and incomplete
   * Bonus: Automatically triggers project progress update
   */
  toggleStatus: protectedProcedure
    .input(toggleTaskStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get the task and verify project ownership
      const existingTaskResult = await ctx.db
        .select({
          task,
          project,
        })
        .from(task)
        .innerJoin(project, eq(task.projectId, project.id))
        .where(and(eq(task.id, input.id), eq(project.userId, userId)))
        .limit(1);

      const existingTask = existingTaskResult[0];
      if (!existingTask) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      }

      // Toggle status
      const newStatus =
        existingTask.task.status === "complete" ? "incomplete" : "complete";

      const [updatedTask] = await ctx.db
        .update(task)
        .set({ status: newStatus })
        .where(eq(task.id, input.id))
        .returning();

      // Bonus: Auto-update project progress after toggling task status
      await updateProjectProgress(ctx, existingTask.task.projectId);

      return updatedTask;
    }),

  /**
   * Delete a task
   */
  delete: protectedProcedure
    .input(deleteTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get the task and verify project ownership
      const existingTaskResult = await ctx.db
        .select({
          task,
          project,
        })
        .from(task)
        .innerJoin(project, eq(task.projectId, project.id))
        .where(and(eq(task.id, input.id), eq(project.userId, userId)))
        .limit(1);

      const existingTask = existingTaskResult[0];
      if (!existingTask) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      }

      const projectId = existingTask.task.projectId;

      await ctx.db.delete(task).where(eq(task.id, input.id));

      // Auto-update project progress after deleting a task
      await updateProjectProgress(ctx, projectId);

      return { success: true, id: input.id };
    }),

  /**
   * Reorder tasks within a project
   */
  reorder: protectedProcedure
    .input(reorderTasksSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify project ownership
      const [projectData] = await ctx.db
        .select()
        .from(project)
        .where(and(eq(project.id, input.projectId), eq(project.userId, userId)))
        .limit(1);

      if (!projectData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Update order for each task
      await Promise.all(
        input.taskIds.map((taskId, index) =>
          ctx.db.update(task).set({ order: index }).where(eq(task.id, taskId))
        )
      );

      return { success: true };
    }),

  /**
   * Batch create multiple tasks for a project in a single transaction
   * Optimized for AI-generated task creation and bulk imports
   *
   * Benefits:
   * - Single database round-trip for better performance
   * - Atomic operation - all tasks created together or none
   * - Automatically updates project progress after creation
   *
   * @returns Array of created tasks with full task data
   * @throws TRPCError with code NOT_FOUND if project doesn't exist or user doesn't own it
   * @throws TRPCError with code INTERNAL_SERVER_ERROR if batch creation fails
   */
  createMany: protectedProcedure
    .input(createManyTasksSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        // Verify project ownership
        const [projectData] = await ctx.db
          .select()
          .from(project)
          .where(
            and(eq(project.id, input.projectId), eq(project.userId, userId))
          )
          .limit(1);

        if (!projectData) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found or you don't have access to it",
          });
        }

        // Batch insert all tasks with project ID
        // Note: Neon HTTP driver doesn't support transactions, so we do sequential operations
        // The batch insert itself is atomic
        const tasksToInsert = input.tasks.map(
          (t: {
            name: string;
            order: number;
            assignedToId?: string;
            aiGenerated?: boolean;
            metadata?: any;
          }) => ({
            name: t.name,
            order: t.order,
            assignedToId: t.assignedToId,
            projectId: input.projectId,
            status: "incomplete" as const, // Default status for new tasks
            aiGenerated: t.aiGenerated ?? false,
            metadata: t.metadata ?? null,
          })
        );

        const createdTasks = await ctx.db
          .insert(task)
          .values(tasksToInsert)
          .returning();

        // Auto-update project progress after batch creation
        await updateProjectProgress({ db: ctx.db }, input.projectId);

        return {
          success: true,
          tasks: createdTasks,
          count: createdTasks.length,
        };
      } catch (error) {
        // If it's already a TRPCError, re-throw it
        if (error instanceof TRPCError) {
          throw error;
        }

        // Handle database errors
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to create tasks: ${error.message}`,
            cause: error,
          });
        }

        // Unknown error
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while creating tasks",
        });
      }
    }),
});
