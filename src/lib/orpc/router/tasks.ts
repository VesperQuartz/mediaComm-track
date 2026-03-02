import { os } from "@orpc/server";
import { taskSchema } from "../schema";
import { db } from "@/lib/database";
import { tasks } from "@/repo/schema/schema";
import { eq, desc } from "drizzle-orm";
import z from "zod";

export const listTasks = os
  .route({
    method: "GET",
    path: "/tasks",
  })
  .handler(async () => {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  });

export const upsertTask = os
  .input(taskSchema)
  .handler(async ({ input }) => {
    const id = input.id || `t${Date.now()}`;
    await db.insert(tasks).values({
      id,
      name: input.name,
      memberId: input.memberId,
      priority: input.priority,
      start: input.start || null,
      deadline: input.deadline,
      pct: input.pct,
      status: input.status,
      desc: input.desc || null,
      actual: input.actual || null,
      lateReason: input.lateReason || null,
      feedback: input.feedback || null,
      quality: input.quality || null,
    }).onConflictDoUpdate({
      target: tasks.id,
      set: {
        name: input.name,
        memberId: input.memberId,
        priority: input.priority,
        start: input.start || null,
        deadline: input.deadline,
        pct: input.pct,
        status: input.status,
        desc: input.desc || null,
        actual: input.actual || null,
        lateReason: input.lateReason || null,
        feedback: input.feedback || null,
        quality: input.quality || null,
      },
    });
    return { id };
  });

export const deleteTask = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    await db.delete(tasks).where(eq(tasks.id, input.id));
    return { success: true };
  });
