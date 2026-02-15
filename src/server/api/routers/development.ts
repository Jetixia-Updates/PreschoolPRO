import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  permissionProcedure,
} from "../trpc";
import { DevelopmentDomain, MilestoneStatus, ISCEDLevel } from "@prisma/client";

export const developmentRouter = createTRPCRouter({
  // Get all development domain records for a student
  getStudentDevelopment: permissionProcedure("development:view")
    .input(
      z.object({
        studentId: z.string(),
        domain: z.nativeEnum(DevelopmentDomain).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const records = await ctx.prisma.developmentRecord.findMany({
        where: {
          studentId: input.studentId,
          ...(input.domain && { domain: input.domain }),
        },
        include: {
          assessments: {
            include: {
              milestone: true,
            },
            orderBy: { assessedAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return records;
    }),

  // Create a new assessment
  createAssessment: permissionProcedure("development:assess")
    .input(
      z.object({
        studentId: z.string(),
        domain: z.nativeEnum(DevelopmentDomain),
        milestoneId: z.string(),
        status: z.nativeEnum(MilestoneStatus),
        score: z.number().min(0).max(100).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find or create a development record for this domain
      let devRecord = await ctx.prisma.developmentRecord.findFirst({
        where: {
          studentId: input.studentId,
          domain: input.domain,
        },
      });

      if (!devRecord) {
        devRecord = await ctx.prisma.developmentRecord.create({
          data: {
            studentId: input.studentId,
            domain: input.domain,
          },
        });
      }

      const assessment = await ctx.prisma.assessment.create({
        data: {
          developmentRecordId: devRecord.id,
          milestoneId: input.milestoneId,
          status: input.status,
          score: input.score,
          notes: input.notes,
          studentId: input.studentId,
        },
        include: {
          milestone: true,
        },
      });

      return assessment;
    }),

  // Add a teacher observation
  addObservation: permissionProcedure("development:assess")
    .input(
      z.object({
        studentId: z.string(),
        title: z.string().min(1),
        description: z.string().min(1),
        domain: z.nativeEnum(DevelopmentDomain).optional(),
        photos: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const observation = await ctx.prisma.observation.create({
        data: {
          studentId: input.studentId,
          observerId: ctx.session.user.id,
          title: input.title,
          description: input.description,
          domain: input.domain,
          photos: input.photos || [],
        },
        include: {
          observer: {
            select: { name: true, email: true },
          },
        },
      });

      return observation;
    }),

  // Get milestones by domain and age range
  getMilestones: permissionProcedure("development:view")
    .input(
      z.object({
        domain: z.nativeEnum(DevelopmentDomain),
        ageMin: z.number().optional(),
        ageMax: z.number().optional(),
        iscedLevel: z.nativeEnum(ISCEDLevel).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        domain: input.domain,
      };

      if (input.ageMin !== undefined) {
        where.ageMax = { gte: input.ageMin };
      }
      if (input.ageMax !== undefined) {
        where.ageMin = { lte: input.ageMax };
      }
      if (input.iscedLevel) {
        where.iscedLevel = input.iscedLevel;
      }

      const milestones = await ctx.prisma.milestone.findMany({
        where,
        orderBy: [{ ageMin: "asc" }, { order: "asc" }],
      });

      return milestones;
    }),

  // Get progress over time for a specific domain
  getDomainProgress: permissionProcedure("development:view")
    .input(
      z.object({
        studentId: z.string(),
        domain: z.nativeEnum(DevelopmentDomain),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        developmentRecord: {
          studentId: input.studentId,
          domain: input.domain,
        },
      };

      if (input.startDate || input.endDate) {
        where.assessedAt = {};
        if (input.startDate) where.assessedAt.gte = input.startDate;
        if (input.endDate) where.assessedAt.lte = input.endDate;
      }

      const assessments = await ctx.prisma.assessment.findMany({
        where,
        include: {
          milestone: true,
        },
        orderBy: { assessedAt: "asc" },
      });

      // Group by month for progress tracking
      const progressByMonth: Record<
        string,
        { month: string; assessments: typeof assessments; averageScore: number }
      > = {};

      for (const assessment of assessments) {
        const monthKey = assessment.assessedAt.toISOString().slice(0, 7);
        if (!progressByMonth[monthKey]) {
          progressByMonth[monthKey] = {
            month: monthKey,
            assessments: [],
            averageScore: 0,
          };
        }
        progressByMonth[monthKey].assessments.push(assessment);
      }

      // Calculate average scores
      for (const key of Object.keys(progressByMonth)) {
        const group = progressByMonth[key];
        const scores = group.assessments
          .filter((a) => a.score !== null)
          .map((a) => a.score!);
        group.averageScore =
          scores.length > 0
            ? scores.reduce((sum, s) => sum + s, 0) / scores.length
            : 0;
      }

      return {
        assessments,
        progressByMonth: Object.values(progressByMonth),
      };
    }),
});
