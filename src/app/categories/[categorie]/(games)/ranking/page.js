import getUser from "@/utils/getUser";

import { launchGame } from "./gameActions";

import Room from "@/components/Room/Room";
import Ranking from "./Ranking";
import RankingOptions from "./Options";

export default async function RankingPage({ params, searchParams }) {
  const user = await getUser();

  if (!user)
    return (
      <Room
        user={{ name: searchParams.guestName, multiGuest: true }}
        categorie={params?.categorie}
        gameName="ranking"
        Game={Ranking}
        Options={RankingOptions}
        launchGame={null}
      />
    );

  const { id, name, params: userParams } = user;

  return (
    <Room
      user={{ id, name, params: userParams }}
      categorie={params?.categorie}
      gameName="ranking"
      Game={Ranking}
      Options={RankingOptions}
      launchGame={launchGame}
    />
  );
}
