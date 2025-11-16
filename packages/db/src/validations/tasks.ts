import { z } from "zod";

// Task status enum values
export const taskStatuses = ["incomplete", "complete"] as const;

// Zod schema for creating a new task
export const createTaskSchema = z.object({
  name: z
    .string()
    .min(1, "Task name is required")
    .max(255, "Task name must be less than 255 characters"),
  projectId: z.number().int().positive("Project ID is required"),
  assignedToId: z.string().optional(),
  order: z.number().int().default(0),
});

// Zod schema for updating a task
export const updateTaskSchema = z.object({
  id: z.number().int().positive(),
  name: z
    .string()
    .min(1, "Task name is required")
    .max(255, "Task name must be less than 255 characters")
    .optional(),
  status: z.enum(taskStatuses).optional(),
  assignedToId: z.string().nullable().optional(),
  order: z.number().int().optional(),
});

// Zod schema for toggling task status
export const toggleTaskStatusSchema = z.object({
  id: z.number().int().positive(),
});

// Zod schema for deleting a task
export const deleteTaskSchema = z.object({
  id: z.number().int().positive(),
});

// Zod schema for getting tasks by project
export const getTasksByProjectSchema = z.object({
  projectId: z.number().int().positive(),
});

// Zod schema for reordering tasks
export const reorderTasksSchema = z.object({
  projectId: z.number().int().positive(),
  taskIds: z.array(z.number().int().positive()),
});

// Zod schema for batch creating multiple tasks
export const createManyTasksSchema = z.object({
  projectId: z.number().int().positive("Project ID is required"),
  tasks: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, "Task name is required")
          .max(255, "Task name must be less than 255 characters"),
        order: z.number().int().default(0),
        assignedToId: z.string().optional(),
        aiGenerated: z.boolean().optional().default(false),
        metadata: z
          .object({
            estimatedDuration: z.string().optional(),
            generatedAt: z.string().optional(),
            aiModel: z.string().optional(),
          })
          .optional(),
      })
    )
    .min(1, "At least one task is required")
    .max(50, "Maximum 50 tasks can be created at once"),
});

// Type exports for use in tRPC
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ToggleTaskStatusInput = z.infer<typeof toggleTaskStatusSchema>;
export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;
export type GetTasksByProjectInput = z.infer<typeof getTasksByProjectSchema>;
export type ReorderTasksInput = z.infer<typeof reorderTasksSchema>;
export type CreateManyTasksInput = z.infer<typeof createManyTasksSchema>;
