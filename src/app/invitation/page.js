import getUser from "@/utils/getUser";
import { setCookieToken } from "@/utils/setCookieToken";

import GuestInvitation from "./GuestInvitation";
import UserInvitation from "./UserInvitation";

export default async function InvitationPage({ searchParams }) {
  const user = await getUser();
  const userName = user?.name;

  if (!user)
    return (
      <GuestInvitation
        searchParams={searchParams}
        setCookieToken={setCookieToken}
      />
    );
  else
    return <UserInvitation searchParams={searchParams} userName={userName} />;
}
