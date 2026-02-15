import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  permissionProcedure,
} from "../trpc";
import { ISCEDLevel, DevelopmentDomain } from "@prisma/client";

export const curriculumRouter = createTRPCRouter({
  // List all curricula
  getAll: permissionProcedure("curriculum:view")
    .input(
      z.object({
        iscedLevel: z.nativeEnum(ISCEDLevel).optional(),
        domain: z.nativeEnum(DevelopmentDomain).optional(),
        isTemplate: z.boolean().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { iscedLevel, domain, isTemplate, search, limit, cursor } = input;

      const where: any = {};
      if (iscedLevel) where.iscedLevel = iscedLevel;
      if (domain) where.domain = domain;
      if (isTemplate !== undefined) where.isTemplate = isTemplate;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const curricula = await ctx.prisma.curriculum.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { updatedAt: "desc" },
        include: {
          _count: {
            select: { lessonPlans: true },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (curricula.length > limit) {
        const nextItem = curricula.pop();
        nextCursor = nextItem!.id;
      }

      return { curricula, nextCursor };
    }),

  // Get curriculum with lesson plans
  getById: permissionProcedure("curriculum:view")
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const curriculum = await ctx.prisma.curriculum.findUnique({
        where: { id: input.id },
        include: {
          lessonPlans: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!curriculum) {
        throw new Error("Curriculum not found");
      }

      return curriculum;
    }),

  // Create a lesson plan
  createLessonPlan: permissionProcedure("curriculum:create")
    .input(
      z.object({
        curriculumId: z.string(),
        title: z.string().min(1),
        objectives: z.array(z.string()),
        materials: z.array(z.string()),
        activities: z.array(z.any()),
        duration: z.number().min(1),
        attachments: z.array(z.string()).optional(),
        learningOutcomes: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const lessonPlan = await ctx.prisma.lessonPlan.create({
        data: {
          curriculumId: input.curriculumId,
          title: input.title,
          objectives: input.objectives,
          materials: input.materials,
          activities: input.activities,
          duration: input.duration,
          attachments: input.attachments || [],
          learningOutcomes: input.learningOutcomes,
        },
      });

      return lessonPlan;
    }),

  // Update a lesson plan
  updateLessonPlan: permissionProcedure("curriculum:update")
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        objectives: z.array(z.string()).optional(),
        materials: z.array(z.string()).optional(),
        activities: z.array(z.any()).optional(),
        duration: z.number().min(1).optional(),
        attachments: z.array(z.string()).optional(),
        learningOutcomes: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Filter out undefined values
      const updateData: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          updateData[key] = value;
        }
      }

      const lessonPlan = await ctx.prisma.lessonPlan.update({
        where: { id },
        data: updateData,
      });

      return lessonPlan;
    }),
});
