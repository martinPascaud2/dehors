"use server";

import prisma from "@/utils/prisma";
import pusher from "@/utils/pusher";

import { saveAndDispatchData } from "@/components/Room/actions";
import { initGamersAndGuests } from "@/utils/initGamersAndGuests";
import checkPlayers from "@/utils/checkPlayers";

export async function launchGame({
  roomId,
  roomToken,
  adminId,
  gamers,
  guests,
  multiGuests,
  options,
}) {
  const { error: playersError } = checkPlayers({
    mode: "actionouverite",
    gamers,
    guests,
    multiGuests,
  });
  if (playersError) return { error: playersError };

  const startedRoom = await prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      started: true,
    },
  });

  const gamersAndGuests = initGamersAndGuests({
    adminId,
    gamers: startedRoom.gamers,
    guests,
    multiGuests,
  });

  const newData = {
    admin: startedRoom.admin,
    viceAdmin: startedRoom.viceAdmin,
    activePlayer: gamersAndGuests[0],
    gamers: gamersAndGuests,
    card: null,
  };
  await saveAndDispatchData({ roomId, roomToken, newData });

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
  });

  return {};
}

const getNextGamer = (gamerList, activePlayer) => {
  const index = gamerList.findIndex(
    (gamer) => gamer.id === activePlayer.id && gamer.name === activePlayer.name
  );
  const nextIndex = (index + 1) % gamerList.length;
  const nextGamer = gamerList[nextIndex];
  return nextGamer;
};

const getRandomCard = async (choice, actionRemain, veriteRemain) => {
  const choicedList = choice === "action" ? actionRemain : veriteRemain;
  const randomIndex =
    choicedList[Math.floor(Math.random() * choicedList.length)] || 1;

  const randomCard = await prisma.actionouverite.findFirst({
    where: {
      id: randomIndex,
    },
  });

  return randomCard;
};

const getPackages = async () => {
  const actionPackage = (
    await prisma.actionouverite.findMany({
      where: {
        type: "action",
      },
      select: {
        id: true,
      },
    })
  ).map((card) => card.id);

  const veritePackage = (
    await prisma.actionouverite.findMany({
      where: {
        type: "vérité",
      },
      select: {
        id: true,
      },
    })
  ).map((card) => card.id);

  return { actionPackage, veritePackage };
};

const removeAlreadyPlayed = async (gameData, actionPackage, veritePackage) => {
  const allAlreadyUnflat = [];
  await Promise.all(
    gameData.gamers.map(async (gamer) => {
      const gamerAlready =
        (
          await prisma.user.findFirst({
            where: {
              id: gamer.id,
            },
            select: {
              alreadyActionouverite: true,
            },
          })
        )?.alreadyActionouverite?.idList || [];
      allAlreadyUnflat.push(gamerAlready);
    })
  );
  const allAlreadyFlat = allAlreadyUnflat.flat();

  const actionRemainSET = new Set(actionPackage);
  const veriteRemainSET = new Set(veritePackage);
  const actionSecondSET = new Set(actionPackage);
  const veriteSecondSET = new Set(veritePackage);

  allAlreadyFlat.map((already) => {
    actionRemainSET.delete(already);
    veriteRemainSET.delete(already);
  });
  const actionRemain = [...actionRemainSET];
  const veriteRemain = [...veriteRemainSET];

  actionRemain.map((action) => {
    actionSecondSET.delete(action);
  });
  veriteRemain.map((verite) => {
    veriteSecondSET.delete(verite);
  });
  const actionSecond = [...actionSecondSET];
  const veriteSecond = [...veriteSecondSET];

  return { actionRemain, veriteRemain, actionSecond, veriteSecond };
};

const updateAlreadys = async (gamers, cardId) => {
  await Promise.all(
    gamers.map(async (gamer) => {
      const oldAlready =
        (
          await prisma.user.findFirst({
            where: {
              id: gamer.id,
            },
            select: {
              alreadyActionouverite: true,
            },
          })
        )?.alreadyActionouverite?.idList || [];

      const newAlready = [...oldAlready, cardId];

      await prisma.user.update({
        where: {
          id: gamer.id,
        },
        data: {
          alreadyActionouverite: { idList: newAlready },
        },
      });
    })
  );
};

const getNextRemain = async (cardType, gamers, secondRemain) => {
  const allTypedCards = (
    await prisma.actionouverite.findMany({
      where: {
        type: cardType,
      },
      select: {
        id: true,
      },
    })
  ).map((card) => card.id);

  await Promise.all(
    gamers.map(async (gamer) => {
      const alreadyIdList =
        (
          await prisma.user.findFirst({
            where: {
              id: gamer.id,
            },
            select: {
              alreadyActionouverite: true,
            },
          })
        )?.alreadyActionouverite?.idList || [];

      const alreadyIdListSET = new Set(alreadyIdList);
      allTypedCards.map((typedCard) => alreadyIdListSET.delete(typedCard));

      const newAlready = [...alreadyIdListSET];
      await prisma.user.update({
        where: {
          id: gamer.id,
        },
        data: {
          alreadyActionouverite: newAlready,
        },
      });
    })
  );

  if (secondRemain.length) {
    const newRemain = [...secondRemain];
    const newSecond = [];
    return { newRemain, secondRemain: newSecond };
  } else {
    const newRemain = (
      await prisma.actionouverite.findMany({
        where: {
          type: cardType,
        },
        select: {
          id: true,
        },
      })
    ).map((card) => card.id);
    return { newRemain, secondRemain };
  }
};

export async function triggerGameEvent(roomId, roomToken, gameData, choice) {
  let actionRemain;
  let veriteRemain;
  let actionSecond = gameData?.secondRemain?.action || [];
  let veriteSecond = gameData?.secondRemain?.verite || [];
  const registeredGamers = gameData.gamers.filter(
    (gamer) => gamer.guest === false && gamer.multiGuest === false
  );

  if (!gameData.remain) {
    const { actionPackage, veritePackage } = await getPackages();

    ({ actionRemain, veriteRemain, actionSecond, veriteSecond } =
      await removeAlreadyPlayed(gameData, actionPackage, veritePackage));
  } else {
    actionRemain = gameData.remain.actionRemain;
    veriteRemain = gameData.remain.veriteRemain;
  }

  const randomCard = await getRandomCard(choice, actionRemain, veriteRemain);

  await updateAlreadys(registeredGamers, randomCard.id);

  const newActivePlayer = getNextGamer(gameData.gamers, gameData.activePlayer);

  if (choice === "action") {
    actionRemain = actionRemain.filter((action) => action !== randomCard.id);
  } else {
    veriteRemain = veriteRemain.filter((verite) => verite !== randomCard.id);
  }

  if (!actionRemain.length) {
    ({ newRemain: actionRemain, secondRemain: actionSecond } =
      await getNextRemain("action", registeredGamers, actionSecond));
  }
  if (!veriteRemain.length) {
    ({ newRemain: veriteRemain, secondRemain: veriteSecond } =
      await getNextRemain("vérité", registeredGamers, veriteSecond));
  }

  //check
  const newData = (
    await prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        gameData: {
          ...gameData,
          activePlayer: newActivePlayer,
          card: randomCard,
          remain: { actionRemain, veriteRemain },
          secondRemain: { action: actionSecond, verite: veriteSecond },
        },
      },
    })
  ).gameData;

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: newData,
  });
}
