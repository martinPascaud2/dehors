import getUser from "@/utils/getUser";

import { launchGame } from "./gameActions";

import Room from "@/components/Room/Room";
import Grouping from "./Grouping";

export default async function GroupingPage({ params, searchParams }) {
  const user = await getUser();

  if (!user)
    return (
      <Room
        user={{ name: searchParams.guestName, multiGuest: true }}
        categorie="grouping"
        gameName="grouping"
        Game={Grouping}
        launchGame={null}
      />
    );

  const { id, name, params: userParams } = user;

  return (
    <Room
      user={{ id, name, params: userParams }}
      categorie="grouping"
      gameName="grouping"
      Game={Grouping}
      launchGame={launchGame}
    />
  );
}
