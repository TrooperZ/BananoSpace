import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  infiniteFeed: publicProcedure.input()
  create: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input: { content }, ctx }) => {const post =  await ctx.prisma.post.create({ data: { content, userId:  ctx.session.user.id  } });
  
  
  return post
})

});
