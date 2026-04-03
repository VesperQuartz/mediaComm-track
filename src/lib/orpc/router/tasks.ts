import { os } from "@orpc/server";
import { desc, eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/lib/database";
import { base } from "@/lib/orpc/router/base";
import { authMiddleware } from "@/lib/orpc/router/middleware/auth";
import { tasks } from "@/repo/schema/schema";
import { taskSchema } from "../schema";

export const listTasks = os
  .route({
    method: "GET",
    path: "/tasks",
  })
  .handler(async () => {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  });

export const upsertTask = base
  .use(authMiddleware)
  .input(taskSchema)
  .handler(async ({ input, context }) => {
    if (!context.session) {
      if (!input.id) {
        throw new Error("unauthorized to perform this action");
      }
      const existing = await db
        .select({ id: tasks.id })
        .from(tasks)
        .where(eq(tasks.id, input.id))
        .limit(1);
      if (existing.length === 0) {
        throw new Error("unauthorized to perform this action");
      }
    }
    const id = input.id || `t${Date.now()}`;
    try {
      console.log("context", context);
      await db
        .insert(tasks)
        .values({
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
        })
        .onConflictDoUpdate({
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
    } catch (error) {
      console.log("Error", error);
    }
  });

export const deleteTask = base
  .use(authMiddleware)
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    if (!context.session) {
      throw new Error("unauthorized to perform this action");
    }
    await db.delete(tasks).where(eq(tasks.id, input.id));
    return { success: true };
  });
