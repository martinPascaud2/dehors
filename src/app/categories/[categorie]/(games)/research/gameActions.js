"use server";

import checkPlayers from "@/utils/checkPlayers";
import { initGamersAndGuests } from "@/utils/initGamersAndGuests";
import checkViceAdminAndArrivals from "@/utils/checkViceAdminAndArrivals";
import { saveLastParams } from "@/utils/getLastParams";
import { saveAndDispatchData, saveData } from "@/components/Room/actions";

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

  const positions = [];
  gamersAndGuests.forEach((gamer) => {
    positions.push({ name: gamer.name, latitude: null, longitude: null });
  });

  let newData;
  if (options.mode === "Hunted") {
    newData = {
      admin: startedRoom.admin,
      viceAdmin,
      arrivalsOrder,
      gamers: gamersAndGuests,
      options,
      positions,
    };
  }

  await saveAndDispatchData({ roomId, roomToken, newData });
  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
  });

  return {};
}

export async function sendPosition({ roomId, user, newPosition }) {
  if (user.multiGuest) {
    await prisma.multiguest.upsert({
      where: { id: user.dataId },
      update: { huntingPosition: newPosition },
      create: {
        id: user.dataId,
        huntingPosition: newPosition,
      },
    });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { huntingPosition: newPosition },
    });
  }

  const roomData = (
    await prisma.room.findFirst({
      where: { id: roomId },
      select: { gameData: true },
    })
  ).gameData;

  const { gamers } = roomData;

  const allPositions = [];
  await Promise.all(
    gamers.map(async (gamer) => {
      if (!gamer.multiGuest) {
        const huntingPosition = (
          await prisma.user.findFirst({
            where: { id: gamer.id },
            select: { huntingPosition: true },
          })
        ).huntingPosition;
        allPositions.push({
          name: gamer.name,
          latitude: huntingPosition[0],
          longitude: huntingPosition[1],
        });
      } else {
        const huntingPosition = (
          await prisma.multiguest.findFirst({
            where: { id: gamer.dataId },
            select: { huntingPosition: true },
          })
        ).huntingPosition;
        allPositions.push({
          name: gamer.name,
          latitude: huntingPosition[0],
          longitude: huntingPosition[1],
        });
      }
    })
  );

  const newData = { ...roomData, positions: allPositions };
  await saveData({ roomId, newData });
}

export async function getPositions({ roomId }) {
  let positions;
  try {
    const roomData = (
      await prisma.room.findFirst({
        where: { id: roomId },
        select: { gameData: true },
      })
    ).gameData;
    positions = roomData.positions;
  } catch (error) {
    console.error("getPositions error:", error);
  } finally {
    await prisma.$disconnect();
  }
  return positions;
}

export async function removeStandardGamers({
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

  const deletedGamersNames = gameData.deletedGamersNames || [];
  const notHereGamersNames = gamers
    .filter((gamer) => !onlineGamersSet.has(gamer.name))
    .map((gamer) => gamer.name);
  const newDeletedGamersNames = [...deletedGamersNames, ...notHereGamersNames];

  const newData = {
    ...gameData,
    gamers: remainingGamers,
    admin: admins.newAdmin,
    viceAdmin: admins.newViceAdmin,
    arrivalsOrder,
    //   isDeletedUser: true,
    deletedGamersNames: newDeletedGamersNames,
  };

  await saveAndDispatchData({ roomId, roomToken, newData });
}
