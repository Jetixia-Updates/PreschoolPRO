import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  permissionProcedure,
} from "../trpc";

export const teacherRouter = createTRPCRouter({
  // List all teachers with profiles
  getAll: permissionProcedure("teacher:view")
    .input(
      z.object({
        schoolId: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { schoolId, search, limit, cursor } = input;

      const where: any = {
        schoolId: schoolId || ctx.session.user.schoolId,
        role: { in: ["TEACHER", "ASSISTANT_TEACHER"] },
        isActive: true,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      const teachers = await ctx.prisma.user.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
          teacherProfile: true,
          classroomsAsLead: {
            where: { isActive: true },
            select: { id: true, name: true, code: true },
          },
          classroomsAsAssist: {
            where: { isActive: true },
            select: { id: true, name: true, code: true },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (teachers.length > limit) {
        const nextItem = teachers.pop();
        nextCursor = nextItem!.id;
      }

      return { teachers, nextCursor };
    }),

  // Get teacher profile with qualifications
  getById: permissionProcedure("teacher:view")
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const teacher = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
          address: true,
          createdAt: true,
          teacherProfile: true,
          classroomsAsLead: {
            where: { isActive: true },
            include: {
              program: true,
              _count: {
                select: {
                  assignments: { where: { isActive: true } },
                },
              },
            },
          },
          classroomsAsAssist: {
            where: { isActive: true },
            include: {
              program: true,
              _count: {
                select: {
                  assignments: { where: { isActive: true } },
                },
              },
            },
          },
          observations: {
            take: 10,
            orderBy: { observedAt: "desc" },
            select: {
              id: true,
              title: true,
              domain: true,
              observedAt: true,
            },
          },
        },
      });

      if (!teacher) {
        throw new Error("Teacher not found");
      }

      return teacher;
    }),

  // Update teacher profile (qualifications, certifications)
  updateProfile: permissionProcedure("teacher:manage")
    .input(
      z.object({
        userId: z.string(),
        qualifications: z.array(z.any()).optional(),
        certifications: z.array(z.any()).optional(),
        specializations: z.array(z.string()).optional(),
        yearsOfExperience: z.number().min(0).optional(),
        bio: z.string().optional(),
        emergencyContact: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, ...data } = input;

      // Filter out undefined values
      const updateData: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          updateData[key] = value;
        }
      }

      const profile = await ctx.prisma.teacherProfile.update({
        where: { userId },
        data: updateData,
      });

      return profile;
    }),

  // Get teacher performance metrics
  getPerformance: permissionProcedure("teacher:evaluate")
    .input(
      z.object({
        teacherId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const dateFilter: any = {};
      if (input.startDate) dateFilter.gte = input.startDate;
      if (input.endDate) dateFilter.lte = input.endDate;

      // Get classrooms led by this teacher
      const classrooms = await ctx.prisma.classroom.findMany({
        where: {
          OR: [
            { leadTeacherId: input.teacherId },
            { assistantTeacherId: input.teacherId },
          ],
          isActive: true,
        },
        select: { id: true },
      });

      const classroomIds = classrooms.map((c) => c.id);

      // Count observations made by this teacher
      const observationCount = await ctx.prisma.observation.count({
        where: {
          observerId: input.teacherId,
          ...(Object.keys(dateFilter).length > 0 && {
            observedAt: dateFilter,
          }),
        },
      });

      // Count assessments through development records in their classrooms
      const studentIds = await ctx.prisma.classAssignment.findMany({
        where: {
          classroomId: { in: classroomIds },
          isActive: true,
        },
        select: { studentId: true },
      });

      const uniqueStudentIds = [
        ...new Set(studentIds.map((s) => s.studentId)),
      ];

      const assessmentCount = await ctx.prisma.assessment.count({
        where: {
          studentId: { in: uniqueStudentIds },
          ...(Object.keys(dateFilter).length > 0 && {
            assessedAt: dateFilter,
          }),
        },
      });

      // Attendance stats for their classrooms
      const attendanceStats = await ctx.prisma.attendance.groupBy({
        by: ["status"],
        where: {
          classroomId: { in: classroomIds },
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
        },
        _count: true,
      });

      return {
        classroomCount: classrooms.length,
        studentCount: uniqueStudentIds.length,
        observationCount,
        assessmentCount,
        attendanceStats,
      };
    }),
});
