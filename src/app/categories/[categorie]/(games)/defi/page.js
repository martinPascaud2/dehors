import getUser from "@/utils/getUser";

import { launchGame } from "./gameActions";

import Room from "@/components/Room/Room";
import Défi from "./Défi";
import DéfiOptions from "./Options";

export default async function DéfiPage({ params, searchParams }) {
  const user = await getUser();

  if (!user)
    return (
      <Room
        user={{ name: searchParams.guestName, multiGuest: true }}
        categorie={params?.categorie}
        gameName="defi"
        Game={Défi}
        Options={DéfiOptions}
        launchGame={null}
      />
    );

  const { id, name, params: userParams } = user;

  return (
    <Room
      user={{ id, name, params: userParams }}
      categorie={params?.categorie}
      gameName="defi"
      Game={Défi}
      Options={DéfiOptions}
      launchGame={launchGame}
    />
  );
}
