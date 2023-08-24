import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { VscAccount, VscHome, VscSettingsGear, VscSignIn, VscSignOut } from "react-icons/vsc";
import { IconHoverEffect } from "./IconHoverEffect";
import largeLogo from "./BananoSpacelogo.png";

import Image from "next/image";
import { api } from "~/utils/api";
import { useLayoutEffect, useState } from "react";

function Balance() {
  const session = useSession();
  const [currentBalance, setCurrentBalance] = useState(0); 
  if (session.status !== "authenticated") return null;
  const fetchUser = api.settings.fetchBalance.useQuery({ id: session.data.user.id });
  useLayoutEffect(() => {
    
      if (fetchUser.data == null || fetchUser.data == undefined) {
        return}
      setCurrentBalance(fetchUser.data);

    
  }, [fetchUser.data]);

  return <span>{currentBalance}</span>
}

export function SideNav() {
  const session = useSession();

  
  const user = session.data?.user;
  

  
  return (
    <nav className="bg-[#2A2A2E] min-h-screen sticky top-0 px-2 py-4">
      <ul className="flex flex-col items-start gap-2 whitespace-nowrap">
        <li>
          <Image src={largeLogo} alt="logo" className="w-32"/>
        </li>
        {user != null && (

      <li className="w-full flex items-center justify-center"> 
        <span className="text-white font-bold tracking-wide"><Balance /> BAN</span>
      </li>
        )}
        <li>
          <Link href="/">
            <IconHoverEffect>
              <span className="flex items-center gap-4">
                <VscHome className="h-8 w-8 fill-white" />
                <p className="hidden text-white text-lg md:inline">Home</p>
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
                <span className="hidden text-white text-lg md:inline">Profile</span>
              </span>
            </IconHoverEffect>
          </Link>
          </li>
          <li>
            <Link href={`/settings/${user.id}`}>
            <IconHoverEffect>
              <span className="flex items-center gap-4">
                <VscSettingsGear className="h-8 w-8 fill-white" />
                <span className="hidden text-white text-lg md:inline">Settings</span>
              </span>
            </IconHoverEffect>
          </Link>
          </li>
          </>

        )}
        {user == null ? (
          <li>
            <button onClick={() => void signIn()}><IconHoverEffect>
              <span className="flex items-center gap-4">
                <VscSignIn className="h-8 w-8 fill-green-700 text-green-700" />
                <span className="hidden text-white text-lg md:inline">Sign In</span>
              </span>
            </IconHoverEffect></button>
          </li>
        ) : (
          <li>
            <button onClick={() => void signOut()}><IconHoverEffect>
              <span className="flex items-center gap-4">
                <VscSignOut className="h-8 w-8 fill-red-700 text-red-700" />
                <span className="hidden text-white text-lg md:inline">Sign Out</span>
              </span>
            </IconHoverEffect></button>
          </li>
        )}

      </ul>
    </nav>
  );
}
