import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  VscAccount,
  VscHome,
  VscSettingsGear,
  VscSignIn,
  VscSignOut,
} from "react-icons/vsc";
import { IconHoverEffect } from "./IconHoverEffect";
import largeLogo from "./BananoSpacelogo.png";
import smallLogo from "./BananoSpacelogo_small.png";

import Image from "next/image";
import { api } from "~/utils/api";
import { useEffect, useState } from "react";




function Balance({ session }: { session: any }) {
  const [currentBalance, setCurrentBalance] = useState(0);

  const fetchUser = api.settings.fetchBalance.useQuery({
    id: session.data.user.id,
  });

  useEffect(() => {
    if (session.status === "authenticated") {
      // Update balance only when authenticated
      setCurrentBalance(fetchUser.data ? fetchUser.data : 0);
    }
  }, [fetchUser.data, session.status]);

  return <span>{currentBalance.toFixed(2)}</span>;
}


export function SideNav() {
  const session = useSession();

  const user = session.data?.user;

  return (
    <nav className="sticky top-0 min-h-screen bg-[#2A2A2E] px-2 py-4">
      <ul className="flex flex-col items-start gap-2 whitespace-nowrap">
        <li>
          <Image src={largeLogo} alt="logo" className="w-32 hidden md:block" />
          <Image src={smallLogo} alt="logo" className="w-10 block md:hidden" />
        </li>
        {user != null && (
          <li className="flex w-full items-center justify-center">
            <span className="font-bold tracking-wide text-sm md:text-lg text-white">
              <Balance session={session}/> BAN
            </span>
          </li>
        )}
        <li>
          <Link href="/">
            <IconHoverEffect>
              <span className="flex items-center gap-4">
                <VscHome className="h-8 w-8 fill-white" />
                <p className="hidden text-lg text-white md:inline">Home</p>
              </span>
            </IconHoverEffect>
          </Link>
        </li>
        {user != null && (
          <>
            <li>
              <Link href={`/profiles/${user.id}`}>
                <IconHoverEffect>
                  <span className="flex items-center gap-4">
                    <VscAccount className="h-8 w-8 fill-white" />
                    <span className="hidden text-lg text-white md:inline">
                      Profile
                    </span>
                  </span>
                </IconHoverEffect>
              </Link>
            </li>
            <li>
              <Link href={`/settings/${user.id}`}>
                <IconHoverEffect>
                  <span className="flex items-center gap-4">
                    <VscSettingsGear className="h-8 w-8 fill-white" />
                    <span className="hidden text-lg text-white md:inline">
                      Settings
                    </span>
                  </span>
                </IconHoverEffect>
              </Link>
            </li>
          </>
        )}
        {user == null ? (
          <li>
            <button onClick={() => void signIn()}>
              <IconHoverEffect>
                <span className="flex items-center gap-4">
                  <VscSignIn className="h-8 w-8 fill-green-700 text-green-700" />
                  <span className="hidden text-lg text-white md:inline">
                    Sign In
                  </span>
                </span>
              </IconHoverEffect>
            </button>
          </li>
        ) : (
          <li>
            <button onClick={() => void signOut()}>
              <IconHoverEffect>
                <span className="flex items-center gap-4">
                  <VscSignOut className="h-8 w-8 fill-red-700 text-red-700" />
                  <span className="hidden text-lg text-white md:inline">
                    Sign Out
                  </span>
                </span>
              </IconHoverEffect>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
