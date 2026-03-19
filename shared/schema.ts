import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Projects
export const projects = pgTable("projects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"), // active, on-hold, completed
  progress: integer("progress").notNull().default(0),
  color: text("color").notNull().default("#4F98A3"),
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Tasks
export const tasks = pgTable("tasks", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("todo"), // todo, in-progress, done
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  projectId: integer("project_id"),
  dueDate: text("due_date"),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// AI Agents
export const agents = pgTable("agents", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  type: text("type").notNull(), // route-planner, dispatch, monitor, marketing, custom
  status: text("status").notNull().default("idle"), // idle, running, error, paused
  description: text("description"),
  projectId: integer("project_id"),
  lastRun: text("last_run"),
  runsToday: integer("runs_today").notNull().default(0),
  successRate: integer("success_rate").notNull().default(100),
});

export const insertAgentSchema = createInsertSchema(agents).omit({ id: true });
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;
