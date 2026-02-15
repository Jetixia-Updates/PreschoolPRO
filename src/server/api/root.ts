import { createTRPCRouter } from "./trpc";
import { studentRouter } from "./routers/student";
import { developmentRouter } from "./routers/development";
import { classroomRouter } from "./routers/classroom";
import { teacherRouter } from "./routers/teacher";
import { parentRouter } from "./routers/parent";
import { healthRouter } from "./routers/health";
import { billingRouter } from "./routers/billing";
import { curriculumRouter } from "./routers/curriculum";
import { messageRouter } from "./routers/message";
import { analyticsRouter } from "./routers/analytics";
import { aiRouter } from "./routers/ai";

/**
 * This is the primary router for the tRPC API
 * All routers are merged here
 */
export const appRouter = createTRPCRouter({
  student: studentRouter,
  development: developmentRouter,
  classroom: classroomRouter,
  teacher: teacherRouter,
  parent: parentRouter,
  health: healthRouter,
  billing: billingRouter,
  curriculum: curriculumRouter,
  message: messageRouter,
  analytics: analyticsRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
