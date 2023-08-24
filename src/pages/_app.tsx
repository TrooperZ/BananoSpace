import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Head from "next/head";
import { SideNav } from "~/components/SideNav";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>BananoSpace</title>
        <meta name="description" content="Welcome to BananoSpace!" />
        <link rel="icon" href="/BananoSpacelogo_small.png" />
      </Head>

      <div className=" bg-[#2A2A2E]  mx-auto flex items-start ">
        <SideNav />
        <div className="bg-[url('https://faucet.banoboto.repl.co/images/jungle.svg')] min-h-screen flex-grow ">
          <Component {...pageProps} />
        </div>
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
// https://faucet.banoboto.repl.co/images/jungle.svg
