import { TRPCError } from "@trpc/server";
import { eq, and, sql } from "drizzle-orm";
import {
  project,
  task,
  user,
  createProjectSchema,
  updateProjectSchema,
  deleteProjectSchema,
  getProjectByIdSchema,
  generateTasksSchema,
} from "@vznx-challenge/db";
import { protectedProcedure, router } from "../index";
import { generateArchitectureTasks } from "../lib/ai";

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

      // Get all tasks for this project with assignedTo user data
      const tasksData = await ctx.db
        .select({
          task: task,
          assignedTo: user,
        })
        .from(task)
        .leftJoin(user, eq(task.assignedToId, user.id))
        .where(eq(task.projectId, input.id))
        .orderBy(task.order, task.createdAt);

      // Transform the data to include assignedTo as a nested object
      const tasks = tasksData.map((row) => ({
        ...row.task,
        assignedTo: row.assignedTo
          ? {
              id: row.assignedTo.id,
              name: row.assignedTo.name,
              email: row.assignedTo.email,
              image: row.assignedTo.image,
            }
          : undefined,
      }));

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

  /**
   * Generate AI-powered task suggestions for a project
   * Uses OpenAI to create architecture-specific tasks based on project details
   *
   * @returns Array of generated tasks with names, order, and optional estimated durations
   * @throws TRPCError with code INTERNAL_SERVER_ERROR if AI generation fails
   * @throws TRPCError with code BAD_REQUEST if API key is missing or invalid
   */
  generateTasks: protectedProcedure
    .input(generateTasksSchema)
    .mutation(async ({ input }) => {
      try {
        // Call AI utility to generate tasks
        const generatedTasks = await generateArchitectureTasks(
          input.projectName,
          input.projectDescription,
          input.taskCount
        );

        // Transform to format expected by client (removing estimatedDuration for now)
        const tasksForClient = generatedTasks.map((task) => ({
          name: task.name,
          order: task.order,
          estimatedDuration: task.estimatedDuration,
        }));

        return tasksForClient;
      } catch (error) {
        // Handle specific AI-related errors with appropriate tRPC error codes
        if (error instanceof Error) {
          // API key missing or invalid
          if (
            error.message.includes("API key") ||
            error.message.includes("invalid_api_key")
          ) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message:
                "AI service configuration error. Please contact support.",
              cause: error,
            });
          }

          // Rate limit exceeded
          if (error.message.includes("rate_limit")) {
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS",
              message:
                "AI service is currently busy. Please try again in 30 seconds.",
              cause: error,
            });
          }

          // Quota exceeded
          if (error.message.includes("quota")) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "AI service quota exceeded. Please contact support.",
              cause: error,
            });
          }

          // Generic AI generation error
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "Failed to generate tasks. Please try again or create tasks manually.",
            cause: error,
          });
        }

        // Unknown error type
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while generating tasks.",
        });
      }
    }),
});
