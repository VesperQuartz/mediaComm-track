import { os } from "@orpc/server";
import { dailyLogSchema } from "../schema";
import { db } from "@/lib/database";
import { dailyLogs } from "@/repo/schema/schema";
import { eq, desc } from "drizzle-orm";

export const listLogs = os
  .route({
    method: "GET",
    path: "/logs",
  })
  .handler(async () => {
    return await db.select().from(dailyLogs).orderBy(desc(dailyLogs.createdAt));
  });

export const upsertLog = os
  .input(dailyLogSchema)
  .handler(async ({ input }) => {
    const id = input.id || `l${Date.now()}`;
    await db.insert(dailyLogs).values({
      id,
      memberId: input.memberId,
      date: input.date,
      completed: input.completed || null,
      progress: input.progress || null,
      blockers: input.blockers || null,
      hours: input.hours || null,
    }).onConflictDoUpdate({
      target: dailyLogs.id,
      set: {
        memberId: input.memberId,
        date: input.date,
        completed: input.completed || null,
        progress: input.progress || null,
        blockers: input.blockers || null,
        hours: input.hours || null,
      },
    });
    return { id };
  });
