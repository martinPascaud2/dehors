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

  const { proposed } = roomData;
  const distribution = roomData.options.distribution;

  let teams;
  if (distribution === "FFA") {
    teams = {
      hunters: proposed.hunters,
      hunteds: proposed.hunteds.map((hunted) => ({
        name: hunted,
        alive: true,
      })),
    };
  } else if (distribution === "VS") {
    // console.log("proposed", proposed);
    const { red, blue } = proposed;
    const redHunters = red.hunters;
    const redHunteds = red.hunteds.map((hunted) => ({
      name: hunted,
      alive: true,
    }));
    const blueHunters = blue.hunters;
    const blueHunteds = blue.hunteds.map((hunted) => ({
      name: hunted,
      alive: true,
    }));
    teams = {
      red: { hunters: redHunters, hunteds: redHunteds },
      blue: { hunters: blueHunters, hunteds: blueHunteds },
    };
  }

  const startDate = Date.now() + 120000; // 2 mn

  const newData = { ...roomData, startDate, teams, phase: "hidding" };

  // console.log("newData", newData);

  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function goToPlaying({ roomId, roomToken }) {
  await wait({ roomId });

  const roomData = (
    await prisma.room.findFirst({
      where: { id: roomId },
      select: { gameData: true },
    })
  ).gameData;

  const { phase } = roomData;

  if (phase !== "hidding") {
    await free({ roomId });
    return;
  }

  const { geolocation, distribution } = roomData.options;

  if (distribution === "FFA") {
    const lastLocation = 0;

    const nextLocation =
      geolocation === "automatic"
        ? Date.now() + roomData.options.countDownTime
        : null; // null for first manual

    const newData = {
      ...roomData,
      phase: "playing",
      lastLocation,
      nextLocation,
    };

    await saveAndDispatchData({ roomId, roomToken, newData });
    await free({ roomId });
  } else if (distribution === "VS") {
    const lastLocations = { red: 0, blue: 0 };

    const nextLocations =
      geolocation === "automatic"
        ? {
            red: Date.now() + roomData.options.countDownTime,
            blue: Date.now() + roomData.options.countDownTime,
          }
        : { red: null, blue: null }; // null for first manual

    const newData = {
      ...roomData,
      phase: "playing",
      lastLocations,
      nextLocations,
    };

    await saveAndDispatchData({ roomId, roomToken, newData });
    await free({ roomId });
  }
}

export async function sendPosition({
  roomId,
  user,
  newPosition,
  isHidding = false,
  team,
}) {
  await wait({ roomId });

  const positionUpdatePromise = user.multiGuest
    ? prisma.multiguest.upsert({
        where: { id: user.dataId },
        update: { huntingPosition: newPosition },
        create: {
          id: user.dataId,
          huntingPosition: newPosition,
        },
      })
    : prisma.user.update({
        where: { id: user.id },
        data: { huntingPosition: newPosition },
      });

  const [roomRecord] = await Promise.all([
    prisma.room.findFirst({
      where: { id: roomId },
      select: { gameData: true },
    }),
    positionUpdatePromise,
  ]);

  const roomData = roomRecord.gameData;
  const { gamers, options, teams } = roomData;
  const { distribution } = options;

  const userIds = gamers.filter((g) => !g.multiGuest).map((g) => g.id);
  const guestIds = gamers.filter((g) => g.multiGuest).map((g) => g.dataId);

  const [users, guests] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, huntingPosition: true },
    }),
    prisma.multiguest.findMany({
      where: { id: { in: guestIds } },
      select: { id: true, huntingPosition: true },
    }),
  ]);

  const userMap = new Map(users.map((u) => [u.id, u.huntingPosition]));
  const guestMap = new Map(guests.map((g) => [g.id, g.huntingPosition]));

  let allPositions;
  if (distribution === "FFA") {
    const hunterSet = new Set(teams.hunters);
    const huntedMap = new Map(
      teams.hunteds.map((hunted) => [hunted.name, hunted.alive])
    );

    allPositions = gamers.map((gamer) => {
      const isGuest = gamer.multiGuest;
      const huntingPosition = isGuest
        ? guestMap.get(gamer.dataId)
        : userMap.get(gamer.id);

      let role, alive;
      if (hunterSet.has(gamer.name)) {
        role = "hunter";
      } else {
        role = "hunted";
        alive = huntedMap.get(gamer.name);
      }

      return {
        name: gamer.name,
        latitude: huntingPosition?.[0] ?? null,
        longitude: huntingPosition?.[1] ?? null,
        role,
        alive,
      };
    });
  } else if (distribution === "VS") {
    const redHunterSet = new Set(teams.red.hunters);
    const blueHunterSet = new Set(teams.blue.hunters);
    const redHuntedMap = new Map(
      teams.red.hunteds.map((hunted) => [hunted.name, hunted.alive])
    );
    const blueHuntedMap = new Map(
      teams.blue.hunteds.map((hunted) => [hunted.name, hunted.alive])
    );

    allPositions = { red: [], blue: [] };
    gamers.forEach((gamer) => {
      let role, alive, team;
      if (redHunterSet.has(gamer.name)) {
        role = "hunter";
        team = "red";
      } else if (redHuntedMap.has(gamer.name)) {
        role = "hunted";
        team = "red";
        alive = redHuntedMap.get(gamer.name);
      } else if (blueHunterSet.has(gamer.name)) {
        role = "hunter";
        team = "blue";
      } else {
        role = "hunted";
        team = "blue";
        alive = blueHuntedMap.get(gamer.name);
      }

      const isGuest = gamer.multiGuest;
      const huntingPosition = isGuest
        ? guestMap.get(gamer.dataId)
        : userMap.get(gamer.id);

      allPositions[team].push({
        name: gamer.name,
        latitude: huntingPosition?.[0] ?? null,
        longitude: huntingPosition?.[1] ?? null,
        role,
        alive,
      });

      // return {
      //   name: gamer.name,
      //   latitude: huntingPosition?.[0] ?? null,
      //   longitude: huntingPosition?.[1] ?? null,
      //   role,
      //   alive,
      // };
    });

    // allPositions = gamers.map((gamer) => {
    //   const isGuest = gamer.multiGuest;
    //   const huntingPosition = isGuest
    //     ? guestMap.get(gamer.dataId)
    //     : userMap.get(gamer.id);

    //   let role, alive;
    //     if (hunterSet.has(gamer.name)) {
    //       role = "hunter";
    //     } else {
    //       role = "hunted";
    //       alive = huntedMap.get(gamer.name);
    //     }

    //   return {
    //     name: gamer.name,
    //     latitude: huntingPosition?.[0] ?? null,
    //     longitude: huntingPosition?.[1] ?? null,
    //     role,
    //     alive,
    //   };
    // });
  }

  if (distribution === "FFA") {
    const { lastLocation, lastPositions } = roomData;
    const { countDownTime } = options;

    const shouldUpdateLastPositions = isHidding
      ? true
      : Date.now() > lastLocation + countDownTime;

    const newLastPositions = shouldUpdateLastPositions
      ? allPositions
      : lastPositions;

    const newData = {
      ...roomData,
      positions: allPositions,
      lastPositions: newLastPositions,
    };

    await saveData({ roomId, newData });
    await free({ roomId });
  } else if (distribution === "VS") {
    const { lastLocations, lastPositions } = roomData;
    const { countDownTime } = options;

    const shouldUpdateLastPositions = isHidding
      ? true
      : Date.now() > lastLocations[team] + countDownTime;

    const newLastPositions = shouldUpdateLastPositions
      ? { ...allPositions, [team]: allPositions[team] }
      : lastPositions;

    // console.log("lastPositions", lastPositions);
    // console.log("lastPositions.red", lastPositions?.red);
    // console.log("lastPositions.blue", lastPositions?.blue);

    const newData = {
      ...roomData,
      positions: allPositions,
      lastPositions: newLastPositions,
    };

    // console.log("newData", newData);

    await saveData({ roomId, newData });
    await free({ roomId });
  }
}

export async function getLastPositions({
  roomId,
  roomToken,
  gamerRole,
  vsTeam,
  otherTeam,
}) {
  try {
    await wait({ roomId });

    const roomData = (
      await prisma.room.findFirst({
        where: { id: roomId },
        select: { gameData: true },
      })
    ).gameData;

    const { distribution } = roomData.options;

    if (distribution === "FFA") {
      const { lastLocation, nextLocation, positions, lastPositions } = roomData;
      const { countDownTime } = roomData.options;

      let newLastPositions;
      let newLastLocation;
      let newNextLocation;
      let shouldDispatch = false;
      if (
        (nextLocation - Date.now() < 0 || nextLocation === null) &&
        gamerRole === "hunter"
      ) {
        newLastLocation = Date.now();
        newNextLocation = Date.now() + countDownTime;
        newLastPositions = positions;
        shouldDispatch = true;
      } else {
        newLastLocation = lastLocation;
        newNextLocation = nextLocation;
        newLastPositions = lastPositions;
      }

      const filteredLastPositions =
        gamerRole === "hunter"
          ? newLastPositions
          : newLastPositions.filter((pos) => pos.role === "hunted");

      const newData = {
        ...roomData,
        lastPositions: newLastPositions,
        lastLocation: newLastLocation,
        nextLocation: newNextLocation,
      };

      shouldDispatch &&
        (await saveAndDispatchData({ roomId, roomToken, newData }));
      await free({ roomId });
      return filteredLastPositions;
    } else if (distribution === "VS") {
      const { lastLocations, nextLocations, positions, lastPositions } =
        roomData;
      const { countDownTime } = roomData.options;

      let newLastPositions;
      let newLastLocations;
      let newNextLocations;
      let shouldDispatch = false;
      if (
        (nextLocations[vsTeam] - Date.now() < 0 ||
          nextLocations[vsTeam] === null) &&
        gamerRole === "hunter"
      ) {
        newLastLocations = {
          ...lastLocations,
          [vsTeam]: Date.now(),
        };
        newNextLocations = {
          ...nextLocations,
          [vsTeam]: Date.now() + countDownTime,
        };
        newLastPositions = {
          ...lastPositions,
          [otherTeam]: positions[otherTeam],
        };
        shouldDispatch = true;
      } else {
        newLastLocations = lastLocations;
        newNextLocations = nextLocations;
        newLastPositions = lastPositions;
      }

      let filteredLastPositions;
      if (gamerRole === "hunter") {
        const otherHunters = newLastPositions[vsTeam].filter(
          (pos) => pos.role === "hunter"
        );
        const aimeds = newLastPositions[otherTeam].filter(
          (pos) => pos.role === "hunted"
        );
        filteredLastPositions = [...otherHunters, ...aimeds];
        console.log("filteredLastPositions", filteredLastPositions);
      } else if (gamerRole === "hunted") {
        filteredLastPositions = newLastPositions[vsTeam].filter(
          (pos) => pos.role === "hunted"
        );
      }

      // const filteredLastPositions =
      //   gamerRole === "hunter"
      //     ? newLastPositions[team]
      //     : newLastPositions[team].filter((pos) => pos.role === "hunted");

      const newData = {
        ...roomData,
        lastPositions: newLastPositions,
        lastLocations: newLastLocations,
        nextLocations: newNextLocations,
      };

      shouldDispatch &&
        (await saveAndDispatchData({ roomId, roomToken, newData }));
      await free({ roomId });
      // console.log("passé ici", team);
      return filteredLastPositions;
    }
  } catch (error) {
    console.error("getLastPositions error:", error);
  } finally {
  }
}

export async function sendGrab({ grabber, grabbed, roomId, roomToken, team }) {
  await wait({ roomId });

  const roomData = (
    await prisma.room.findFirst({
      where: { id: roomId },
      select: { gameData: true },
    })
  ).gameData;

  const { distribution } = roomData.options;

  if (distribution === "FFA") {
    const newGrabEvents = roomData.grabEvents || {};
    newGrabEvents[grabbed] = grabber;

    const newData = {
      ...roomData,
      grabEvents: newGrabEvents,
    };

    await saveAndDispatchData({ roomId, roomToken, newData });
  } else if (distribution === "VS") {
    const grabEvents = roomData.grabEvents || {};
    const newTeamGrabEvents = grabEvents[team] || {};
    newTeamGrabEvents[grabbed] = grabber;
    const newGrabEvents = { ...grabEvents, [team]: newTeamGrabEvents };
    const newData = {
      ...roomData,
      grabEvents: newGrabEvents,
    };

    await saveAndDispatchData({ roomId, roomToken, newData });
  }

  await free({ roomId });
}

export async function amIGrabbed({
  isGrabbed,
  grabbed,
  grabber,
  roomId,
  roomToken,
  vsTeam,
  otherTeam,
}) {
  await wait({ roomId });

  const roomData = (
    await prisma.room.findFirst({
      where: { id: roomId },
      select: { gameData: true },
    })
  ).gameData;

  const { distribution } = roomData.options;
  if (distribution === "FFA") {
    const { teams, grabEvents: newGrabEvents } = roomData;

    if (!isGrabbed) {
      newGrabEvents[grabbed] = null;
      const newData = {
        ...roomData,
        grabEvents: newGrabEvents,
      };
      await saveAndDispatchData({ roomId, roomToken, newData });
      await free({ roomId });
    } else {
      const { hunteds } = teams;

      const hunted = hunteds.find((h) => h.name === grabbed);
      const newHunted = { ...hunted, alive: false };
      const newHunteds = hunteds.filter((h) => h.name !== grabbed);
      newHunteds.push(newHunted);
      const newTeams = { ...teams, hunteds: newHunteds };

      const { positions, lastPositions } = roomData;
      const deathsPositions = roomData.deathsPositions || [];
      const grabbedPosition = positions.find((gamer) => gamer.name === grabbed);
      const [grabbedLatitude, grabbedLongitude] = [
        grabbedPosition.latitude,
        grabbedPosition.longitude,
      ];
      const newDeathPositions = {
        latitude: grabbedLatitude,
        longitude: grabbedLongitude,
        grabbed,
        grabber,
      };
      const newDeathsPositions = [...deathsPositions, newDeathPositions];

      const newPositions = positions.map((p) =>
        p.name === grabbed ? { ...p, alive: false } : p
      );
      const newLastPositions = lastPositions.map((l) =>
        l.name === grabbed ? { ...l, alive: false } : l
      );

      if (!newTeams.hunteds.some((hunted) => hunted.alive)) {
        const newData = {
          ...roomData,
          teams: newTeams,
          positions: newPositions,
          lastPositions: newLastPositions,
          deathsPositions: newDeathsPositions,
          phase: "ending",
          ended: true,
        };
        await saveAndDispatchData({ roomId, roomToken, newData });
        await free({ roomId });
        return;
      }

      const newData = {
        ...roomData,
        teams: newTeams,
        grabEvent: { grabbed, grabber },
        positions: newPositions,
        lastPositions: newLastPositions,
        deathsPositions: newDeathsPositions,
      };

      await saveAndDispatchData({ roomId, roomToken, newData });
      await free({ roomId });
    }
  } else if (distribution === "VS") {
    const { teams, grabEvents } = roomData;
    if (!isGrabbed) {
      const newTeamGrabEvents = grabEvents[otherTeam];
      console.log("newTeamGrabEvents", newTeamGrabEvents);
      newTeamGrabEvents[grabbed] = null;
      const newGrabEvents = { ...grabEvents, [otherTeam]: newTeamGrabEvents };

      const newData = {
        ...roomData,
        grabEvents: newGrabEvents,
      };
      await saveAndDispatchData({ roomId, roomToken, newData });
      await free({ roomId });
    } else {
      const azerteam = teams[vsTeam];
      const { hunteds } = azerteam;

      const hunted = hunteds.find((h) => h.name === grabbed);
      const newHunted = { ...hunted, alive: false };
      const newTeamHunteds = hunteds.filter((h) => h.name !== grabbed);
      newTeamHunteds.push(newHunted);
      const newTeam = { ...azerteam, hunteds: newTeamHunteds };
      const newTeams = { ...teams, [vsTeam]: newTeam };

      const { positions, lastPositions, vsGrabEvent } = roomData;
      // const deathsPositions = roomData.deathsPositions || [];
      const deathsPositions = roomData.deathsPositions || {};
      const teamDeathsPositions = deathsPositions[vsTeam] || [];
      if (teamDeathsPositions.some((dp) => dp.grabbed === grabbed)) {
        await free({ roomId });
        return;
      }
      // const grabbedPosition = positions.find((gamer) => gamer.name === grabbed);
      const grabbedPosition = positions[vsTeam].find(
        (gamer) => gamer.name === grabbed
      );
      const [grabbedLatitude, grabbedLongitude] = [
        grabbedPosition.latitude,
        grabbedPosition.longitude,
      ];
      const newDeathPositions = {
        latitude: grabbedLatitude,
        longitude: grabbedLongitude,
        grabbed,
        grabber,
        date: Date.now(),
      };
      const newTeamDeathsPosition = [...teamDeathsPositions, newDeathPositions];
      const newDeathsPositions = {
        ...deathsPositions,
        [vsTeam]: newTeamDeathsPosition,
      };

      const newTeamPositions = positions[vsTeam].map((p) =>
        p.name === grabbed ? { ...p, alive: false } : p
      );
      const newPositions = { ...positions, [vsTeam]: newTeamPositions };

      const newTeamLastPositions = lastPositions[vsTeam].map((l) =>
        l.name === grabbed ? { ...l, alive: false } : l
      );
      const newLastPositions = {
        ...lastPositions,
        [vsTeam]: newTeamLastPositions,
      };

      if (!newTeams[vsTeam].hunteds.some((hunted) => hunted.alive)) {
        const newData = {
          ...roomData,
          teams: newTeams,
          positions: newPositions,
          lastPositions: newLastPositions,
          deathsPositions: newDeathsPositions,
          winner: vsTeam === "red" ? "blue" : "red",
          phase: "ending",
          ended: true,
        };
        await saveAndDispatchData({ roomId, roomToken, newData });
        await free({ roomId });
        return;
      }

      const newVsGrabEvent = {
        ...vsGrabEvent,
        [otherTeam]: { grabbed, grabber },
      };

      const newData = {
        ...roomData,
        teams: newTeams,
        // grabEvent: { grabbed, grabber },
        vsGrabEvent: newVsGrabEvent,
        positions: newPositions,
        lastPositions: newLastPositions,
        deathsPositions: newDeathsPositions,
      };

      await saveAndDispatchData({ roomId, roomToken, newData });
      await free({ roomId });
    }
  }
}

export async function resetGrabEvent({ roomId, roomToken, team }) {
  await wait({ roomId });

  const roomData = (
    await prisma.room.findFirst({
      where: { id: roomId },
      select: { gameData: true },
    })
  ).gameData;

  const { distribution } = roomData.options;

  if (distribution === "FFA") {
    const newData = { ...roomData, grabEvent: null };
    await saveAndDispatchData({ roomId, roomToken, newData });
  } else if (distribution === "VS") {
    const { vsGrabEvent } = roomData;
    const newVsGrabEvent = { ...vsGrabEvent, [team]: null };
    const newData = { ...roomData, vsGrabEvent: newVsGrabEvent };
    await saveAndDispatchData({ roomId, roomToken, newData });
  }

  await free({ roomId });
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
  const options = newOptions ? newOptions : gameData.options;
  const newEnded = false;

  const newData = {
    ...gameData,
    phase: newPhase,
    acceptedGamers: newAcceptedGamers,
    decliners: newDecliners,
    proposed: newProposed,
    waitingForGamers: newWaitingForGamers,
    keepTeams: newKeepTeams,
    positions: newPositions,
    deathsPositions: [],
    lastPositions: undefined,
    lastLocation: undefined,
    nextLocation: undefined,
    lastLocations: undefined,
    nextLocations: undefined,
    grabEvents: {},
    grabEvent: null,
    vsGrabEvent: {},
    winner: undefined,
    options,
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
