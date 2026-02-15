import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  permissionProcedure,
} from "../trpc";
import { PaymentStatus } from "@prisma/client";

export const billingRouter = createTRPCRouter({
  // List invoices with filters
  getInvoices: permissionProcedure("billing:view")
    .input(
      z.object({
        studentId: z.string().optional(),
        paymentPlanId: z.string().optional(),
        overdue: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { studentId, paymentPlanId, overdue, limit, cursor } = input;

      const where: any = {};
      if (studentId) where.studentId = studentId;
      if (paymentPlanId) where.paymentPlanId = paymentPlanId;
      if (overdue) {
        where.dueDate = { lt: new Date() };
        where.payments = {
          none: { status: "PAID" },
        };
      }

      const invoices = await ctx.prisma.invoice.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { issuedAt: "desc" },
        include: {
          paymentPlan: true,
          payments: {
            orderBy: { paidAt: "desc" },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (invoices.length > limit) {
        const nextItem = invoices.pop();
        nextCursor = nextItem!.id;
      }

      return { invoices, nextCursor };
    }),

  // Generate a new invoice
  createInvoice: permissionProcedure("billing:manage")
    .input(
      z.object({
        studentId: z.string(),
        paymentPlanId: z.string(),
        amount: z.number().positive(),
        dueDate: z.date(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate unique invoice number
      const count = await ctx.prisma.invoice.count();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

      const invoice = await ctx.prisma.invoice.create({
        data: {
          invoiceNumber,
          studentId: input.studentId,
          paymentPlanId: input.paymentPlanId,
          amount: input.amount,
          dueDate: input.dueDate,
          notes: input.notes,
        },
        include: {
          paymentPlan: true,
        },
      });

      return invoice;
    }),

  // Record a payment against an invoice
  recordPayment: permissionProcedure("billing:process")
    .input(
      z.object({
        invoiceId: z.string(),
        studentId: z.string(),
        amount: z.number().positive(),
        paymentMethod: z.string(),
        transactionId: z.string().optional(),
        status: z.nativeEnum(PaymentStatus),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const schoolId = ctx.session.user.schoolId;

      const payment = await ctx.prisma.payment.create({
        data: {
          invoiceId: input.invoiceId,
          studentId: input.studentId,
          amount: input.amount,
          paymentMethod: input.paymentMethod,
          transactionId: input.transactionId,
          status: input.status,
          schoolId,
          notes: input.notes,
        },
        include: {
          invoice: true,
        },
      });

      return payment;
    }),

  // List payment plans
  getPaymentPlans: permissionProcedure("billing:view")
    .input(
      z.object({
        isActive: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const plans = await ctx.prisma.paymentPlan.findMany({
        where: { isActive: input.isActive },
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { invoices: true },
          },
        },
      });

      return plans;
    }),

  // Revenue and financial statistics
  getFinancialStats: permissionProcedure("billing:view")
    .input(
      z.object({
        schoolId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const schoolId = input.schoolId || ctx.session.user.schoolId;

      const dateFilter: any = {};
      if (input.startDate) dateFilter.gte = input.startDate;
      if (input.endDate) dateFilter.lte = input.endDate;

      const [totalRevenue, paymentsByStatus, paymentsByMethod, recentPayments] =
        await Promise.all([
          ctx.prisma.payment.aggregate({
            where: {
              schoolId,
              status: "PAID",
              ...(Object.keys(dateFilter).length > 0 && {
                paidAt: dateFilter,
              }),
            },
            _sum: { amount: true },
            _count: true,
          }),
          ctx.prisma.payment.groupBy({
            by: ["status"],
            where: {
              schoolId,
              ...(Object.keys(dateFilter).length > 0 && {
                paidAt: dateFilter,
              }),
            },
            _sum: { amount: true },
            _count: true,
          }),
          ctx.prisma.payment.groupBy({
            by: ["paymentMethod"],
            where: {
              schoolId,
              status: "PAID",
              ...(Object.keys(dateFilter).length > 0 && {
                paidAt: dateFilter,
              }),
            },
            _sum: { amount: true },
            _count: true,
          }),
          ctx.prisma.payment.findMany({
            where: { schoolId },
            take: 10,
            orderBy: { paidAt: "desc" },
            include: {
              student: {
                select: { fullName: true },
              },
              invoice: {
                select: { invoiceNumber: true },
              },
            },
          }),
        ]);

      // Count overdue invoices
      const overdueInvoices = await ctx.prisma.invoice.count({
        where: {
          dueDate: { lt: new Date() },
          payments: {
            none: { status: "PAID" },
          },
        },
      });

      return {
        totalRevenue: totalRevenue._sum.amount || 0,
        totalPayments: totalRevenue._count,
        paymentsByStatus,
        paymentsByMethod,
        recentPayments,
        overdueInvoices,
      };
    }),
});
