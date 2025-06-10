"use server";

import prisma from "@/utils/prisma";

import checkPlayers from "@/utils/checkPlayers";
import { initGamersAndGuests } from "@/utils/initGamersAndGuests";
import checkViceAdminAndArrivals from "@/utils/checkViceAdminAndArrivals";
import { saveLastParams } from "@/utils/getLastParams";
import { saveAndDispatchData } from "@/components/Room/actions";

import { shuffleObject } from "@/utils/shuffleArray";
import levenshtein from "@/utils/levenshtein";

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
    mode: "P'tit bac",
    gamers,
    guests,
    multiGuests,
  });
  if (playersError) return { error: playersError };

  const { themes, random } = options;
  if (themes.length + random === 0) {
    return {
      error: "Aucune catégorie sélectionnée",
    };
  }

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

  const counts = gamersAndGuests.map((gamer) => ({
    name: gamer.name,
    gold: 0,
  }));
  const lastTurnCounts = gamersAndGuests.map((gamer) => ({
    name: gamer.name,
    gold: 0,
  }));

  await saveLastParams({ userId: adminId, options });

  const newData = {
    admin: startedRoom.admin,
    viceAdmin,
    arrivalsOrder,
    activePlayer: gamersAndGuests[0],
    gamers: gamersAndGuests,
    hasFirstTurn: true,
    phase: "waiting",
    themes: [],
    themesResponses: {},
    counts,
    lastTurnCounts,
    options,
  };
  await saveAndDispatchData({ roomId, roomToken, newData });

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
  });

  return {};
}

// LEGACY
// const getFreeThemes = async ({ gamers }) => {
//   const userIds = gamers.map((gamer) => gamer.id);

//   const alreadyThemes = await prisma.ptitbacthemesOnUsers.findMany({
//     where: { userId: { in: userIds } },
//     select: { ptitbacthemeId: true },
//   });
//   const alreadyThemesIds = [
//     ...new Set(alreadyThemes.map((theme) => theme.ptitbacthemeId)),
//   ];

//   let freeThemes = await prisma.ptitbactheme.findMany({
//     where: {
//       NOT: {
//         id: { in: alreadyThemesIds },
//       },
//     },
//     take: 6,
//   });
//   const freeThemesIds = [...new Set(freeThemes.map((free) => free.id))];

//   await Promise.all(
//     userIds.map(async (userId) => {
//       await Promise.all(
//         freeThemesIds.map(async (freeThemeId) => {
//           await prisma.ptitbacthemesOnUsers.create({
//             data: {
//               user: { connect: { id: userId } },
//               ptitbactheme: { connect: { id: freeThemeId } },
//             },
//           });
//         })
//       );
//     })
//   );

//   const missingThemes = 6 - freeThemesIds.length;
//   if (missingThemes !== 0) {
//     await prisma.ptitbacthemesOnUsers.deleteMany({
//       where: {
//         userId: { in: userIds },
//       },
//     });
//   }

//   const addedThemes = await prisma.ptitbactheme.findMany({
//     where: {
//       NOT: {
//         id: { in: freeThemesIds },
//       },
//     },
//     take: missingThemes,
//   });
//   const addedThemesIds = [...new Set(addedThemes.map((added) => added.id))];

//   await Promise.all(
//     userIds.map(async (userId) => {
//       await Promise.all(
//         addedThemesIds.map(async (addedThemeId) => {
//           await prisma.ptitbacthemesOnUsers.create({
//             data: {
//               user: { connect: { id: userId } },
//               ptitbactheme: { connect: { id: addedThemeId } },
//             },
//           });
//         })
//       );
//     })
//   );

//   const themes = [...freeThemes, ...addedThemes];
//   const themeList = themes.map((theme) => theme.theme);
//   return themeList;
// };

export async function getAllUndefaultThemes() {
  const allThemes = (await prisma.ptitbactheme.findMany({ where: {} }))
    .map((theme) => theme.theme)
    .sort((a, b) => a.localeCompare(b));
  return allThemes;
}
export async function getAllThemes() {
  const allUndefault = await getAllUndefaultThemes();
  const allDefault = [
    "Animal",
    "Métier",
    "Pays/ville",
    "Prénom",
    "Sport/loisir",
    "Végétal",
  ];
  const allThemes = [...allUndefault, ...allDefault].sort();
  return allThemes;
}

async function getThemes({ gameData }) {
  const { options } = gameData;
  const enhancedThemes = options.themes
    .filter((theme) => theme.enhanced)
    .map((theme) => theme.theme);

  const getRandoms = async () => {
    const randomThemes = options.themes
      .filter((theme) => !theme.enhanced)
      .map((theme) => theme.theme);
    let newStatusRandoms;

    if (gameData.statusRandoms) {
      newStatusRandoms = { ...gameData.statusRandoms };
    } else {
      newStatusRandoms = {};
      randomThemes.forEach((theme) => {
        newStatusRandoms[theme] = gameData.options.random;
      });
    }

    let newRandoms = [];
    const totalWeight = Object.values(newStatusRandoms).reduce(
      (acc, weight) => acc + weight,
      0
    );
    let randomNumber = gameData.options.random;
    const shuffledStatusRandoms = shuffleObject(newStatusRandoms);

    while (randomNumber > 0) {
      let cumulativeWeight = 0;
      let randomWeight = Math.random() * totalWeight;
      for (const [key, weight] of Object.entries(shuffledStatusRandoms)) {
        cumulativeWeight += weight;
        if (
          newRandoms.some((newRandom) => newRandom === key) ||
          enhancedThemes.some((theme) => theme === key)
        )
          continue;
        if (randomWeight < cumulativeWeight) {
          newRandoms.push(key);
          randomNumber--;
          if (randomNumber === 0) break;
        }
      }
    }

    newRandoms.forEach((random) => {
      newStatusRandoms[random] =
        newStatusRandoms[random] !== 1
          ? newStatusRandoms[random] - 1
          : Math.floor(gameData.options.random / 2);
    });

    return { newRandoms, newStatusRandoms };
  };

  const { newRandoms, newStatusRandoms } = await getRandoms();
  const newThemes = [...enhancedThemes, ...newRandoms];

  return { newThemes, newStatusRandoms };
}

export async function startCountdown({ time, roomId, roomToken, gameData }) {
  const { newThemes, newStatusRandoms } = await getThemes({ gameData });
  const { counts } = gameData;

  let alreadyLetters = gameData.alreadyLetters || "";
  const remainedLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".replace(
    new RegExp(`[${alreadyLetters}]`, "g"),
    ""
  );
  const randomLetter =
    remainedLetters[Math.floor(Math.random() * remainedLetters.length)];
  alreadyLetters += randomLetter;
  if (alreadyLetters.length === 26) alreadyLetters = "";

  const finishCountdownDate = Date.now() + time;

  const newData = {
    ...gameData,
    phase: "searching",
    hasFirstTurn: false,
    themes: newThemes,
    letter: randomLetter,
    alreadyLetters,
    finishCountdownDate,
    statusRandoms: newStatusRandoms,
    lastTurnCounts: counts,
  };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function sendResponses({
  responses,
  userId,
  roomToken,
  gameData,
}) {
  try {
    await prisma.$transaction(async () => {
      const responsesStr = responses.join("/");

      await prisma.user.update({
        where: { id: userId },
        data: { ptitbacResponses: responsesStr },
      });

      // Legacy transaction example
      // const roomGameData =
      //   (
      //     await prisma.room.findUnique({
      //       where: { id: roomId },
      //       select: { gameData: true },
      //     })
      //   ).gameData || {};
      // const alreadySent =
      //   roomGameData?.alreadySent < gameData.gamers.length
      //     ? roomGameData.alreadySent
      //     : 0;
      // const newAlreadySent = alreadySent + 1;
      // const newRoomGameData = { ...roomGameData, alreadySent: newAlreadySent };
      // const TEST = await prisma.room.update({
      //   where: { id: roomId },
      //   data: { gameData: newRoomGameData },
      // });

      await pusher.trigger(`room-${roomToken}`, "room-event", {
        gameData: {
          ...gameData,
          phase: "sending",
        },
      });
    });
  } catch (error) {
    console.error("error", error);
  }
}

export async function goValidation({ gamers, roomId, roomToken, gameData }) {
  const { themes, letter } = gameData;

  const everyoneResponses = [];
  await Promise.all(
    gamers.map(async (gamer) => {
      const responses = (
        await prisma.user.findFirst({
          where: { id: gamer.id },
          select: { ptitbacResponses: true },
        })
      ).ptitbacResponses.split("/");
      everyoneResponses.push({ gamer: gamer.name, responses });
    })
  );

  let themesResponses = {};
  themes.forEach((theme) => {
    themesResponses[theme] = {};
  });
  everyoneResponses.forEach((one) => {
    one.responses.forEach((res, index) => {
      themesResponses[themes[index]][one.gamer] = {
        word: res.length >= 2 ? res : letter,
        validated: res.length >= 2 ? true : false,
      };
    });
  });

  const newData = {
    ...gameData,
    alreadySent: 0,
    phase: "validating-0",
    themesResponses,
  };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function refereeTrigger({
  newRefereeValidation,
  roomId,
  roomToken,
  gameData,
}) {
  const { phase, themesResponses, themes } = gameData;
  const valThemeIndex = parseInt(phase.split("-")[1]);
  const theme = themes[valThemeIndex];
  let newThemesResponses = { ...themesResponses };

  Object.values(newRefereeValidation).forEach((group) => {
    group.gamers.forEach((gamer) => {
      newThemesResponses[theme][gamer].validated = group.validated;
    });
  });

  const newData = {
    ...gameData,
    themesResponses: newThemesResponses,
    refereeValidation: newRefereeValidation,
  };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function validate({ roomId, roomToken, gameData }) {
  const { counts, lastTurnCounts, themesResponses, phase, themes, options } =
    gameData;
  const valThemeIndex = parseInt(phase.split("-")[1]);
  const theme = themes[valThemeIndex];

  const newCounts = counts.map((count) => {
    const isAlone =
      Object.values(themesResponses[theme]).reduce(
        (times, response) =>
          levenshtein(response.word, themesResponses[theme][count.name].word) <=
          1
            ? times + 1
            : times,
        0
      ) === 1;
    return {
      ...count,
      gold: !themesResponses[theme][count.name].validated
        ? count.gold
        : isAlone
        ? count.gold + 2
        : count.gold + 1,
    };
  });

  const isLastTheme = valThemeIndex === themes.length - 1;

  if (!isLastTheme) {
    const nextPhase = `validating-${valThemeIndex + 1}`;

    const newData = {
      ...gameData,
      counts: newCounts,
      lastTurnCounts,
      phase: nextPhase,
    };
    await saveAndDispatchData({ roomId, roomToken, newData });
  } else {
    const { aimPoints } = options;
    const finalWinners = newCounts.filter(
      (gamerCount) => gamerCount.gold >= aimPoints
    );
    if (!finalWinners.length || aimPoints === 0) {
      const newData = {
        ...gameData,
        counts: newCounts,
        lastTurnCounts,
        phase: "waiting",
      };
      await saveAndDispatchData({ roomId, roomToken, newData });
    } else {
      const newData = {
        ...gameData,
        counts: newCounts,
        lastTurnCounts,
        winners: finalWinners,
        phase: "ended",
        ended: true,
      };
      await saveAndDispatchData({ roomId, roomToken, newData });
    }
  }
}

export async function manageEmptyTheme({ roomId, roomToken, gameData }) {
  const { phase, themes } = gameData;
  const valThemeIndex = parseInt(phase.split("-")[1]);
  const isLastTheme = valThemeIndex === themes.length - 1;
  const nextPhase = isLastTheme ? "waiting" : `validating-${valThemeIndex + 1}`;

  const newData = {
    ...gameData,
    phase: nextPhase,
  };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function removeGamers({
  roomId,
  roomToken,
  gameData,
  onlineGamers,
  admins,
  arrivalsOrder,
}) {
  const { gamers, counts, lastTurnCounts, themesResponses, phase } = gameData;
  const onlineGamersList = onlineGamers.map((gamer) => gamer.userName);
  const onlineGamersSet = new Set(onlineGamersList);

  const remainingGamers = gamers.filter((gamer) =>
    onlineGamersSet.has(gamer.name)
  );

  const newPhase = remainingGamers.length < 2 ? "ended" : phase;
  const ended = remainingGamers.length < 2;

  const remainingCounts = counts.filter((count) =>
    onlineGamersSet.has(count.name)
  );

  const remainingLastTurnCounts = lastTurnCounts.filter((lastTurnCount) =>
    onlineGamersSet.has(lastTurnCount.name)
  );

  const remainingThemesResponses = Object.fromEntries(
    Object.entries(themesResponses).map(([theme, responses]) => [
      theme,
      Object.fromEntries(
        Object.entries(responses).filter(([user]) => onlineGamersSet.has(user))
      ),
    ])
  );

  const newData = {
    ...gameData,
    gamers: remainingGamers,
    counts: remainingCounts,
    lastTurnCounts: remainingLastTurnCounts,
    themesResponses: remainingThemesResponses,
    phase: newPhase,
    ended,
    admin: admins.newAdmin,
    viceAdmin: admins.newViceAdmin,
    arrivalsOrder,
  };

  await saveAndDispatchData({ roomId, roomToken, newData });
}
