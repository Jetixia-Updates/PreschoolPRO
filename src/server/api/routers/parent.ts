import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  permissionProcedure,
} from "../trpc";
import { ActivityType } from "@prisma/client";

export const parentRouter = createTRPCRouter({
  // Get parent's children with latest info
  getChildren: permissionProcedure("parent:view-own").query(
    async ({ ctx }) => {
      const parentProfile = await ctx.prisma.parentProfile.findUnique({
        where: { userId: ctx.session.user.id },
        include: {
          students: {
            include: {
              student: {
                include: {
                  classAssignments: {
                    where: { isActive: true },
                    include: {
                      classroom: {
                        select: {
                          id: true,
                          name: true,
                          code: true,
                          leadTeacher: {
                            select: { name: true, email: true },
                          },
                        },
                      },
                    },
                  },
                  attendance: {
                    take: 5,
                    orderBy: { date: "desc" },
                  },
                  developmentRecords: {
                    include: {
                      assessments: {
                        take: 1,
                        orderBy: { assessedAt: "desc" },
                        include: { milestone: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!parentProfile) {
        throw new Error("Parent profile not found");
      }

      return parentProfile.students.map((ps) => ({
        relationship: ps.relationship,
        isPrimary: ps.isPrimary,
        student: ps.student,
      }));
    }
  ),

  // Get daily activity log for a child
  getChildDailyReport: permissionProcedure("parent:view-own")
    .input(
      z.object({
        studentId: z.string(),
        date: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify parent has access to this student
      const parentProfile = await ctx.prisma.parentProfile.findUnique({
        where: { userId: ctx.session.user.id },
        include: {
          students: {
            where: { studentId: input.studentId },
          },
        },
      });

      if (!parentProfile || parentProfile.students.length === 0) {
        throw new Error("Access denied: Not your child");
      }

      const targetDate = input.date || new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const [activities, attendance, observations] = await Promise.all([
        ctx.prisma.activityLog.findMany({
          where: {
            studentId: input.studentId,
            timestamp: { gte: startOfDay, lte: endOfDay },
          },
          orderBy: { timestamp: "asc" },
          include: {
            logger: {
              select: { name: true },
            },
          },
        }),
        ctx.prisma.attendance.findFirst({
          where: {
            studentId: input.studentId,
            date: { gte: startOfDay, lte: endOfDay },
          },
        }),
        ctx.prisma.observation.findMany({
          where: {
            studentId: input.studentId,
            observedAt: { gte: startOfDay, lte: endOfDay },
          },
          include: {
            observer: {
              select: { name: true },
            },
          },
        }),
      ]);

      return {
        date: targetDate,
        attendance,
        activities,
        observations,
      };
    }),

  // Get development progress for a child
  getChildProgress: permissionProcedure("parent:view-own")
    .input(
      z.object({
        studentId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify parent has access to this student
      const parentProfile = await ctx.prisma.parentProfile.findUnique({
        where: { userId: ctx.session.user.id },
        include: {
          students: {
            where: { studentId: input.studentId },
          },
        },
      });

      if (!parentProfile || parentProfile.students.length === 0) {
        throw new Error("Access denied: Not your child");
      }

      const developmentRecords =
        await ctx.prisma.developmentRecord.findMany({
          where: { studentId: input.studentId },
          include: {
            assessments: {
              include: { milestone: true },
              orderBy: { assessedAt: "desc" },
            },
          },
        });

      // Summarize by domain
      const domainSummaries = developmentRecords.map((record) => {
        const totalAssessments = record.assessments.length;
        const achievedCount = record.assessments.filter(
          (a) => a.status === "ACHIEVED"
        ).length;
        const latestAssessment = record.assessments[0] || null;

        return {
          domain: record.domain,
          totalAssessments,
          achievedCount,
          progressPercent:
            totalAssessments > 0
              ? Math.round((achievedCount / totalAssessments) * 100)
              : 0,
          latestAssessment,
        };
      });

      return {
        records: developmentRecords,
        domainSummaries,
      };
    }),
});
