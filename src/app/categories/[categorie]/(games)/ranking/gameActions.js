"use server";

import prisma from "@/utils/prisma";

import checkPlayers from "@/utils/checkPlayers";
import { initGamersAndGuests } from "@/utils/initGamersAndGuests";
import checkViceAdminAndArrivals from "@/utils/checkViceAdminAndArrivals";
import { saveLastParams } from "@/utils/getLastParams";
import { saveAndDispatchData } from "@/components/Room/actions";
import wait from "@/utils/queue/wait";
import free from "@/utils/queue/free";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import shuffleArray from "@/utils/shuffleArray";

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
    mode: options.mode,
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
  const { newViceAdmin: viceAdmin, arrivalsOrder } =
    await checkViceAdminAndArrivals({
      roomId,
      admin: startedRoom.admin,
      viceAdmin: startedRoom.viceAdmin,
      gamersAndGuests,
    });

  await saveLastParams({ userId: adminId, options });

  const newData = {
    admin: startedRoom.admin,
    viceAdmin,
    arrivalsOrder,
    gamers: gamersAndGuests,
    options,
    phase: "preparing",
  };
  await saveAndDispatchData({ roomId, roomToken, newData });

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
  });

  return {};
}

export async function toggleTarget({ gameData, roomId, roomToken }) {
  const { target } = gameData.options;
  const newTarget = target === "players" ? "others" : "players";
  const newOptions = { ...gameData.options, target: newTarget };
  const newData = { ...gameData, options: newOptions };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function toggleTop({ gameData, roomId, roomToken }) {
  const { top } = gameData.options;
  const newTop = top === "3" ? "infinite" : "3";
  const newOptions = { ...gameData.options, top: newTop };
  const newData = { ...gameData, options: newOptions };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function addTheme({ gameData, roomId, roomToken, theme }) {
  const capTheme = capitalizeFirstLetter(theme);
  const { target } = gameData.options;

  let newPhase;
  if (target === "players") newPhase = "preturn";
  else newPhase = "preparing";

  const { gamers } = gameData;
  await Promise.all(
    gamers.map(async (gamer) => {
      if (!gamer.multiGuest) {
        await prisma.user.update({
          where: { id: gamer.id },
          data: {
            podiumTops: null,
          },
        });
      } else {
        await prisma.multiguest.upsert({
          where: { id: gamer.dataId },
          update: {
            podiumTops: null,
          },
          create: {
            id: gamer.dataId,
            podiumTops: null,
          },
        });
      }
    })
  );

  const shuffledGamers = shuffleArray(gamers);

  const objects =
    target === "others"
      ? {}
      : gameData.objects
      ? gameData.objects
      : Object.fromEntries(
          shuffledGamers.map((gamer, index) => [index + 1, gamer.name])
        );

  const newData = {
    ...gameData,
    theme: capTheme,
    phase: newPhase,
    objects,
  };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function addObject({
  objectNumber,
  gameData,
  roomId,
  roomToken,
  object,
}) {
  const capObject = capitalizeFirstLetter(object);
  const { objects } = gameData;

  const newObjects = {
    ...objects,
    [objectNumber]: capObject,
  };

  const newPhase = objectNumber === 8 ? "preturn" : "preparing";

  const newData = { ...gameData, objects: newObjects, phase: newPhase };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function goPreTurnFast({ gameData, roomId, roomToken }) {
  const newPhase = "preturn";
  const newData = { ...gameData, phase: newPhase };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function adminEditing({ type, objectKey, roomId, roomToken }) {
  const gameData = (
    await prisma.room.findFirst({
      where: { id: roomId },
      select: { gameData: true },
    })
  ).gameData;
  const newData = { ...gameData, adminEdition: { type, objectKey } };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function editValues({
  gameData,
  roomId,
  roomToken,
  type,
  newValue,
  objectKey,
}) {
  const newAdminEdition = { type: "", objectKey: {} };

  if (type === "theme") {
    const newData = {
      ...gameData,
      theme: newValue,
      adminEdition: newAdminEdition,
    };
    await saveAndDispatchData({ roomId, roomToken, newData });
  }

  if (type === "objects") {
    const { objects } = gameData;
    const newObjects = { ...objects, [objectKey]: newValue };
    const newData = {
      ...gameData,
      objects: newObjects,
      adminEdition: newAdminEdition,
    };
    await saveAndDispatchData({ roomId, roomToken, newData });
  }
}

export async function addValue({
  value,
  gameData,
  roomId,
  roomToken,
  addingPlace,
}) {
  const { objects: newObjects } = gameData;

  const keys = Object.keys(newObjects).map(Number);
  const maxKey = Math.max(...keys);

  for (let i = maxKey; i >= addingPlace; i--) {
    newObjects[i + 1] = newObjects[i];
  }
  newObjects[addingPlace] = value;

  const newData = {
    ...gameData,
    objects: newObjects,
  };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function deletePlayer({ key, gameData, roomId, roomToken }) {
  const objects = { ...gameData.objects };
  if (Object.keys(objects).length === 1) return;
  delete objects[key];
  const newObjects = Object.fromEntries(
    Object.entries(objects).map(([, value], index) => [index + 1, value])
  );
  const newData = {
    ...gameData,
    objects: newObjects,
  };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function goTurnPhase({ gameData, roomId, roomToken }) {
  const newPhase = "turn";
  const newData = { ...gameData, phase: newPhase };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

const goResultPhase = async ({ gameData, roomId, roomToken }) => {
  const { gamers } = gameData;

  const count = {};
  if (!gameData.objects) {
    const gamersNames = gamers.map((gamer) => gamer.name);
    gamersNames.forEach((name) => {
      count[name] = 0;
    });
  } else {
    Object.values(gameData.objects).forEach((object) => {
      count[object] = 0;
    });
  }

  const topValues = {
    1: 9,
    2: 6,
    3: 4,
  };

  await Promise.all(
    gamers.map(async (gamer) => {
      if (!gamer.multiGuest) {
        const gamerTop = (
          await prisma.user.findFirst({
            where: { id: gamer.id },
            select: { podiumTops: true },
          })
        ).podiumTops;
        Object.entries(gamerTop).forEach(([place, name]) => {
          count[name] = count[name] + topValues[place];
        });
      } else {
        const gamerTop = (
          await prisma.multiguest.findFirst({
            where: { id: gamer.dataId },
            select: { podiumTops: true },
          })
        ).podiumTops;
        Object.entries(gamerTop).forEach(([place, name]) => {
          count[name] = count[name] + topValues[place];
        });
      }
    })
  );

  const podium = {
    firsts: [],
    seconds: [],
    thirds: [],
  };
  const sortedCountEntries = Object.entries(count).sort((a, b) => b[1] - a[1]);
  const uniqueScores = [
    ...new Set(sortedCountEntries.map(([_, value]) => value)),
  ];
  for (const [name, score] of sortedCountEntries) {
    if (score === uniqueScores[0]) {
      podium.firsts.push(name);
    } else if (score === uniqueScores[1]) {
      podium.seconds.push(name);
    } else if (score === uniqueScores[2]) {
      podium.thirds.push(name);
    }
  }

  const newData = { ...gameData, podium, phase: "result" };
  await saveAndDispatchData({ roomId, roomToken, newData });
};

const checkTops = async ({ gameData, roomId, roomToken }) => {
  const { gamers } = gameData;
  let isLastTop = true;

  await Promise.all(
    gamers.map(async (gamer) => {
      if (!gamer.multiGuest) {
        const hasSent =
          (
            await prisma.user.findFirst({
              where: { id: gamer.id },
              select: { podiumTops: true },
            })
          ).podiumTops !== null;
        if (!hasSent) isLastTop = false;
      } else {
        const hasSent =
          (
            await prisma.multiguest.findFirst({
              where: { id: gamer.dataId },
              select: { podiumTops: true },
            })
          ).podiumTops !== null;
        if (!hasSent) isLastTop = false;
      }
    })
  );

  if (isLastTop) {
    await goResultPhase({ gameData, roomId, roomToken });
  }
};

export async function sendTops({ user, tops, gameData, roomId, roomToken }) {
  await wait({ roomId });

  if (!user.multiGuest) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        podiumTops: tops,
      },
    });
  } else {
    await prisma.multiguest.update({
      where: { id: user.dataId },
      data: {
        podiumTops: tops,
      },
    });
  }

  await checkTops({ gameData, roomId, roomToken });

  await free({ roomId });
}

export async function showResults({ gameData, roomId, roomToken }) {
  let { show: newShow } = gameData;

  if (!newShow) newShow = { thirds: true };
  else if (!newShow.seconds) newShow = { ...newShow, seconds: true };
  else if (!newShow.firsts) newShow = { ...newShow, firsts: true };

  const newData = { ...gameData, show: newShow, ended: !!newShow.firsts };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function goNewPodium({ gameData, roomId, roomToken }) {
  const newPhase = "preparing";
  const newTheme = undefined;
  const newObjects =
    gameData.options.target === "others" ? undefined : gameData.objects;
  const newAdminEdition = undefined;
  const newPodium = undefined;
  const newShow = undefined;
  const newEnded = false;

  const newData = {
    ...gameData,
    phase: newPhase,
    theme: newTheme,
    objects: newObjects,
    adminEdition: newAdminEdition,
    podium: newPodium,
    show: newShow,
    ended: newEnded,
  };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function removePodiumGamers({
  roomId,
  roomToken,
  gameData,
  onlineGamers,
  admins,
  arrivalsOrder,
}) {
  const { gamers } = gameData;

  const onlineGamersList = onlineGamers.map((gamer) => gamer.userName);
  const onlineGamersSet = new Set(onlineGamersList);

  const remainingGamers = gamers.filter((gamer) =>
    onlineGamersSet.has(gamer.name)
  );

  const newData = {
    ...gameData,
    gamers: remainingGamers,
    admin: admins.newAdmin,
    viceAdmin: admins.newViceAdmin,
    arrivalsOrder,
    //   isDeletedUser: true,
  };

  await saveAndDispatchData({ roomId, roomToken, newData });
}
