import type { Prisma } from "@prisma/client";
import type { inferAsyncReturnType } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

import type { createTRPCContext } from "~/server/api/trpc";
import { BananodeApi, Main } from "@bananocoin/bananojs";
import { env } from "~/env.mjs";

import BananoUtil from "@bananocoin/bananojs";
import DepositUtil from "@bananocoin/bananojs";


Main.setBananodeApiUrl("https://kaliumapi.appditto.com/api");

export const settingsRouter = createTRPCRouter({
  updateAddress: protectedProcedure
    .input(z.string()) // Input is the new address string
    .mutation(async ({ input: newAddress, ctx }) => {
      const userId = ctx.session.user.id;
      const updatedUser = await ctx.prisma.user.update({
        where: { id: userId },
        data: { address: newAddress },
      });

      return updatedUser.address;
    }),
    fetchAddress: protectedProcedure.input(z.object({id: z.string()}) )
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user.address;
    }),
    fetchBalance: protectedProcedure.input(z.object({id: z.string()}) )
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user.balance;
    }),
    processDeposit: protectedProcedure.input(z.string())
    .mutation(async ({ input: address, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });



      let total = 0.0;
      let targetHash = "";
      const mainAddr =
      "ban_3boxjpo7symnd4pzoimc6wofa71sp6bb6n55y9axhypxkfuk7qh3aiukgte8";

    const pending = await BananodeApi.getAccountsPending([mainAddr], 25, "true").then(
      (accounts) => {
        const pendingHashes =
          accounts.blocks
            .ban_3boxjpo7symnd4pzoimc6wofa71sp6bb6n55y9axhypxkfuk7qh3aiukgte8;

        for (let hash in pendingHashes) {
          console.log(pendingHashes[hash]);
          if (pendingHashes[hash].source == address) {
            total = Number(pendingHashes[hash].amount_decimal);
            //DepositUtil.receiveBananoDepositsForSeed(env.BANANO_SEED, "0", "ban_1fomoz167m7o38gw4rzt7hz67oq6itejpt4yocrfywujbpatd711cjew8gjj", hash)
            targetHash = String(hash);
            console.log("Found");
            console.log(total);
            break;
        }
        }

  
      }
      
    );

      const dep = await DepositUtil.receiveBananoDepositsForSeed(env.BANANO_SEED, "0", "ban_1fomoz167m7o38gw4rzt7hz67oq6itejpt4yocrfywujbpatd711cjew8gjj", targetHash)
      console.log(dep)

      const updatedBalance = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { balance: user.balance + total },
      });


      return total;
    }),
    processWithdraw: protectedProcedure.input(z.string())
    .mutation(async ({ input: amount, ctx }) => {

      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });
      const balance = user.balance;
      const newBalance = balance - parseFloat(amount);
      const actAmount = parseFloat(amount) * 0.98;
      const fee = parseFloat(amount) * 0.02
      async function updateBalance () {
        console.log(`deposit of ${user.address} successfully processed`)
        
        const updatedBalance = await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: { balance: newBalance },
        })
      }

      async function fail () {
        console.log(`deposit of ${user.address} failed`)

      }
      async function feeSend () {
        console.log(`fee of ${user.address} successfully processed`)

      }
      console.log()
      const withdraw = await BananoUtil.sendAmountToBananoAccount(env.BANANO_SEED, "0", user.address, (actAmount*(10**29)), updateBalance, fail)

      const withdrawFee = await BananoUtil.sendAmountToBananoAccount(env.BANANO_SEED, "0", "ban_3zdr9i7o3knexoz7fjgae3r6u5osh7taq9e4wm5przniqjoh4idtrque55ag", (fee*(10**29)), feeSend, fail)

      
      
    }),


});

