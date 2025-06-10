import getUser from "@/utils/getUser";

import PostGame from "./PostGame";

import { postGamesList } from "@/assets/globals";

export default async function PostGamePage() {
  const user = await getUser();

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
                gte: TEN_DAYS_AGO,
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

  return (
    <div className="absolute h-full w-full z-0">
      <PostGame user={user} postGames={postGamesSortedObject} />
    </div>
  );
}
