import { cookies } from "next/headers";

import { setCookieToken } from "@/utils/setCookieToken";

import GuestConnector from "./GuestConnector";
import GuestDisconnector from "./GuestDisconnector";

export default async function GuestPage() {
  const signOut = async () => {
    "use server";
    cookies().delete("SG_token");
    cookies().delete("reservedName");
  };

  return (
    <div className="h-screen flex flex-col justify-center	">
      <GuestConnector setCookieToken={setCookieToken} />
      <GuestDisconnector signOut={signOut} />
    </div>
  );
}
