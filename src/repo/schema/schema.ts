import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const members = sqliteTable("members", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  dept: text("dept"),
  contact: text("contact"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(new Date())
    .notNull(),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  memberId: text("member_id")
    .notNull()
    .references(() => members.id),
  priority: text("priority").notNull(), // High, Medium, Low
  start: text("start"),
  deadline: text("deadline"),
  tat: integer("tat"),
  pct: integer("pct").default(0).notNull(),
  status: text("status").notNull(), // Not Started, In Progress, Completed
  desc: text("desc"),
  actual: text("actual"),
  lateReason: text("late_reason"),
  feedback: text("feedback"),
  quality: text("quality"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(new Date())
    .notNull(),
});

export const dailyLogs = sqliteTable("daily_logs", {
  id: text("id").primaryKey(),
  memberId: text("member_id")
    .notNull()
    .references(() => members.id),
  date: text("date").notNull(),
  completed: text("completed"),
  progress: text("progress"),
  blockers: text("blockers"),
  hours: text("hours"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(new Date())
    .notNull(),
});

// Relations
export const membersRelations = relations(members, ({ many }) => ({
  tasks: many(tasks),
  logs: many(dailyLogs),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  member: one(members, {
    fields: [tasks.memberId],
    references: [members.id],
  }),
}));

export const dailyLogsRelations = relations(dailyLogs, ({ one }) => ({
  member: one(members, {
    fields: [dailyLogs.memberId],
    references: [members.id],
  }),
}));
