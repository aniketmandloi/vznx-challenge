import { z } from "zod";

// Project status enum values
export const projectStatuses = [
  "planning",
  "in-progress",
  "completed",
  "on-hold",
] as const;

// Zod schema for creating a new project (client input - userId added server-side)
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(255, "Project name must be less than 255 characters"),
  description: z.string().optional(),
  status: z.enum(projectStatuses).default("planning"),
});

// Zod schema for updating a project
export const updateProjectSchema = z.object({
  id: z.number().int().positive(),
  name: z
    .string()
    .min(1, "Project name is required")
    .max(255, "Project name must be less than 255 characters")
    .optional(),
  description: z.string().optional(),
  status: z.enum(projectStatuses).optional(),
  progress: z
    .number()
    .int()
    .min(0, "Progress must be at least 0")
    .max(100, "Progress must be at most 100")
    .optional(),
});

// Zod schema for deleting a project
export const deleteProjectSchema = z.object({
  id: z.number().int().positive(),
});

// Zod schema for getting a project by ID
export const getProjectByIdSchema = z.object({
  id: z.number().int().positive(),
});

// Type exports for use in tRPC
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;
export type GetProjectByIdInput = z.infer<typeof getProjectByIdSchema>;
