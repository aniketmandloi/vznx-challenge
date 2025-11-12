import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { task, user } from "@vznx-challenge/db";
import { protectedProcedure, router } from "../index";

// Capacity configuration: 5 tasks = 100% capacity
const MAX_CAPACITY = 5;

/**
 * Calculate workload percentage and color based on task count
 */
function calculateWorkload(taskCount: number) {
  const percentage = Math.round((taskCount / MAX_CAPACITY) * 100);

  let color: "green" | "orange" | "red";
  let level: "healthy" | "busy" | "overloaded";

  if (percentage <= 70) {
    color = "green";
    level = "healthy";
  } else if (percentage <= 90) {
    color = "orange";
    level = "busy";
  } else {
    color = "red";
    level = "overloaded";
  }

  return {
    taskCount,
    percentage,
    color,
    level,
    maxCapacity: MAX_CAPACITY,
  };
}

export const teamRouter = router({
  /**
   * Get all team members (users) with their task counts and workload
   */
  getMembers: protectedProcedure.query(async ({ ctx }) => {
    // Get all users with their assigned task counts
    const members = await ctx.db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        totalTasks: sql<number>`cast(count(${task.id}) as int)`,
        completedTasks: sql<number>`cast(count(case when ${task.status} = 'complete' then 1 end) as int)`,
        incompleteTasks: sql<number>`cast(count(case when ${task.status} = 'incomplete' then 1 end) as int)`,
      })
      .from(user)
      .leftJoin(task, eq(user.id, task.assignedToId))
      .groupBy(user.id)
      .orderBy(user.name);

    // Calculate workload for each member
    return members.map((member) => ({
      ...member,
      workload: calculateWorkload(member.totalTasks),
    }));
  }),

  /**
   * Get workload details for a specific team member
   */
  getMemberWorkload: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get user info
      const [userData] = await ctx.db
        .select()
        .from(user)
        .where(eq(user.id, input.userId))
        .limit(1);

      if (!userData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Get all tasks assigned to this user
      const tasks = await ctx.db
        .select()
        .from(task)
        .where(eq(task.assignedToId, input.userId))
        .orderBy(task.createdAt);

      const completedTasks = tasks.filter(
        (t) => t.status === "complete"
      ).length;
      const incompleteTasks = tasks.filter(
        (t) => t.status === "incomplete"
      ).length;

      return {
        user: userData,
        tasks,
        totalTasks: tasks.length,
        completedTasks,
        incompleteTasks,
        workload: calculateWorkload(tasks.length),
      };
    }),

  /**
   * Get overall team workload statistics
   */
  getWorkloadStats: protectedProcedure.query(async ({ ctx }) => {
    // Get task counts per user
    const members = await ctx.db
      .select({
        userId: user.id,
        userName: user.name,
        totalTasks: sql<number>`cast(count(${task.id}) as int)`,
      })
      .from(user)
      .leftJoin(task, eq(user.id, task.assignedToId))
      .groupBy(user.id, user.name);

    // Calculate workload levels
    const workloadLevels = members.map((member) => ({
      userId: member.userId,
      userName: member.userName,
      ...calculateWorkload(member.totalTasks),
    }));

    // Count members by workload level
    const healthyCount = workloadLevels.filter(
      (w) => w.level === "healthy"
    ).length;
    const busyCount = workloadLevels.filter((w) => w.level === "busy").length;
    const overloadedCount = workloadLevels.filter(
      (w) => w.level === "overloaded"
    ).length;

    // Calculate average workload
    const totalTaskCount = workloadLevels.reduce(
      (sum, w) => sum + w.taskCount,
      0
    );
    const averageWorkload =
      members.length > 0 ? totalTaskCount / members.length : 0;
    const averageWorkloadPercentage = Math.round(
      (averageWorkload / MAX_CAPACITY) * 100
    );

    return {
      totalMembers: members.length,
      healthyCount,
      busyCount,
      overloadedCount,
      averageWorkload,
      averageWorkloadPercentage,
      maxCapacity: MAX_CAPACITY,
      workloadLevels,
    };
  }),
});
