import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  permissionProcedure,
} from "../trpc";
import { DevelopmentDomain } from "@prisma/client";
import {
  analyzeDevelopmentData,
  generateActivityRecommendations,
  generateProgressReport,
  generateParentMessage,
} from "@/lib/ai";
import { calculateAgeInMonths } from "@/lib/utils";

export const aiRouter = createTRPCRouter({
  // Analyze a student's development using AI
  analyzeDevelopment: permissionProcedure("development:view")
    .input(
      z.object({
        studentId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const student = await ctx.prisma.student.findUnique({
        where: { id: input.studentId },
        include: {
          developmentRecords: {
            include: {
              assessments: {
                include: { milestone: true },
                orderBy: { assessedAt: "desc" },
              },
            },
          },
        },
      });

      if (!student) {
        throw new Error("Student not found");
      }

      const age = calculateAgeInMonths(student.dateOfBirth);
      const allAssessments = student.developmentRecords.flatMap(
        (r) => r.assessments
      );

      const analysis = await analyzeDevelopmentData(
        {
          name: student.fullName,
          age,
          iscedLevel: student.iscedLevel,
          specialNeeds: student.specialNeeds,
        },
        allAssessments
      );

      return analysis;
    }),

  // Generate a progress report
  generateReport: permissionProcedure("report:generate")
    .input(
      z.object({
        studentId: z.string(),
        period: z.string(), // e.g. "September 2025 - December 2025"
      })
    )
    .mutation(async ({ ctx, input }) => {
      const student = await ctx.prisma.student.findUnique({
        where: { id: input.studentId },
        include: {
          developmentRecords: {
            include: {
              assessments: {
                include: { milestone: true },
                orderBy: { assessedAt: "desc" },
              },
            },
          },
        },
      });

      if (!student) {
        throw new Error("Student not found");
      }

      const age = calculateAgeInMonths(student.dateOfBirth);
      const allAssessments = student.developmentRecords.flatMap(
        (r) => r.assessments
      );

      const report = await generateProgressReport(
        {
          name: student.fullName,
          age,
          iscedLevel: student.iscedLevel,
        },
        allAssessments,
        input.period
      );

      return { report };
    }),

  // Get activity recommendations for a student
  getActivityRecommendations: permissionProcedure("development:view")
    .input(
      z.object({
        studentId: z.string(),
        domain: z.nativeEnum(DevelopmentDomain),
      })
    )
    .query(async ({ ctx, input }) => {
      const student = await ctx.prisma.student.findUnique({
        where: { id: input.studentId },
      });

      if (!student) {
        throw new Error("Student not found");
      }

      const age = calculateAgeInMonths(student.dateOfBirth);

      const activities = await generateActivityRecommendations(
        {
          age,
          iscedLevel: student.iscedLevel,
          specialNeeds: student.specialNeeds,
        },
        input.domain
      );

      return { activities };
    }),

  // Generate a parent communication message
  generateParentMessage: permissionProcedure("message:send")
    .input(
      z.object({
        context: z.string().min(1),
        tone: z.enum(["formal", "friendly", "urgent"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const message = await generateParentMessage(input.context, input.tone);

      return { message };
    }),
});
