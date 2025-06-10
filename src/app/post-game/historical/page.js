import getUser from "@/utils/getUser";

import Historical from "./Historical";

import { postGamesList } from "@/assets/globals";

export default async function HistoricalPage() {
  const user = await getUser();
  const userParams = user.params;
  const barsSizes = {
    bottom: userParams?.bottomBarSize || 8,
    top: userParams?.topBarSize || 8,
  };

  const TEN_DAYS_AGO = new Date();
  TEN_DAYS_AGO.setDate(TEN_DAYS_AGO.getDate() - 10);
  const postGames = (
    await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        postGames: {
          select: {
            postGame: true,
          },
          where: {
            postGame: {
              createdAt: {
                lte: TEN_DAYS_AGO,
              },
            },
          },
        },
      },
    })
  )?.postGames;

  const postGamesSortedObject = {};
  postGamesList.forEach((pg) => {
    postGamesSortedObject[pg.game] = [];
  });
  postGames.forEach((pg) => {
    const { postGame } = pg;
    postGamesSortedObject[postGame.gameName].push(postGame);
  });

  return <Historical barsSizes={barsSizes} postGames={postGamesSortedObject} />;
}
