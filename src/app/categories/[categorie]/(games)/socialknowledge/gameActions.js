"use server";

import sortByKeys from "@/utils/sortByKeys";
import checkPlayers from "@/utils/checkPlayers";
import getAreSimilar from "./getAreSimilar";

import { initGamersAndGuests } from "@/utils/initGamersAndGuests";
import checkViceAdminAndArrivals from "@/utils/checkViceAdminAndArrivals";
import { saveAndDispatchData } from "@/components/Room/actions";

const deleteAllTableauResponse = async ({ gamers }) => {
  await Promise.all(
    gamers.map(async (gamer) => {
      if (!gamer.multiGuest) {
        await prisma.tableauResponse.deleteMany({
          where: { userId: gamer.id },
        });
      } else {
        await prisma.tableauResponse.deleteMany({
          where: { multiguestId: gamer.dataId },
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

  let newData;
  if (options.mode === "Tableau") {
    await deleteAllTableauResponse({ gamers: gamersAndGuests });

    const { themes } = options;
    const selectedThemesLabels = themes
      .filter((theme) => theme.selected)
      .map((theme) => theme.theme);
    newData = {
      admin: startedRoom.admin,
      viceAdmin,
      arrivalsOrder,
      gamers: gamersAndGuests,
      themes: selectedThemesLabels,
      options,
      phase: "writing",
    };
  }

  await saveAndDispatchData({ roomId, roomToken, newData });
  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
  });

  return {};
}

export async function checkResponses({ gameData, roomId, roomToken }) {
  const { gamers, themes } = gameData;
  const themesNumber = themes.length;
  let responsesGamerCounts = [];

  await Promise.all(
    gamers.map(async (gamer) => {
      if (!gamer.multiGuest) {
        const count = await prisma.tableauResponse.count({
          where: {
            userId: gamer.id,
          },
        });
        responsesGamerCounts.push(count);
      } else {
        const count = await prisma.tableauResponse.count({
          where: {
            multiguestId: gamer.dataId,
          },
        });
        responsesGamerCounts.push(count);
      }
    })
  );

  if (responsesGamerCounts.every((count) => count === themesNumber)) {
    let allResponsesByUser = {};

    await Promise.all(
      gamers.map(async (gamer) => {
        let tableauResponses;
        if (!gamer.multiGuest) {
          tableauResponses = (
            await prisma.user.findFirst({
              where: { id: gamer.id },
              select: { tableauResponses: true },
            })
          ).tableauResponses;
        } else {
          tableauResponses = (
            await prisma.multiguest.findFirst({
              where: { id: gamer.dataId },
              select: { tableauResponses: true },
            })
          ).tableauResponses;
        }

        let gamerResponses = {};
        tableauResponses.forEach(
          (response) => (gamerResponses[response.theme] = response.response)
        );
        allResponsesByUser[gamer.name] = gamerResponses;
      })
    );

    const sortedResponsesByUser = sortByKeys(allResponsesByUser);

    const allResponsesByTheme = {};
    const gamersNames = [];
    for (const [user, themes] of Object.entries(allResponsesByUser)) {
      gamersNames.push(user);
      for (const [theme, response] of Object.entries(themes)) {
        if (!allResponsesByTheme[theme]) {
          allResponsesByTheme[theme] = {};
        }
        allResponsesByTheme[theme][user] = response;
      }
    }

    gamersNames.sort();

    await Promise.all(
      gamers.map(async (gamer) => {
        if (!gamer.multiGuest) {
          await prisma.user.update({
            where: { id: gamer.id },
            data: {
              tableauSortedResponses: null,
              tableauSecondSorted: null,
            },
          });
        } else {
          await prisma.multiguest.update({
            where: { id: gamer.dataId },
            data: {
              tableauSortedResponses: null,
              tableauSecondSorted: null,
            },
          });
        }
      })
    );

    const countDownTimeOption = gameData.options.countDownTime;
    const finishCountdownDate =
      countDownTimeOption !== 0 ? Date.now() + countDownTimeOption : 0;

    const newData = {
      ...gameData,
      allResponses: allResponsesByTheme,
      allResponsesByUser: sortedResponsesByUser,
      gamersNames,
      finishCountdownDate,
      phase: "sorting",
      isDeletedUser: false,
    };
    await saveAndDispatchData({ roomId, roomToken, newData });
  }
}

export async function sendResponse(
  { gameData, roomId, roomToken, user },
  prevState,
  formData
) {
  const response = formData.get("response");
  const theme = formData.get("theme");
  const isLast = formData.get("isLast");

  if (!user.multiGuest) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        tableauResponses: {
          create: {
            theme: theme,
            response: response,
          },
        },
      },
    });
  } else {
    await prisma.multiguest.upsert({
      where: { id: user.dataId },
      update: {
        tableauResponses: {
          create: {
            theme: theme,
            response: response,
          },
        },
      },
      create: {
        id: user.dataId,
        tableauResponses: {
          create: {
            theme: theme,
            response: response,
          },
        },
      },
    });
  }

  if (isLast) {
    await checkResponses({ gameData, roomId, roomToken });
  }
}

export async function checkSorted({ gameData, roomId, roomToken }) {
  const { gamers } = gameData;
  let validatedNumber = 0;
  await Promise.all(
    gamers.map(async (gamer) => {
      if (!gamer.multiGuest) {
        const hasResponded = !!(
          await prisma.user.findFirst({
            where: { id: gamer.id },
            select: { tableauSortedResponses: true },
          })
        ).tableauSortedResponses;
        if (hasResponded) validatedNumber += 1;
      } else {
        const hasResponded = !!(
          await prisma.multiguest.findFirst({
            where: { id: gamer.dataId },
            select: { tableauSortedResponses: true },
          })
        ).tableauSortedResponses;
        if (hasResponded) validatedNumber += 1;
      }
    })
  );
  if (validatedNumber === gamers.length) {
    await Promise.all(
      gamers.map(async (gamer) => {
        if (!gamer.multiGuest) {
          await prisma.user.update({
            where: { id: gamer.id },
            data: {
              tableauRevelationSeen: false,
            },
          });
        } else {
          await prisma.multiguest.update({
            where: { id: gamer.dataId },
            data: {
              tableauRevelationSeen: false,
            },
          });
        }
      })
    );

    const countDownTimeOption = gameData.options.countDownTime;
    let newFinishCountdownDate;
    switch (countDownTimeOption) {
      case 60000:
      case 120000:
        newFinishCountdownDate = Date.now() + 60000;
        break;
      case 300000:
        newFinishCountdownDate = Date.now() + 120000;
        break;
      case 600000:
        newFinishCountdownDate = Date.now() + 300000;
        break;
      case 1200000:
      case 1800000:
        newFinishCountdownDate = Date.now() + 600000;
        break;
      case 0:
        newFinishCountdownDate = 0;
        break;
    }

    let newPhase;
    switch (gameData.options.secondChance) {
      case "no":
        newPhase = "no_chance";
        break;
      case "without correction":
        newPhase = "secondChance_withoutCorrection";
        break;
      case "with correction":
        newPhase = "secondChance_withCorrection";
        break;
    }

    const newData = {
      ...gameData,
      phase: newPhase,
      finishCountdownDate: newFinishCountdownDate,
    };
    await saveAndDispatchData({ roomId, roomToken, newData });
  }
}

export async function sendSortedResponses({
  user,
  sortedResponses,
  gameData,
  roomId,
  roomToken,
}) {
  if (!user.multiGuest) {
    await prisma.user.update({
      where: { id: user.id },
      data: { tableauSortedResponses: sortedResponses },
    });
  } else {
    await prisma.multiguest.update({
      where: { id: user.dataId },
      data: { tableauSortedResponses: sortedResponses },
    });
  }

  await checkSorted({ gameData, roomId, roomToken });
}

export async function checkSecond({ gameData, roomId, roomToken }) {
  const { gamers } = gameData;
  let validatedNumber = 0;
  await Promise.all(
    gamers.map(async (gamer) => {
      if (!gamer.multiGuest) {
        const hasResponded = !!(
          await prisma.user.findFirst({
            where: { id: gamer.id },
            select: { tableauSecondSorted: true },
          })
        ).tableauSecondSorted;
        if (hasResponded) validatedNumber += 1;
      } else {
        const hasResponded = !!(
          await prisma.multiguest.findFirst({
            where: { id: gamer.dataId },
            select: { tableauSecondSorted: true },
          })
        ).tableauSecondSorted;
        if (hasResponded) validatedNumber += 1;
      }
    })
  );

  if (validatedNumber === gamers.length) {
    const newData = { ...gameData, phase: "revelating" };
    await saveAndDispatchData({ roomId, roomToken, newData });
  }
}

export async function sendSecondSorted({
  user,
  secondSorted,
  gameData,
  roomId,
  roomToken,
}) {
  if (!user.multiGuest) {
    await prisma.user.update({
      where: { id: user.id },
      data: { tableauSecondSorted: secondSorted },
    });
  } else {
    await prisma.multiguest.update({
      where: { id: user.dataId },
      data: { tableauSecondSorted: secondSorted },
    });
  }

  await checkSecond({ gameData, roomId, roomToken });
}

export async function checkHasSeen({ gameData, roomId, roomToken }) {
  const { gamers } = gameData;
  let seenNumber = 0;
  await Promise.all(
    gamers.map(async (gamer) => {
      if (!gamer.multiGuest) {
        const hasSeen = (
          await prisma.user.findFirst({
            where: { id: gamer.id },
            select: { tableauRevelationSeen: true },
          })
        ).tableauRevelationSeen;
        if (hasSeen) seenNumber += 1;
      } else {
        const hasSeen = (
          await prisma.multiguest.findFirst({
            where: { id: gamer.dataId },
            select: { tableauRevelationSeen: true },
          })
        ).tableauRevelationSeen;
        if (hasSeen) seenNumber += 1;
      }
    })
  );

  if (seenNumber === gamers.length) {
    const newData = { ...gameData, phase: "revelating" };
    await saveAndDispatchData({ roomId, roomToken, newData });
  }
}

export async function seeRevelation({ user, gameData, roomId, roomToken }) {
  if (!user.multiGuest) {
    await prisma.user.update({
      where: { id: user.id },
      data: { tableauRevelationSeen: true },
    });
  } else {
    await prisma.multiguest.update({
      where: { id: user.dataId },
      data: { tableauRevelationSeen: true },
    });
  }

  await checkHasSeen({ gameData, roomId, roomToken });
}

export async function adminRevelate({ roomId, roomToken, gameData }) {
  const { revelationIndexes, allResponses } = gameData;
  const themesNumber = Object.keys(allResponses).length;

  let currentGamerIndex = revelationIndexes?.currentGamerIndex;
  let currentThemeIndex = revelationIndexes?.currentThemeIndex;
  if (currentGamerIndex === undefined || currentThemeIndex === undefined) {
    currentGamerIndex = -1;
    currentThemeIndex = -1;
  }

  if (currentThemeIndex >= themesNumber - 1) currentThemeIndex = -1;
  const newCurrentThemeIndex = currentThemeIndex + 1;

  const newCurrentGamerIndex =
    newCurrentThemeIndex === 0 ? currentGamerIndex + 1 : currentGamerIndex;

  const newRevelationsIndexes = {
    currentThemeIndex: newCurrentThemeIndex,
    currentGamerIndex: newCurrentGamerIndex,
  };

  const newData = { ...gameData, revelationIndexes: newRevelationsIndexes };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

const fillResponses = (sortedResponses, gamerName, gamersNames) => {
  const filledSortedResponses = Object.fromEntries(
    Object.entries(sortedResponses).map(([theme, responses]) => {
      const gamerResponseIndex = gamersNames.findIndex(
        (name) => name === gamerName
      );
      const filledGamerResponses = [...responses];
      filledGamerResponses.splice(gamerResponseIndex, 0, null);
      return [theme, filledGamerResponses];
    })
  );
  return filledSortedResponses;
};

export async function getGamerFirstTurnSorted({ gamer, gamersNames }) {
  let firstTurn;
  if (!gamer.multiGuest) {
    const sortedResponses = (
      await prisma.user.findFirst({
        where: { id: gamer.id },
        select: { tableauSortedResponses: true },
      })
    ).tableauSortedResponses;

    const filledSortedResponses = fillResponses(
      sortedResponses,
      gamer.name,
      gamersNames
    );

    firstTurn = filledSortedResponses;
  } else {
    const sortedResponses = (
      await prisma.multiguest.findFirst({
        where: { id: gamer.dataId },
        select: { tableauSortedResponses: true },
      })
    ).tableauSortedResponses;

    const filledSortedResponses = fillResponses(
      sortedResponses,
      gamer.name,
      gamersNames
    );

    firstTurn = filledSortedResponses;
  }

  return firstTurn;
}

export async function getAllSortedResponses({ gamers, gamersNames, options }) {
  const { secondChance: secondChanceOption } = options;
  const allSortedResponses = {};

  await Promise.all(
    gamers.map(async (gamer) => {
      if (!gamer.multiGuest) {
        let sortedResponses;
        if (secondChanceOption === "no") {
          sortedResponses = (
            await prisma.user.findFirst({
              where: { id: gamer.id },
              select: { tableauSortedResponses: true },
            })
          ).tableauSortedResponses;
        } else {
          sortedResponses = (
            await prisma.user.findFirst({
              where: { id: gamer.id },
              select: { tableauSecondSorted: true },
            })
          ).tableauSecondSorted;
        }

        const filledSortedResponses = fillResponses(
          sortedResponses,
          gamer.name,
          gamersNames
        );
        allSortedResponses[gamer.name] = filledSortedResponses;
      } else {
        let sortedResponses;
        if (secondChanceOption === "no") {
          sortedResponses = (
            await prisma.multiguest.findFirst({
              where: { id: gamer.dataId },
              select: { tableauSortedResponses: true },
            })
          ).tableauSortedResponses;
        } else {
          sortedResponses = (
            await prisma.multiguest.findFirst({
              where: { id: gamer.dataId },
              select: { tableauSecondSorted: true },
            })
          ).tableauSecondSorted;
        }
        const filledSortedResponses = fillResponses(
          sortedResponses,
          gamer.name,
          gamersNames
        );
        allSortedResponses[gamer.name] = filledSortedResponses;
      }
    })
  );

  return allSortedResponses;
}

export async function goResult({ roomId, roomToken, gameData }) {
  const { gamers, gamersNames, allResponsesByUser, options } = gameData;
  const allSortedResponses = await getAllSortedResponses({
    gamers,
    gamersNames,
    options,
  });

  const results = {};
  gamersNames.forEach((name) => {
    results[name] = 0;
  });

  Object.entries(allSortedResponses).forEach(([sorter, responses]) => {
    Object.entries(responses).forEach(([theme, sortedResponses]) => {
      sortedResponses.forEach((response, gamerIndex) => {
        if (
          getAreSimilar(
            response,
            allResponsesByUser[gamersNames[gamerIndex]][theme]
          )
        ) {
          results[sorter] += 1;
        }
      });
    });
  });

  let firstTurnResults;
  if (options.secondChance !== "no") {
    firstTurnResults = {};
    gamersNames.forEach((name) => {
      firstTurnResults[name] = 0;
    });

    const allFirstSorted = await getAllSortedResponses({
      gamers,
      gamersNames,
      options: { secondChance: "no" },
    });

    Object.entries(allFirstSorted).forEach(([sorter, responses]) => {
      Object.entries(responses).forEach(([theme, sortedResponses]) => {
        sortedResponses.forEach((response, gamerIndex) => {
          if (
            getAreSimilar(
              response,
              allResponsesByUser[gamersNames[gamerIndex]][theme]
            )
          ) {
            firstTurnResults[sorter] += 1;
          }
        });
      });
    });
  }

  const newData = {
    ...gameData,
    results,
    firstTurnResults,
    phase: "results",
    ended: true,
  };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function writtingComeBack({ user }) {
  if (!user.multiGuest) {
    const writtenIndex = await prisma.tableauResponse.count({
      where: {
        userId: user.id,
      },
    });
    return writtenIndex;
  } else {
    const writtenIndex = await prisma.tableauResponse.count({
      where: {
        multiguestId: user.dataId,
      },
    });
    return writtenIndex;
  }
}

export async function firstSubmitComeBack({ user }) {
  let sortedResponses;
  if (!user.multiGuest) {
    sortedResponses = (
      await prisma.user.findFirst({
        where: { id: user.id },
        select: { tableauSortedResponses: true },
      })
    ).tableauSortedResponses;
  } else {
    sortedResponses = (
      await prisma.multiguest.findFirst({
        where: { id: user.dataId },
        select: { tableauSortedResponses: true },
      })
    ).tableauSortedResponses;
  }

  return sortedResponses;
}

export async function removeTableauGamers({
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
    isDeletedUser: true,
    deletedGamersNames: newDeletedGamersNames,
  };

  await saveAndDispatchData({ roomId, roomToken, newData });
}
