import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  permissionProcedure,
} from "../trpc";
import { ISCEDLevel, Gender } from "@prisma/client";
import { generateStudentId, calculateAgeInMonths } from "@/lib/utils";

export const studentRouter = createTRPCRouter({
  // Get all students (with filters and pagination)
  getAll: permissionProcedure("student:view").input(
    z.object({
      schoolId: z.string().optional(),
      iscedLevel: z.nativeEnum(ISCEDLevel).optional(),
      classroomId: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    })
  ).query(async ({ ctx, input }) => {
    const { schoolId, iscedLevel, classroomId, search, limit, cursor } = input;

    // Build where clause
    const where: any = {
      schoolId: schoolId || ctx.session.user.schoolId,
      isActive: true,
    };

    if (iscedLevel) {
      where.iscedLevel = iscedLevel;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { studentId: { contains: search, mode: "insensitive" } },
      ];
    }

    const students = await ctx.prisma.student.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        parents: {
          include: {
            parent: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        classAssignments: {
          where: { isActive: true },
          include: {
            classroom: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    let nextCursor: string | undefined = undefined;
    if (students.length > limit) {
      const nextItem = students.pop();
      nextCursor = nextItem!.id;
    }

    return {
      students,
      nextCursor,
    };
  }),

  // Get student by ID
  getById: permissionProcedure("student:view").input(
    z.object({
      id: z.string(),
    })
  ).query(async ({ ctx, input }) => {
    const student = await ctx.prisma.student.findUnique({
      where: { id: input.id },
      include: {
        parents: {
          include: {
            parent: {
              include: {
                user: true,
              },
            },
          },
        },
        classAssignments: {
          where: { isActive: true },
          include: {
            classroom: {
              include: {
                program: true,
                leadTeacher: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        emergencyContacts: true,
        healthRecords: true,
        developmentRecords: {
          include: {
            assessments: {
              include: {
                milestone: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    return student;
  }),

  // Create new student
  create: permissionProcedure("student:create").input(
    z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      dateOfBirth: z.date(),
      gender: z.nativeEnum(Gender),
      iscedLevel: z.nativeEnum(ISCEDLevel),
      nationality: z.string().optional(),
      nationalId: z.string().optional(),
      address: z.string().optional(),
      specialNeeds: z.string().optional(),
      allergies: z.array(z.string()).optional(),
      medicalNotes: z.string().optional(),
      photo: z.string().optional(),
      schoolId: z.string().optional(),
    })
  ).mutation(async ({ ctx, input }) => {
    const { firstName, lastName, ...rest } = input;
    const fullName = `${firstName} ${lastName}`;
    const studentId = generateStudentId();
    const schoolId = input.schoolId || ctx.session.user.schoolId;

    const student = await ctx.prisma.student.create({
      data: {
        studentId,
        firstName,
        lastName,
        fullName,
        schoolId,
        ...rest,
      },
    });

    return student;
  }),

  // Update student
  update: permissionProcedure("student:update").input(
    z.object({
      id: z.string(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      photo: z.string().optional(),
      address: z.string().optional(),
      specialNeeds: z.string().optional(),
      allergies: z.array(z.string()).optional(),
      medicalNotes: z.string().optional(),
    })
  ).mutation(async ({ ctx, input }) => {
    const { id, firstName, lastName, ...rest } = input;

    const updateData: any = { ...rest };

    if (firstName || lastName) {
      const current = await ctx.prisma.student.findUnique({
        where: { id },
        select: { firstName: true, lastName: true },
      });

      if (current) {
        const newFirstName = firstName || current.firstName;
        const newLastName = lastName || current.lastName;
        updateData.firstName = newFirstName;
        updateData.lastName = newLastName;
        updateData.fullName = `${newFirstName} ${newLastName}`;
      }
    }

    const student = await ctx.prisma.student.update({
      where: { id },
      data: updateData,
    });

    return student;
  }),

  // Get student statistics
  getStats: protectedProcedure.input(
    z.object({
      schoolId: z.string().optional(),
    })
  ).query(async ({ ctx, input }) => {
    const schoolId = input.schoolId || ctx.session.user.schoolId;

    const [total, byISCED, byGender] = await Promise.all([
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
    ]);

    return {
      total,
      byISCED,
      byGender,
    };
  }),
});
