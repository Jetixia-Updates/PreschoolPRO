import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  permissionProcedure,
} from "../trpc";
import { ISCEDLevel } from "@prisma/client";

export const classroomRouter = createTRPCRouter({
  // List classrooms with filters by school and program
  getAll: permissionProcedure("classroom:view")
    .input(
      z.object({
        schoolId: z.string().optional(),
        programId: z.string().optional(),
        academicYear: z.string().optional(),
        isActive: z.boolean().default(true),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { schoolId, programId, academicYear, isActive, limit, cursor } =
        input;

      const where: any = {
        schoolId: schoolId || ctx.session.user.schoolId,
        isActive,
      };

      if (programId) where.programId = programId;
      if (academicYear) where.academicYear = academicYear;

      const classrooms = await ctx.prisma.classroom.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { name: "asc" },
        include: {
          program: true,
          leadTeacher: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          assistantTeacher: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          _count: {
            select: {
              assignments: { where: { isActive: true } },
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (classrooms.length > limit) {
        const nextItem = classrooms.pop();
        nextCursor = nextItem!.id;
      }

      return { classrooms, nextCursor };
    }),

  // Get classroom details with roster and schedule
  getById: permissionProcedure("classroom:view")
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const classroom = await ctx.prisma.classroom.findUnique({
        where: { id: input.id },
        include: {
          program: true,
          leadTeacher: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          assistantTeacher: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          assignments: {
            where: { isActive: true },
            include: {
              student: {
                select: {
                  id: true,
                  fullName: true,
                  photo: true,
                  dateOfBirth: true,
                  gender: true,
                },
              },
            },
          },
          schedules: {
            orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
          },
        },
      });

      if (!classroom) {
        throw new Error("Classroom not found");
      }

      return classroom;
    }),

  // Create a new classroom
  create: permissionProcedure("classroom:manage")
    .input(
      z.object({
        name: z.string().min(1),
        code: z.string().min(1),
        programId: z.string(),
        leadTeacherId: z.string(),
        assistantTeacherId: z.string().optional(),
        capacity: z.number().min(1),
        roomNumber: z.string().optional(),
        academicYear: z.string(),
        schoolId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const schoolId = input.schoolId || ctx.session.user.schoolId;

      const classroom = await ctx.prisma.classroom.create({
        data: {
          name: input.name,
          code: input.code,
          programId: input.programId,
          leadTeacherId: input.leadTeacherId,
          assistantTeacherId: input.assistantTeacherId,
          capacity: input.capacity,
          roomNumber: input.roomNumber,
          academicYear: input.academicYear,
          schoolId,
        },
        include: {
          program: true,
          leadTeacher: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return classroom;
    }),

  // Assign a student to a classroom
  assignStudent: permissionProcedure("classroom:assign")
    .input(
      z.object({
        studentId: z.string(),
        classroomId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Deactivate previous assignment if any
      await ctx.prisma.classAssignment.updateMany({
        where: {
          studentId: input.studentId,
          isActive: true,
        },
        data: {
          isActive: false,
          endDate: new Date(),
        },
      });

      const assignment = await ctx.prisma.classAssignment.create({
        data: {
          studentId: input.studentId,
          classroomId: input.classroomId,
        },
        include: {
          student: {
            select: { id: true, fullName: true, photo: true },
          },
          classroom: {
            select: { id: true, name: true, code: true },
          },
        },
      });

      return assignment;
    }),

  // Get weekly schedule for a classroom
  getSchedule: permissionProcedure("classroom:view")
    .input(z.object({ classroomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const schedules = await ctx.prisma.schedule.findMany({
        where: { classroomId: input.classroomId },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      });

      // Group by day of week
      const weeklySchedule: Record<number, typeof schedules> = {};
      for (let day = 0; day <= 6; day++) {
        weeklySchedule[day] = schedules.filter((s) => s.dayOfWeek === day);
      }

      return weeklySchedule;
    }),

  // Update schedule entries
  updateSchedule: permissionProcedure("classroom:manage")
    .input(
      z.object({
        classroomId: z.string(),
        entries: z.array(
          z.object({
            id: z.string().optional(),
            dayOfWeek: z.number().min(0).max(6),
            startTime: z.string(),
            endTime: z.string(),
            subject: z.string(),
            description: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Delete existing schedules for this classroom
      await ctx.prisma.schedule.deleteMany({
        where: { classroomId: input.classroomId },
      });

      // Create new schedule entries
      const schedules = await Promise.all(
        input.entries.map((entry) =>
          ctx.prisma.schedule.create({
            data: {
              classroomId: input.classroomId,
              dayOfWeek: entry.dayOfWeek,
              startTime: entry.startTime,
              endTime: entry.endTime,
              subject: entry.subject,
              description: entry.description,
            },
          })
        )
      );

      return schedules;
    }),
});
