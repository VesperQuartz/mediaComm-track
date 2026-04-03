import { auth } from "@/lib/auth";
import { base } from "@/lib/orpc/router/base";

export const authMiddleware = base.middleware(async ({ context, next }) => {
  const sessionData = await auth.api.getSession({
    headers: context.headers, // or reqHeaders if you're using the plugin
  });

  return next({
    context: {
      session: sessionData?.session,
      user: sessionData?.user,
    },
  });
});
