import getUser from "@/utils/getUser";

import { launchGame } from "./gameActions";

import Room from "@/components/Room/Room";
import Dobble from "./Dobble";

export default async function DobblePage({ params, searchParams }) {
  const user = await getUser();

  if (!user)
    return (
      <Room
        user={{ name: searchParams.guestName, multiGuest: true }}
        friendList={null}
        categorie={params?.categorie}
        gameName="dobble"
        Game={Dobble}
        launchGame={null}
      />
    );

  const { id, name, params: userParams } = user;

  return (
    <Room
      user={{ id, name, params: userParams }}
      categorie={params?.categorie}
      gameName="dobble"
      Game={Dobble}
      launchGame={launchGame}
    />
  );
}
