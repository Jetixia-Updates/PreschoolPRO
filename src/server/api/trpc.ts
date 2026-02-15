import { initTRPC, TRPCError } from "@trpc/server";
import { type Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { hasPermission, type Permission } from "@/lib/permissions";
import superjson from "superjson";

interface CreateContextOptions {
  session: Session | null;
}

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const { auth } = await import("@/server/auth");
  const session = await auth();

  return {
    session,
    prisma,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
      prisma: ctx.prisma,
    },
  });
});

/**
 * Admin procedure - requires admin role
 */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (
    !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(ctx.session.user.role as string)
  ) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

/**
 * Permission-based procedure
 */
export const permissionProcedure = (permission: Permission) =>
  protectedProcedure.use(({ ctx, next }) => {
    if (!hasPermission(ctx.session.user.role, permission)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Missing permission: ${permission}`,
      });
    }
    return next({ ctx });
  });
