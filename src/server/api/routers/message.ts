import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  permissionProcedure,
} from "../trpc";
import { MessageStatus, UserRole } from "@prisma/client";

export const messageRouter = createTRPCRouter({
  // Get inbox messages for the current user
  getInbox: protectedProcedure
    .input(
      z.object({
        status: z.nativeEnum(MessageStatus).optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { status, limit, cursor } = input;

      const where: any = {
        receiverId: ctx.session.user.id,
      };
      if (status) where.status = status;

      const messages = await ctx.prisma.message.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { sentAt: "desc" },
        include: {
          sender: {
            select: { id: true, name: true, avatar: true, role: true },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem!.id;
      }

      // Count unread
      const unreadCount = await ctx.prisma.message.count({
        where: {
          receiverId: ctx.session.user.id,
          status: { not: "READ" },
        },
      });

      return { messages, nextCursor, unreadCount };
    }),

  // Send a message to another user
  sendMessage: permissionProcedure("message:send")
    .input(
      z.object({
        receiverId: z.string(),
        subject: z.string().optional(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.prisma.message.create({
        data: {
          senderId: ctx.session.user.id,
          receiverId: input.receiverId,
          subject: input.subject,
          content: input.content,
          status: "SENT",
        },
        include: {
          receiver: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Also create a notification for the receiver
      await ctx.prisma.notification.create({
        data: {
          userId: input.receiverId,
          type: "MESSAGE",
          title: input.subject || "New Message",
          message: `New message from ${ctx.session.user.name}`,
          data: { messageId: message.id },
        },
      });

      return message;
    }),

  // Mark a message as read
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.prisma.message.update({
        where: {
          id: input.id,
          receiverId: ctx.session.user.id,
        },
        data: {
          status: "READ",
          readAt: new Date(),
        },
      });

      return message;
    }),

  // Get school announcements
  getAnnouncements: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const userRole = ctx.session.user.role as UserRole;

      const announcements = await ctx.prisma.announcement.findMany({
        where: {
          isActive: true,
          AND: [
            {
              OR: [
                { targetRoles: { has: userRole } },
                { targetRoles: { isEmpty: true } },
              ],
            },
            {
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } },
              ],
            },
          ],
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { publishedAt: "desc" },
      });

      let nextCursor: string | undefined = undefined;
      if (announcements.length > limit) {
        const nextItem = announcements.pop();
        nextCursor = nextItem!.id;
      }

      return { announcements, nextCursor };
    }),

  // Create an announcement (admin only)
  createAnnouncement: permissionProcedure("announcement:create")
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        priority: z.enum(["low", "normal", "high"]).default("normal"),
        targetRoles: z.array(z.nativeEnum(UserRole)).optional(),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const announcement = await ctx.prisma.announcement.create({
        data: {
          title: input.title,
          content: input.content,
          priority: input.priority,
          targetRoles: input.targetRoles || [],
          expiresAt: input.expiresAt,
        },
      });

      return announcement;
    }),
});
