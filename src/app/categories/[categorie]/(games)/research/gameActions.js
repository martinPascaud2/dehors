"use server";

import checkPlayers from "@/utils/checkPlayers";
import { initGamersAndGuests } from "@/utils/initGamersAndGuests";
import checkViceAdminAndArrivals from "@/utils/checkViceAdminAndArrivals";
import { saveLastParams } from "@/utils/getLastParams";
import { saveAndDispatchData, saveData } from "@/components/Room/actions";
import free from "@/utils/queue/free";
import wait from "@/utils/queue/wait";

const initPositions = async ({ gamers }) => {
  await Promise.all(
    gamers.map(async (gamer) => {
      if (!gamer.multiGuest) {
        await prisma.user.update({
          where: { id: gamer.id },
          data: { huntingPosition: null },
        });
      } else {
        await prisma.multiguest.upsert({
          where: { id: gamer.dataId },
          update: { huntingPosition: null },
          create: {
            id: gamer.dataId,
            huntingPosition: null,
          },
        });
      }
    })
  );
};

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
    await initPositions({ gamers: gamersAndGuests });

    newData = {
      admin: startedRoom.admin,
      viceAdmin,
      arrivalsOrder,
      gamers: gamersAndGuests,
      options,
      positions,
      phase: "preparing",
    };
  }

  await saveAndDispatchData({ roomId, roomToken, newData });
  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
  });

  return {};
}

export async function proposeTeams({ ffaTeams, vsTeams, roomId, roomToken }) {
  const roomData = (
    await prisma.room.findFirst({
      where: { id: roomId },
      select: { gameData: true },
    })
  ).gameData;

  const { gamers, admin, options } = roomData;

  const waitingForGamers = gamers
    .reduce((list, gamer) => {
      if (gamer.name === admin) return list;
      list.push(gamer.name);
      return list;
    }, [])
    .sort();

  const distribution = options.distribution;
  let proposed;

  if (distribution === "FFA") {
    const { hunters, hunteds, undefineds } = ffaTeams;

    const proposedHunters = [...hunters];
    const proposedHunteds = [...hunteds, ...undefineds];

    proposed = { hunters: proposedHunters, hunteds: proposedHunteds };
  } else if (distribution === "VS") {
    const { red, blue } = vsTeams;

    const proposedRedHunters = [...red.hunters];
    const proposedRedHunteds = [...red.hunteds, ...red.undefineds];
    const proposedBlueHunters = [...blue.hunters];
    const proposedBlueHunteds = [...blue.hunteds, ...blue.undefineds];

    proposed = {
      red: {
        hunters: proposedRedHunters,
        hunteds: proposedRedHunteds,
      },
      blue: {
        hunters: proposedBlueHunters,
        hunteds: proposedBlueHunteds,
      },
    };
  }

  const newData = {
    ...roomData,
    proposed,
    phase: "proposing",
    waitingForGamers,
    acceptedGamers: [admin],
    decliners: [],
  };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function accept({ userName, roomId, roomToken }) {
  await wait({ roomId });

  const roomData = (
    await prisma.room.findFirst({
      where: { id: roomId },
      select: { gameData: true },
    })
  ).gameData;

  if (roomData.acceptedGamers.some((accepter) => accepter === userName)) return;

  const newAcceptedGamers = roomData.acceptedGamers || [];
  newAcceptedGamers.push(userName);

  const newWaitingForGamers = roomData.waitingForGamers.filter(
    (gamer) => gamer !== userName
  );

  const newDecliners = roomData.decliners.filter((gamer) => gamer !== userName);

  const newData = {
    ...roomData,
    decliners: newDecliners,
    waitingForGamers: newWaitingForGamers,
    acceptedGamers: newAcceptedGamers,
  };

  await saveAndDispatchData({ roomId, roomToken, newData });
  await free({ roomId });
}

export async function decline({ userName, roomId, roomToken }) {
  await wait({ roomId });

  const roomData = (
    await prisma.room.findFirst({
      where: { id: roomId },
      select: { gameData: true },
    })
  ).gameData;

  if (roomData.decliners.some((decliner) => decliner === userName)) return;

  const newDecliners = roomData.decliners || [];
  newDecliners.push(userName);

  const newWaitingForGamers = roomData.waitingForGamers.filter(
    (gamer) => gamer !== userName
  );

  const newAcceptedGamers = roomData.acceptedGamers.filter(
    (gamer) => gamer !== userName
  );

  const newData = {
    ...roomData,
    decliners: newDecliners,
    waitingForGamers: newWaitingForGamers,
    acceptedGamers: newAcceptedGamers,
  };

  await saveAndDispatchData({ roomId, roomToken, newData });
  await free({ roomId });
}

export async function backToPreparing({ roomId, roomToken }) {
  const roomData = (
    await prisma.room.findFirst({
      where: { id: roomId },
      select: { gameData: true },
    })
  ).gameData;

  const newData = { ...roomData, phase: "preparing", keepTeams: true };

  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function goToHidding({ roomId, roomToken }) {
  const roomData = (
    await prisma.room.findFirst({
      where: { id: roomId },
      select: { gameData: true },
    })
  ).gameData;

  const startDate = Date.now() + 120000; // 2 mn
  // const startDate = Date.now() + 90000; // 1,5 mn
  // const startDate = Date.now() + 7000; // 7s

  const newData = { ...roomData, startDate, phase: "hidding" };

  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function goToPlaying({ roomId, roomToken }) {
  const roomData = (
    await prisma.room.findFirst({
      where: { id: roomId },
      select: { gameData: true },
    })
  ).gameData;

  const newData = { ...roomData, phase: "playing" };

  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function sendPosition({ roomId, user, newPosition }) {
  await wait({ roomId });

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
          latitude: huntingPosition ? huntingPosition[0] : null,
          longitude: huntingPosition ? huntingPosition[1] : null,
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
          latitude: huntingPosition ? huntingPosition[0] : null,
          longitude: huntingPosition ? huntingPosition[1] : null,
        });
      }
    })
  );

  const newData = { ...roomData, positions: allPositions };
  await saveData({ roomId, newData });
  await free({ roomId });
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

export async function goNewHunting({
  gameData,
  roomId,
  roomToken,
  newOptions = null,
  areTeamKept = true,
}) {
  const newPhase = "preparing";
  const newAcceptedGamers = [];
  const newDecliners = [];
  const { gamers } = gameData;
  const newPositions = [];

  await initPositions({ gamers });

  gamers.forEach((gamer) => {
    newPositions.push({ name: gamer.name, latitude: null, longitude: null });
  });
  const newProposed = areTeamKept ? gameData.proposed : undefined;
  const newWaitingForGamers = [];
  const newKeepTeams = !!gameData.proposed && areTeamKept; // check if keepTeams is needed
  const newEnded = false;

  const newData = {
    ...gameData,
    phase: newPhase,
    acceptedGamers: newAcceptedGamers,
    decliners: newDecliners,
    positions: newPositions,
    proposed: newProposed,
    waitingForGamers: newWaitingForGamers,
    keepTeams: newKeepTeams,
    options: newOptions ? newOptions : gameData.options,
    ended: newEnded,
  };
  await saveAndDispatchData({ roomId, roomToken, newData });
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
