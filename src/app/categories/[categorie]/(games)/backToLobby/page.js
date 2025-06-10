import getUser from "@/utils/getUser";

import BackToLobby from "./BackToLobby";

export default async function BackToLobbyPage({ searchParams }) {
  const { path, guestName } = searchParams;
  const user = await getUser();

  return <BackToLobby path={path} user={user} guestName={guestName} />;
}
