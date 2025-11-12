import { protectedProcedure, publicProcedure, router } from "../index";
import { projectsRouter } from "./projects";
import { tasksRouter } from "./tasks";
import { teamRouter } from "./team";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  // Phase 2: Core business logic routers
  projects: projectsRouter,
  tasks: tasksRouter,
  team: teamRouter,
});
export type AppRouter = typeof appRouter;
