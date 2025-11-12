import { pgTable, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";
import { task } from "./tasks";

// Project status enum following 2025 PostgreSQL best practices
export const projectStatusEnum = pgEnum("project_status", [
  "planning",
  "in-progress",
  "completed",
  "on-hold",
]);

export const project = pgTable("project", {
  // Using identity column - NEW 2025 standard for PostgreSQL
  id: integer("id").primaryKey().generatedAlwaysAsIdentity({
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 2147483647,
  }),
  name: text("name").notNull(),
  status: projectStatusEnum("status").notNull().default("planning"),
  progress: integer("progress").notNull().default(0), // 0-100 percentage
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

  // Foreign key to user (project owner)
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// Define relations for type-safe queries
export const projectRelations = relations(project, ({ one, many }) => ({
  // Many-to-one: Project belongs to one User
  owner: one(user, {
    fields: [project.userId],
    references: [user.id],
  }),
  // One-to-many: Project has many Tasks
  tasks: many(task),
}));

// Export TypeScript type for use in tRPC and forms
export type Project = typeof project.$inferSelect;
export type NewProject = typeof project.$inferInsert;
