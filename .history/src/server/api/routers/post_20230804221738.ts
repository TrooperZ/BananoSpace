import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  infiniteFeed: publicProcedure.input(
    z.object({
      limit: z.number().optional(),
      cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
    })
  ).query(async ({ input: { limit = 10, cursor }, ctx }) => {
    const currentUserId = ctx.session?.user.id
    const posts = await ctx.prisma.post.findMany({
      take: limit + 1,
      cursor: cursor ? { createdAt_id: cursor } : undefined,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        content: true,
        createdAt: true,
        _count: { select: { likes: true } },
        likes: currentUserId == null ? false : { where: { userId: currentUserId } },
        user: {
          select: { name: true, id: true, image: true }
        }
      }
    });

    let nextCursor: typeof cursor | undefined;

    if (posts.length > limit) {
      const nextItem = posts.pop();
      if (nextItem != null) {
        nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt }
      }
    }
    return { posts: posts.map(post => {return {id: post.id, content: post.content, createdAt: post.createdAt, likeCount: post._count.likes, user: post.user, likedByMe: post.likes?.length > 0,}}), nextCursor }
  }),
  create: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input: { content }, ctx }) => {
      const post = await ctx.prisma.post.create({
        data: { content, userId: ctx.session.user.id },
      });

      return post;
    }),
    toggleLike: protectedProcedure.input(z.object({ id: z.string()})).query(async ({ input: { id }, ctx }) => {
      const data = {postId: id, userId: ctx.session.user.id}
      const existing = await ctx.prisma.like.findUnique({
        where: {userId_postId: data }
      })

    }),

});
