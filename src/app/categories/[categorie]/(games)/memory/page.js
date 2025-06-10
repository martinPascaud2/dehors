import getUser from "@/utils/getUser";

import { launchGame } from "./gameActions";

import Room from "@/components/Room/Room";
import Memory from "./Memory";
import MemoryOptions from "./Options";

export default async function MemoryPage({ params, searchParams }) {
  const user = await getUser();

  if (!user)
    return (
      <Room
        user={{ name: searchParams.guestName, multiGuest: true }}
        categorie={params?.categorie}
        gameName="memory"
        Game={Memory}
        Options={MemoryOptions}
        launchGame={null}
      />
    );

  const { id, name, params: userParams } = user;

  return (
    <Room
      user={{ id, name, params: userParams }}
      categorie={params?.categorie}
      gameName="memory"
      Game={Memory}
      Options={MemoryOptions}
      launchGame={launchGame}
    />
  );
}
