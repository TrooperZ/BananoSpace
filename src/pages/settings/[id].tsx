import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Head from "next/head";
import { ssgHelper } from "~/server/api/routers/ssghelper";
import { api } from "~/utils/api";

import ErrorPage from "next/error";
import Link from "next/link";
import { IconHoverEffect } from "~/components/IconHoverEffect";
import { VscArrowLeft } from "react-icons/vsc";
import Button from "~/components/Button";
import { useSession } from "next-auth/react";
import { WithdrawForm } from "~/components/WithdrawForm";
import { AddressUpdateForm } from "~/components/AddressUpdateForm";
import { useState } from "react";
import { Main } from "@bananocoin/bananojs";


Main.setBananodeApiUrl("https://kaliumapi.appditto.com/api");

const SettingsPage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ id }) => {
  const session = useSession();

  const { data: profile } = api.profile.getById.useQuery({ id });

  const [totalDep, setTotalDep] = useState(0.0);

  const depositFunc = api.settings.processDeposit.useMutation({
    onSuccess: (addedBalance) => {
      console.log(addedBalance);
      setTotalDep(addedBalance);
      return addedBalance;
    },
  });

  if (session.status !== "authenticated") return null;

  if (profile?.name == null) return <ErrorPage statusCode={404} />;

  if (session.data?.user.id != id) return <ErrorPage statusCode={403} />;

  return (
    <>
      <Head>
        <title>{`Settings - ${profile.name}`}</title>
      </Head>
      <header className="sticky top-0 z-10 flex items-center border-b bg-[#2A2A2E]  px-4 py-2">
        <Link href=".." className="mr-2">
          <IconHoverEffect>
            <VscArrowLeft className=" h-6 w-6 fill-white" />
          </IconHoverEffect>
        </Link>
      </header>
      <main className="">
        <div className="mx-10 mt-12 flex shrink flex-grow flex-col items-center gap-2 rounded-lg bg-white px-4 py-8 text-center ">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-lg ">
            Profile picture and username can be updated through Discord. Support
            for updating custom name and picture is coming soon.
          </p>
          <AddressUpdateForm />
          <WithdrawForm />
          <br />
          <h1 className="text-lg font-bold">Deposit</h1>
          <h3 className="text-center">
            Deposit funds to the address below to be able to tip users.{" "}
            <span className="font-bold text-red-500">
              WARNING: Funds must be sent FROM the same address as the
              withdrawal address.
            </span>
            <br />
            Refresh the page once a deposit is found.
          </h3>
          <p className="break-all rounded-md bg-gray-300 p-2 font-mono text-lg">
            ban_3boxjpo7symnd4pzoimc6wofa71sp6bb6n55y9axhypxkfuk7qh3aiukgte8
          </p>
          {profile.address == null ? (
            <div className="rounded-xl bg-red-300 p-2 text-lg font-bold">
              Enter withdrawal address first.
            </div>
          ) : (
            <Button
              className=""
              onClick={() => {
                if (profile.address !== null) {
                  depositFunc.mutate(profile.address);
                }
              }}
            >
              Check Deposits
            </Button>
          )}
          {totalDep > 0 ? (
            <span>
              Deposited: {totalDep} BAN. Refresh the page to update balance
            </span>
          ) : (
            <span>No deposits found.</span>
          )}
        </div>
      </main>
    </>
  );
};


export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export function getStaticProps(context: GetStaticPropsContext<{ id: string }>) {
  const id = context.params?.id;
  if (id == null) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  const ssg = ssgHelper();
  void ssg.profile.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
}

export default SettingsPage;
