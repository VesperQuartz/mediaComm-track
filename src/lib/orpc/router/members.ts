import { os } from "@orpc/server";
import { memberSchema } from "../schema";
import { db } from "@/lib/database";
import { members } from "@/repo/schema/schema";
import { eq } from "drizzle-orm";
import z from "zod";

export const listMembers = os
  .route({
    method: "GET",
    path: "/members",
  })
  .handler(async () => {
    return await db.select().from(members);
  });

export const upsertMember = os
  .input(memberSchema)
  .handler(async ({ input }) => {
    const id = input.id || `m${Date.now()}`;
    await db.insert(members).values({
      id,
      name: input.name,
      role: input.role,
      dept: input.dept || "",
      contact: input.contact || "",
    }).onConflictDoUpdate({
      target: members.id,
      set: {
        name: input.name,
        role: input.role,
        dept: input.dept || "",
        contact: input.contact || "",
      },
    });
    return { id };
  });

export const deleteMember = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    await db.delete(members).where(eq(members.id, input.id));
    return { success: true };
  });
