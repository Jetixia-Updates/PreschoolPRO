import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  permissionProcedure,
} from "../trpc";
import { ISCEDLevel, DevelopmentDomain, AttendanceStatus } from "@prisma/client";

export const analyticsRouter = createTRPCRouter({
  // Enrollment statistics
  getEnrollmentStats: permissionProcedure("report:view")
    .input(
      z.object({
        schoolId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const schoolId = input.schoolId || ctx.session.user.schoolId;

      const [total, byISCED, byGender, newThisMonth, byMonth] =
        await Promise.all([
          ctx.prisma.student.count({
            where: { schoolId, isActive: true },
          }),
          ctx.prisma.student.groupBy({
            by: ["iscedLevel"],
            where: { schoolId, isActive: true },
            _count: true,
          }),
          ctx.prisma.student.groupBy({
            by: ["gender"],
            where: { schoolId, isActive: true },
            _count: true,
          }),
          ctx.prisma.student.count({
            where: {
              schoolId,
              isActive: true,
              enrollmentDate: {
                gte: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth(),
                  1
                ),
              },
            },
          }),
          // Enrollment trend by month (last 12 months)
          ctx.prisma.$queryRaw`
            SELECT 
              DATE_TRUNC('month', "enrollmentDate") as month,
              COUNT(*)::int as count
            FROM "Student"
            WHERE "schoolId" = ${schoolId} AND "isActive" = true
              AND "enrollmentDate" >= NOW() - INTERVAL '12 months'
            GROUP BY DATE_TRUNC('month', "enrollmentDate")
            ORDER BY month ASC
          ` as Promise<Array<{ month: Date; count: number }>>,
        ]);

      return {
        total,
        byISCED,
        byGender,
        newThisMonth,
        enrollmentTrend: byMonth,
      };
    }),

  // Attendance statistics
  getAttendanceStats: permissionProcedure("report:view")
    .input(
      z.object({
        schoolId: z.string().optional(),
        classroomId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.classroomId) {
        where.classroomId = input.classroomId;
      } else {
        // Filter by school through classroom
        where.classroom = {
          schoolId: input.schoolId || ctx.session.user.schoolId,
        };
      }

      if (input.startDate || input.endDate) {
        where.date = {};
        if (input.startDate) where.date.gte = input.startDate;
        if (input.endDate) where.date.lte = input.endDate;
      }

      const [byStatus, total] = await Promise.all([
        ctx.prisma.attendance.groupBy({
          by: ["status"],
          where,
          _count: true,
        }),
        ctx.prisma.attendance.count({ where }),
      ]);

      // Calculate attendance rate
      const presentCount =
        byStatus.find((s) => s.status === "PRESENT")?._count || 0;
      const lateCount =
        byStatus.find((s) => s.status === "LATE")?._count || 0;
      const attendanceRate =
        total > 0
          ? Math.round(((presentCount + lateCount) / total) * 100)
          : 0;

      return {
        total,
        byStatus,
        attendanceRate,
      };
    }),

  // Development statistics
  getDevelopmentStats: permissionProcedure("report:view")
    .input(
      z.object({
        schoolId: z.string().optional(),
        domain: z.nativeEnum(DevelopmentDomain).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const schoolId = input.schoolId || ctx.session.user.schoolId;

      const domainFilter = input.domain ? { domain: input.domain } : {};

      const [assessmentsByStatus, assessmentsByDomain, totalAssessments] =
        await Promise.all([
          ctx.prisma.assessment.groupBy({
            by: ["status"],
            where: {
              developmentRecord: {
                student: { schoolId },
                ...domainFilter,
              },
            },
            _count: true,
          }),
          ctx.prisma.developmentRecord.groupBy({
            by: ["domain"],
            where: {
              student: { schoolId },
            },
            _count: true,
          }),
          ctx.prisma.assessment.count({
            where: {
              developmentRecord: {
                student: { schoolId },
                ...domainFilter,
              },
            },
          }),
        ]);

      // Calculate achievement rate
      const achievedCount =
        assessmentsByStatus.find((s) => s.status === "ACHIEVED")?._count || 0;
      const achievementRate =
        totalAssessments > 0
          ? Math.round((achievedCount / totalAssessments) * 100)
          : 0;

      return {
        totalAssessments,
        assessmentsByStatus,
        assessmentsByDomain,
        achievementRate,
      };
    }),

  // Revenue statistics
  getRevenueStats: permissionProcedure("report:view")
    .input(
      z.object({
        schoolId: z.string().optional(),
        year: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const schoolId = input.schoolId || ctx.session.user.schoolId;
      const year = input.year || new Date().getFullYear();

      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);

      const [totalRevenue, paymentsByStatus, monthlyRevenue] =
        await Promise.all([
          ctx.prisma.payment.aggregate({
            where: {
              schoolId,
              status: "PAID",
              paidAt: { gte: startOfYear, lte: endOfYear },
            },
            _sum: { amount: true },
            _count: true,
          }),
          ctx.prisma.payment.groupBy({
            by: ["status"],
            where: {
              schoolId,
              paidAt: { gte: startOfYear, lte: endOfYear },
            },
            _sum: { amount: true },
            _count: true,
          }),
          ctx.prisma.$queryRaw`
            SELECT 
              DATE_TRUNC('month', "paidAt") as month,
              SUM("amount")::float as total,
              COUNT(*)::int as count
            FROM "Payment"
            WHERE "schoolId" = ${schoolId} 
              AND "status" = 'PAID'
              AND "paidAt" >= ${startOfYear}
              AND "paidAt" <= ${endOfYear}
            GROUP BY DATE_TRUNC('month', "paidAt")
            ORDER BY month ASC
          ` as Promise<
            Array<{ month: Date; total: number; count: number }>
          >,
        ]);

      return {
        totalRevenue: totalRevenue._sum.amount || 0,
        totalPayments: totalRevenue._count,
        paymentsByStatus,
        monthlyRevenue,
      };
    }),

  // Overview dashboard (combined stats)
  getOverviewDashboard: permissionProcedure("report:view")
    .input(
      z.object({
        schoolId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const schoolId = input.schoolId || ctx.session.user.schoolId;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const [
        totalStudents,
        totalTeachers,
        totalClassrooms,
        todayAttendance,
        recentIncidents,
        pendingPayments,
      ] = await Promise.all([
        ctx.prisma.student.count({
          where: { schoolId, isActive: true },
        }),
        ctx.prisma.user.count({
          where: {
            schoolId,
            role: { in: ["TEACHER", "ASSISTANT_TEACHER"] },
            isActive: true,
          },
        }),
        ctx.prisma.classroom.count({
          where: { schoolId, isActive: true },
        }),
        ctx.prisma.attendance.groupBy({
          by: ["status"],
          where: {
            classroom: { schoolId },
            date: { gte: today, lte: endOfToday },
          },
          _count: true,
        }),
        ctx.prisma.incidentReport.count({
          where: {
            student: { schoolId },
            reportedAt: { gte: today, lte: endOfToday },
          },
        }),
        ctx.prisma.payment.count({
          where: {
            schoolId,
            status: "PENDING",
          },
        }),
      ]);

      // Calculate today's attendance rate
      const totalToday = todayAttendance.reduce(
        (sum, s) => sum + s._count,
        0
      );
      const presentToday =
        (todayAttendance.find((s) => s.status === "PRESENT")?._count || 0) +
        (todayAttendance.find((s) => s.status === "LATE")?._count || 0);
      const todayAttendanceRate =
        totalToday > 0 ? Math.round((presentToday / totalToday) * 100) : 0;

      return {
        totalStudents,
        totalTeachers,
        totalClassrooms,
        todayAttendanceRate,
        todayAttendanceBreakdown: todayAttendance,
        recentIncidents,
        pendingPayments,
      };
    }),
});
