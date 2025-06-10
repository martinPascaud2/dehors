"use server";

import pusher from "@/utils/pusher";
import prisma from "@/utils/prisma";

import { saveAndDispatchData } from "@/components/Room/actions";
import checkPlayers from "@/utils/checkPlayers";
import { initGamersAndGuests } from "@/utils/initGamersAndGuests";
import checkViceAdminAndArrivals from "@/utils/checkViceAdminAndArrivals";

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
    mode: "dobble",
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
      gameData: {},
    },
  });

  const gamersAndGuests = initGamersAndGuests({
    adminId,
    gamers: startedRoom.gamers,
    guests,
    multiGuests,
  });
  const { newViceAdmin: viceAdmin, arrivalsOrder } =
    await checkViceAdminAndArrivals({
      roomId,
      admin: startedRoom.admin,
      viceAdmin: startedRoom.viceAdmin,
      gamersAndGuests,
    });

  if (gamersAndGuests.some((player) => player.guest))
    return { error: "Ce jeu est incompatible avec les guests monoscreen." }; //check

  const newData = {
    admin: startedRoom.admin,
    viceAdmin,
    arrivalsOrder,
    gamers: gamersAndGuests,
    recRounds: {},
    count: {},
  };
  await saveAndDispatchData({ roomId, roomToken, newData });

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
  });

  return {};
}

const getIconsKeys = ({ imageLength }) => {
  const randomIcons = [];
  let randomIconsNumber = 0;
  const sizesArray = [10, 15, 15, 20, 20, 20, 20, 25, 35, 35];
  let randomSizes = sizesArray.sort(() => Math.random() - 0.5);

  while (randomIconsNumber <= 9) {
    const randomKey = Math.floor(Math.random() * imageLength);
    if (randomIcons.some((icon) => icon.key === randomKey)) continue;

    const randomSize = randomSizes[randomIconsNumber];
    const randomRotation = Math.floor(Math.random() * 360);
    randomIcons.push({
      key: randomKey,
      size: randomSize,
      rotation: randomRotation,
    });
    randomIconsNumber++;
  }

  const sameKey =
    randomIcons[Math.floor(Math.random() * randomIcons.length)].key;

  const onlyWithOne = [];
  randomIconsNumber = 0;
  randomSizes = sizesArray.sort(() => Math.random() - 0.5);
  while (randomIconsNumber <= 8) {
    const randomKey = Math.floor(Math.random() * imageLength);
    if (
      onlyWithOne.some((icon) => icon.key === randomKey) ||
      randomIcons.some((icon) => icon.key === randomKey) ||
      randomKey === sameKey
    )
      continue;

    const randomSize = randomSizes[randomIconsNumber];
    const randomRotation = Math.floor(Math.random() * 360);
    onlyWithOne.push({
      key: randomKey,
      size: randomSize,
      rotation: randomRotation,
    });
    randomIconsNumber++;
  }
  const randomSameIndex = Math.floor(Math.random() * onlyWithOne.length);
  onlyWithOne.splice(randomSameIndex, 0, {
    key: sameKey,
    size: randomSizes[9],
    rotation: Math.floor(Math.random() * 360),
  });

  return { randomIcons, onlyWithOne, sameKey };
};

export async function goFirstRound({
  roomId,
  roomToken,
  gameData,
  imageLength,
}) {
  const { randomIcons, onlyWithOne, sameKey } = getIconsKeys({ imageLength });

  const newData = {
    ...gameData,
    round: {
      number: 1,
      randomIcons,
      onlyWithOne,
      sameKey,
    },
    rotation: { top: Math.random() < 0.5, bot: Math.random() < 0.5 },
  };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function serverSucceed({
  roomId,
  roomToken,
  gameData,
  imageLength,
  roundNumber,
  user,
}) {
  const roomData = (await prisma.room.findFirst({ where: { id: roomId } }))
    .gameData;
  const { id: userId, name: userName } = user;

  if (
    (roomData.recRounds && roomData.recRounds[roundNumber]?.winner) ||
    roomData.round?.number > roundNumber
  )
    return;

  const recRounds = roomData.recRounds || {};
  let newRecRounds = {};
  if (!recRounds[roundNumber]) {
    newRecRounds = {
      ...recRounds,
      [roundNumber]: { winner: userId, failersList: [] },
    };
  } else {
    const round = recRounds[roundNumber];
    const updatedRound = { ...round, winner: userId };
    newRecRounds = { ...recRounds, [roundNumber]: updatedRound };
  }

  const { randomIcons, onlyWithOne, sameKey } = getIconsKeys({ imageLength });
  const newRound = {
    number: roundNumber + 1,
    randomIcons,
    onlyWithOne,
    sameKey,
  };

  const count = roomData.count || {};
  const newPlayerCount = (count[userName] || 0) + 1;

  const newData = {
    ...gameData,
    ...roomData, //check
    recRounds: newRecRounds,
    round: newRound,
    count: { ...count, [userName]: newPlayerCount },
    rotation: { top: Math.random() < 0.5, bot: Math.random() < 0.5 },
  };

  await saveAndDispatchData({ roomId, roomToken, newData });
}

const goNewLoosersRound = async ({
  roomId,
  roomToken,
  roomData,
  roundNumber,
  imageLength,
}) => {
  const { randomIcons, onlyWithOne, sameKey } = getIconsKeys({ imageLength });

  const newData = {
    ...roomData,
    round: {
      number: roundNumber + 1,
      randomIcons,
      onlyWithOne,
      sameKey,
    },
    rotation: { top: Math.random() < 0.5, bot: Math.random() < 0.5 },
  };

  await saveAndDispatchData({ roomId, roomToken, newData });
};

export async function serverFail({
  roomId,
  roomToken,
  roundNumber,
  imageLength,
  userName,
}) {
  const roomData = (await prisma.room.findFirst({ where: { id: roomId } }))
    .gameData;
  if (roomData.round.number !== roundNumber) return;

  const recRounds = roomData.recRounds || {};
  let newRecRounds = {};
  if (!recRounds[roundNumber]) {
    newRecRounds = {
      ...recRounds,
      [roundNumber]: { failersList: [userName] },
    };
  } else {
    const round = recRounds[roundNumber];
    const failersList = round.failersList || [];
    const updatedRound = {
      ...round,
      failersList: [...failersList, userName],
    };
    if (updatedRound.failersList.length === roomData.gamers.length) {
      await goNewLoosersRound({
        roomId,
        roomToken,
        roomData,
        roundNumber,
        imageLength,
      });
      return;
    }
    newRecRounds = { ...recRounds, [roundNumber]: updatedRound };
  }

  const newData = { ...roomData, recRounds: newRecRounds };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function removeGamers({
  roomId,
  roomToken,
  gameData,
  onlineGamers,
  imageLength,
  admins,
  arrivalsOrder,
}) {
  const { gamers, count, recRounds } = gameData;
  const roundNumber = gameData.round?.number || 0;

  const onlineGamersList = onlineGamers.map((gamer) => gamer.userName);
  const onlineGamersSet = new Set(onlineGamersList);

  const remainingGamers = gamers.filter((gamer) =>
    onlineGamersSet.has(gamer.name)
  );

  const newCount = Object.fromEntries(
    Object.entries(count).filter(([userName]) => onlineGamersSet.has(userName))
  );

  const newRecrounds = Object.fromEntries(
    Object.entries(recRounds).map(([roundNumber, data]) => [
      roundNumber,
      {
        failersList: data.failersList.filter((failer) =>
          onlineGamersSet.has(failer)
        ),
        winner: data.winner,
      },
    ])
  );

  const { randomIcons, onlyWithOne, sameKey } = getIconsKeys({ imageLength });
  const newRound = {
    number: roundNumber + 1,
    randomIcons,
    onlyWithOne,
    sameKey,
  };
  const newRotation = { top: Math.random() < 0.5, bot: Math.random() < 0.5 };

  const ended = remainingGamers.length < 2;

  const newData = {
    ...gameData,
    gamers: remainingGamers,
    recRounds: newRecrounds,
    count: newCount,
    round: newRound,
    rotation: newRotation,
    ended,
    admin: admins.newAdmin,
    viceAdmin: admins.newViceAdmin,
    arrivalsOrder,
  };

  await saveAndDispatchData({ roomId, roomToken, newData });
}
