import z from "zod";

export const todoSchema = z.object({
  name: z.string(),
});

export const memberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  dept: z.string().optional(),
  contact: z.string().optional(),
});

export const taskSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Task name is required"),
  memberId: z.string().min(1, "Member is required"),
  priority: z.enum(["High", "Medium", "Low"]),
  start: z.string().optional(),
  deadline: z.string().min(1, "Deadline is required"),
  pct: z.number().min(0).max(100).default(0),
  status: z.enum(["Not Started", "In Progress", "Completed"]).default("Not Started"),
  desc: z.string().optional(),
  actual: z.string().optional(),
  lateReason: z.string().optional(),
  feedback: z.string().optional(),
  quality: z.string().optional(),
});

export const dailyLogSchema = z.object({
  id: z.string().optional(),
  memberId: z.string().min(1, "Member is required"),
  date: z.string().min(1, "Date is required"),
  completed: z.string().optional(),
  progress: z.string().optional(),
  blockers: z.string().optional(),
  hours: z.string().optional(),
});
