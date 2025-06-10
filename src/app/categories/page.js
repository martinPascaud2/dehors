import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { gamesRefs } from "@/assets/globals";

import pusher from "@/utils/pusher";
import prisma from "@/utils/prisma";
import getUser from "@/utils/getUser";
import getDistance from "@/utils/getDistance";
import getFriendList from "@/utils/getFriendList";
import putTmpAccountToken from "@/utils/putTmpAccountToken";

import Categories from "./Categories";

export default async function CategoriesPage() {
  const user = await getUser(); // check: only what needed
  const tmpToken = await putTmpAccountToken({ userId: user.id }); // upped for iphones
  const friendList = user?.id ? await getFriendList({ userId: user.id }) : [];

  const updateParams = async (up) => {
    "use server";
    try {
      const params =
        (await prisma.user.findFirst({ where: { id: up.userId } }))?.params ||
        {};
      const newParams = { ...params, [up.param]: up.value };
      await prisma.user.update({
        where: { id: up.userId },
        data: { params: newParams },
      });
    } catch (error) {
      console.error("updateParams error", error);
    }
  };

  const getPublicRooms = async () => {
    "use server";
    const publicRooms = {};
    await Promise.all(
      (
        await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            friends: {
              select: {
                friend: {
                  select: {
                    room: {
                      where: {
                        private: false,
                        started: false,
                        creationDate: {
                          gte: new Date(new Date() - 30 * 60 * 1000),
                        },
                      },
                    },
                    name: true,
                  },
                },
              },
            },
          },
        })
      ).friends.map(async (ref) => {
        if (ref.friend.room) {
          const friendName = ref.friend.name;
          const { id: roomId, game } = ref.friend.room;
          const { name: gameName, categorie } = gamesRefs[game];
          const roomToken = ref.friend.room.token;
          const link = `${process.env.NEXT_PUBLIC_DEHORS_URL}/categories/${categorie}/${game}?token=${roomToken}`;

          const room = await prisma.room.findUnique({
            where: { id: roomId },
            select: { admin: true, private: true },
          });
          if (!room.private && room.admin !== friendName) return;

          publicRooms[roomId] = {
            friendName,
            gameName,
            link,
          };
        }
      })
    );
    return publicRooms;
  };

  const addFriend = async ({ userLocation, friendCode }) => {
    "use server";
    const userId = user.id;

    const isLobbyCode = friendCode.includes("invitation");
    if (isLobbyCode) return { error: "lobby_code" };

    const codeParams = friendCode.split(";");
    const friendId = parseInt(codeParams[0].split("=")[1]);
    const friendMail = codeParams[1].split("=")[1];
    const friendName = codeParams[2].split("=")[1];
    const friendLocation = JSON.parse(codeParams[3]);

    const isFriendExists =
      (await prisma.user.findUnique({
        where: {
          id: friendId,
          email: friendMail,
        },
      })) !== null;
    if (!isFriendExists || !user || friendMail === user.email)
      return { error: "Utilisateur introuvable" };

    // const distance = getDistance({
    //   first: userLocation,
    //   second: friendLocation,
    // });
    // if (distance > 500) return { error: "Vous êtes trop loin !" };

    const friendList = await getFriendList({ userId: user.id });
    const isAlreadyFriend = friendList.some(
      (friend) => friend.friendId === friendId
    );
    if (isAlreadyFriend) return { error: `${friendName} est votre ami !` };

    try {
      await prisma.friend.create({
        data: {
          user: { connect: { id: userId } },
          friend: { connect: { id: friendId } },
          customName: friendName,
        },
      });
      await prisma.friend.create({
        data: {
          user: { connect: { id: friendId } },
          friend: { connect: { id: userId } },
          customName: user.name,
        },
      });

      await pusher.trigger(`user-${user.email}`, "user-event", {
        message: `${friendName} ajouté dans vos amis !`,
      });
      await pusher.trigger(`user-${friendMail}`, "user-event", {
        message: `${user.name} ajouté dans vos amis !`,
      });

      revalidatePath("/categories");
    } catch (e) {
      return { error: "Une erreur s'est produite lors de l'ajout" };
    }

    return {};
  };

  const deleteFriend = async ({ userId, friendId }) => {
    "use server";
    await prisma.friend.deleteMany({
      where: { userId: userId, friendId: friendId },
    });
    await prisma.friend.deleteMany({
      where: { userId: friendId, friendId: userId },
    });
    revalidatePath("/categories");
  };

  const updateLastCP = async ({ userId, out }) => {
    "use server";
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        lastControlPanel: !out ? new Date() : null,
      },
    });
  };

  const getCurrentGame = async () => {
    "use server";
    const currentRoomId = (
      await prisma.user.findFirst({
        where: { id: user.id },
        select: { roomId: true },
      })
    ).roomId;

    if (!currentRoomId) {
      return null;
    } else {
      const {
        creationDate,
        admin,
        game,
        token: roomToken,
        options,
        arrivalsOrder,
        started,
      } = await prisma.room.findFirst({
        where: { id: currentRoomId },
        select: {
          creationDate: true,
          admin: true,
          game: true,
          token: true,
          options: true,
          arrivalsOrder: true,
          started: true,
        },
      });

      const creationAgeInMn =
        (new Date().getTime() - creationDate.getTime()) / (1000 * 60);

      if (arrivalsOrder.length <= 1 || (!started && creationAgeInMn > 30))
        return null;

      const { categorie } = gamesRefs[game];
      const path = `/categories/${categorie}/${game}?token=${roomToken}`;
      return { admin, game, path, mode: options?.mode };
    }
  };

  const signOut = async () => {
    "use server";
    cookies().delete("SG_token");
  };

  // check TEST
  // const ip = "78.243.220.125";
  // const response = await fetch(
  //   `https://ipgeolocation.abstractapi.com/v1/?api_key=50243c1d69714bcbb90a001d82638cc0&ip_address=${ip}`
  // );
  // const data = await response.json();
  // console.log(data);

  return (
    <>
      <Categories
        user={user}
        tmpToken={tmpToken}
        updateParams={updateParams}
        friendList={friendList}
        addFriend={addFriend}
        deleteFriend={deleteFriend}
        getPublicRooms={getPublicRooms}
        getCurrentGame={getCurrentGame}
        updateLastCP={updateLastCP}
        signOut={signOut}
      />
    </>
  );
}
