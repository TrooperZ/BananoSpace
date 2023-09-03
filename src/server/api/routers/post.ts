import type { Prisma } from "@prisma/client";
import type { inferAsyncReturnType } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

import type {createTRPCContext} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  infiniteProfileFeed: publicProcedure.input(z.object({userId: z.string(), limit: z.number().optional(), 
    cursor: z.object({ id: z.string(), createdAt: z.date() }).optional()})).query(
      async ({ input: { limit = 10, userId, cursor }, ctx }) => {

        return await getInfinitePosts({limit, ctx, cursor, whereClause: {userId}
        });
      }),        
  infiniteFeed: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        onlyFollowing: z.boolean().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(
      async ({ input: { limit = 10, onlyFollowing = false, cursor }, ctx }) => {
        const currentUserId = ctx.session?.user?.id;
        return await getInfinitePosts({limit, ctx, cursor, whereClause: currentUserId == null || !onlyFollowing ? undefined : {
          user: { followers: { some: {id: currentUserId} } }
        }});
      }
    ),
  create: protectedProcedure
    .input(z.object({ content: z.string(), image: z.string() }))
    .mutation(async ({ input: { content, image }, ctx }) => {
      const post = await ctx.prisma.post.create({
        data: { content, image: image, userId: ctx.session.user.id },
      });
      void ctx.revalidateSSG?.(`/profiles/${ctx.session.user.id}`);
      return post;
    }),
  toggleLike: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {
      const data = { postId: id, userId: ctx.session.user.id };

      const existingLike = await ctx.prisma.like.findUnique({
        where: { userId_postId: data },
      });

      if (existingLike == null) {
        await ctx.prisma.like.create({ data });
        return { addedLike: true };
      } else {
        await ctx.prisma.like.delete({ where: { userId_postId: data } });
        return { addedLike: false };
      }
    }),
    deletePost: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {

      await ctx.prisma.post.delete({ where: { id: id } });
      void ctx.revalidateSSG?.(`/profiles/${ctx.session.user.id}`);

    }),
    tipPost: protectedProcedure
    .input(z.object({ userId: z.string(), postId: z.string(), amt: z.number()}))
    .mutation(async ({ input: { userId, postId, amt }, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });
      const targetUuser = await ctx.prisma.user.findUnique({
        where: { id: userId },
      })
      const data = { postId: postId, userId: ctx.session.user.id };
      const existingTip = await ctx.prisma.tip.findUnique({
        where: { userId_postId: data },
      });
      
      await ctx.prisma.user.update({
        
        where: { id: ctx.session.user.id },
        data: { balance: user!.balance - amt },
      }) 
      console.log(ctx.session.user.id)

      console.log(userId)
      await ctx.prisma.user.update({
        
        where: { id: userId },
        data: { balance: targetUuser!.balance + amt },
      }) 

      try {
      await ctx.prisma.tip.create({
        data: {
          userId: ctx.session.user.id,
          postId: postId,
          amount: amt
        }
       });}
      catch{
        await ctx.prisma.tip.update({
          where: { userId_postId: data },
          data: { amount: existingTip!.amount + amt }
        })
      }

      void ctx.revalidateSSG?.(`/profiles/${ctx.session.user.id}`);
        
      return amt;
      
    }),
    // makeComment: protectedProcedure.input(z.object({ creator: z.string(), postId: z.string(), content: z.string()}))
    // .mutation(async ({ input: { creator, postId, content }, ctx })  => {
    //   const post = await ctx.prisma.post.findUnique({
    //     where: { id: postId },
    //   });
    //   await ctx.prisma.comment.create({
    //     data: { content, postId, creator: creator, userId: ctx.session.user.id },
    //   })
    // }),
    // deleteComment: protectedProcedure
    // .input(z.object({ id: z.string() }))
    // .mutation(async ({ input: { id }, ctx }) => {

    //   await ctx.prisma.comment.delete({ where: { id: id } });
    //   void ctx.revalidateSSG?.(`/profiles/${ctx.session.user.id}`);

    // }),
});

async function getInfinitePosts({
  limit, ctx, cursor, whereClause
}: {
  whereClause?: Prisma.PostWhereInput;
  ctx: inferAsyncReturnType<typeof createTRPCContext>;
  limit: number;
  cursor: { id: string; createdAt: Date } | undefined;
}) {
  const currentUserId = ctx.session?.user.id;
  const posts = await ctx.prisma.post.findMany({
    take: limit + 1,
    cursor: cursor ? { createdAt_id: cursor } : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    where: whereClause,
    select: {
      id: true,
      content: true,
      createdAt: true,
      _count: { select: { likes: true } },
      tips: true,
      image: true,
      comments: true,
      likes:
        currentUserId == null
          ? false
          : { where: { userId: currentUserId } },
      user: {
        select: { name: true, id: true, image: true },
      },
    },
  });

  let nextCursor: typeof cursor | undefined;

  if (posts.length > limit) {
    const nextItem = posts.pop();
    if (nextItem != null) {
      nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
    }
  }

  return {
    posts: posts.map((post) => {
      let tipTotal = 0.0;
      for (const tip of post.tips) {
        tipTotal += tip.amount;
      }
      return {
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        likeCount: post._count.likes,
        user: post.user,
        likedByMe: post.likes?.length > 0,
        tipped: post.tips,
        totalTips: tipTotal,
        imageURL: post.image,
        comments: post.comments,
      };
    }),
    nextCursor,
  };
}

{
}
