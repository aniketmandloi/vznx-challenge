import {
  pgTable,
  text,
  integer,
  timestamp,
  pgEnum,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";
import { project } from "./projects";

// Task status enum - simple binary status
export const taskStatusEnum = pgEnum("task_status", ["incomplete", "complete"]);

export const task = pgTable("task", {
  // Using identity column - NEW 2025 standard for PostgreSQL
  id: integer("id").primaryKey().generatedAlwaysAsIdentity({
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 2147483647,
  }),
  name: text("name").notNull(),
  status: taskStatusEnum("status").notNull().default("incomplete"),
  order: integer("order").notNull().default(0), // For manual ordering/sorting
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

  // Foreign key to project (required)
  projectId: integer("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),

  // Foreign key to user (assignee - optional/nullable)
  assignedToId: text("assigned_to_id").references(() => user.id, {
    onDelete: "set null",
  }),

  // AI-related fields
  aiGenerated: boolean("ai_generated").default(false),
  metadata: jsonb("metadata").$type<{
    estimatedDuration?: string;
    generatedAt?: string;
    aiModel?: string;
  }>(),
});

// Define relations for type-safe queries
export const taskRelations = relations(task, ({ one }) => ({
  // Many-to-one: Task belongs to one Project
  project: one(project, {
    fields: [task.projectId],
    references: [project.id],
  }),
  // Many-to-one: Task can be assigned to one User (optional)
  assignedTo: one(user, {
    fields: [task.assignedToId],
    references: [user.id],
  }),
}));

// Export TypeScript types for use in tRPC and forms
export type Task = typeof task.$inferSelect;
export type NewTask = typeof task.$inferInsert;
