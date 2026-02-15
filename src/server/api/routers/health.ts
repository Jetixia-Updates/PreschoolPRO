import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  permissionProcedure,
} from "../trpc";
import { IncidentSeverity } from "@prisma/client";

export const healthRouter = createTRPCRouter({
  // Get health record for a student
  getStudentHealth: permissionProcedure("health:view")
    .input(z.object({ studentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [healthRecords, vaccinations] = await Promise.all([
        ctx.prisma.healthRecord.findMany({
          where: { studentId: input.studentId },
          orderBy: { updatedAt: "desc" },
        }),
        ctx.prisma.vaccination.findMany({
          where: { studentId: input.studentId },
          orderBy: { administeredAt: "desc" },
        }),
      ]);

      return {
        healthRecords,
        vaccinations,
      };
    }),

  // Update medical info in health record
  updateHealthRecord: permissionProcedure("health:update")
    .input(
      z.object({
        id: z.string().optional(),
        studentId: z.string(),
        bloodType: z.string().optional(),
        chronicConditions: z.array(z.string()).optional(),
        medications: z.array(z.any()).optional(),
        allergies: z.array(z.string()).optional(),
        doctorName: z.string().optional(),
        doctorPhone: z.string().optional(),
        insuranceInfo: z.any().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, studentId, ...data } = input;

      if (id) {
        // Update existing record
        const record = await ctx.prisma.healthRecord.update({
          where: { id },
          data,
        });
        return record;
      }

      // Create new record
      const record = await ctx.prisma.healthRecord.create({
        data: {
          studentId,
          ...data,
        },
      });
      return record;
    }),

  // Record a vaccination
  addVaccination: permissionProcedure("health:update")
    .input(
      z.object({
        studentId: z.string(),
        vaccineName: z.string().min(1),
        administeredAt: z.date(),
        nextDose: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const vaccination = await ctx.prisma.vaccination.create({
        data: {
          studentId: input.studentId,
          vaccineName: input.vaccineName,
          administeredAt: input.administeredAt,
          nextDose: input.nextDose,
          notes: input.notes,
        },
      });

      return vaccination;
    }),

  // Create an incident report
  createIncidentReport: permissionProcedure("health:incident")
    .input(
      z.object({
        studentId: z.string(),
        title: z.string().min(1),
        description: z.string().min(1),
        severity: z.nativeEnum(IncidentSeverity),
        location: z.string().optional(),
        actionTaken: z.string().optional(),
        photos: z.array(z.string()).optional(),
        occurredAt: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const report = await ctx.prisma.incidentReport.create({
        data: {
          studentId: input.studentId,
          reporterId: ctx.session.user.id,
          title: input.title,
          description: input.description,
          severity: input.severity,
          location: input.location,
          actionTaken: input.actionTaken,
          photos: input.photos || [],
          occurredAt: input.occurredAt,
        },
        include: {
          reporter: {
            select: { name: true, email: true },
          },
          student: {
            select: { id: true, fullName: true },
          },
        },
      });

      return report;
    }),

  // List incident reports
  getIncidentReports: permissionProcedure("health:view")
    .input(
      z.object({
        studentId: z.string().optional(),
        severity: z.nativeEnum(IncidentSeverity).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { studentId, severity, startDate, endDate, limit, cursor } = input;

      const where: any = {};
      if (studentId) where.studentId = studentId;
      if (severity) where.severity = severity;
      if (startDate || endDate) {
        where.occurredAt = {};
        if (startDate) where.occurredAt.gte = startDate;
        if (endDate) where.occurredAt.lte = endDate;
      }

      const reports = await ctx.prisma.incidentReport.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { reportedAt: "desc" },
        include: {
          student: {
            select: { id: true, fullName: true, photo: true },
          },
          reporter: {
            select: { name: true, email: true },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (reports.length > limit) {
        const nextItem = reports.pop();
        nextCursor = nextItem!.id;
      }

      return { reports, nextCursor };
    }),
});
