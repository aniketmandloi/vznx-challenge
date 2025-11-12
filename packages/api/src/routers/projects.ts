import { TRPCError } from "@trpc/server";
import { eq, and, sql } from "drizzle-orm";
import {
  project,
  task,
  createProjectSchema,
  updateProjectSchema,
  deleteProjectSchema,
  getProjectByIdSchema,
} from "@vznx-challenge/db";
import { protectedProcedure, router } from "../index";

export const projectsRouter = router({
  /**
   * Get all projects for the authenticated user with task count and progress
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get all projects with task counts and completion stats
    const projects = await ctx.db
      .select({
        id: project.id,
        name: project.name,
        status: project.status,
        progress: project.progress,
        description: project.description,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        userId: project.userId,
        // Aggregate task data
        totalTasks: sql<number>`cast(count(${task.id}) as int)`,
        completedTasks: sql<number>`cast(count(case when ${task.status} = 'complete' then 1 end) as int)`,
      })
      .from(project)
      .leftJoin(task, eq(project.id, task.projectId))
      .where(eq(project.userId, userId))
      .groupBy(project.id)
      .orderBy(project.createdAt);

    return projects;
  }),

  /**
   * Get a single project by ID with all its tasks
   */
  getById: protectedProcedure
    .input(getProjectByIdSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get the project
      const [projectData] = await ctx.db
        .select()
        .from(project)
        .where(and(eq(project.id, input.id), eq(project.userId, userId)))
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
        .where(eq(task.projectId, input.id))
        .orderBy(task.order, task.createdAt);

      return {
        ...projectData,
        tasks,
      };
    }),

  /**
   * Create a new project
   */
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const [newProject] = await ctx.db
        .insert(project)
        .values({
          ...input,
          userId,
        })
        .returning();

      return newProject;
    }),

  /**
   * Update an existing project
   */
  update: protectedProcedure
    .input(updateProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, ...updates } = input;

      // Verify ownership
      const [existingProject] = await ctx.db
        .select()
        .from(project)
        .where(and(eq(project.id, id), eq(project.userId, userId)))
        .limit(1);

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const [updatedProject] = await ctx.db
        .update(project)
        .set(updates)
        .where(eq(project.id, id))
        .returning();

      return updatedProject;
    }),

  /**
   * Delete a project (tasks will be cascade deleted)
   */
  delete: protectedProcedure
    .input(deleteProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify ownership
      const [existingProject] = await ctx.db
        .select()
        .from(project)
        .where(and(eq(project.id, input.id), eq(project.userId, userId)))
        .limit(1);

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      await ctx.db.delete(project).where(eq(project.id, input.id));

      return { success: true, id: input.id };
    }),

  /**
   * Auto-calculate and update project progress based on task completion
   * Progress = (completedTasks / totalTasks) * 100, rounded to nearest integer
   * If 0 tasks, progress = 0
   */
  updateProgress: protectedProcedure
    .input(getProjectByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify ownership
      const [existingProject] = await ctx.db
        .select()
        .from(project)
        .where(and(eq(project.id, input.id), eq(project.userId, userId)))
        .limit(1);

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Get task counts
      const taskStatsResult = await ctx.db
        .select({
          totalTasks: sql<number>`cast(count(${task.id}) as int)`,
          completedTasks: sql<number>`cast(count(case when ${task.status} = 'complete' then 1 end) as int)`,
        })
        .from(task)
        .where(eq(task.projectId, input.id));

      const taskStats = taskStatsResult[0];
      if (!taskStats) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get task stats",
        });
      }

      // Calculate progress
      const totalTasks = taskStats.totalTasks;
      const completedTasks = taskStats.completedTasks;
      const progress =
        totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

      // Update project with calculated progress
      const [updatedProject] = await ctx.db
        .update(project)
        .set({ progress })
        .where(eq(project.id, input.id))
        .returning();

      return {
        ...updatedProject,
        totalTasks,
        completedTasks,
      };
    }),
});
