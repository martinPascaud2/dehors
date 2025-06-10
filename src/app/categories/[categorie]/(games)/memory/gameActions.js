"use server";

import shuffleArray from "@/utils/shuffleArray";
import checkPlayers from "@/utils/checkPlayers";
import { initGamersAndGuests } from "@/utils/initGamersAndGuests";
import checkViceAdminAndArrivals from "@/utils/checkViceAdminAndArrivals";
import { saveLastParams } from "@/utils/getLastParams";
import { saveAndDispatchData } from "@/components/Room/actions";

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
    mode: "memory",
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

  const roundScores = gamersAndGuests.map((gamer) => ({
    [gamer.name]: 0,
  }));
  const totalScores = [...roundScores];

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
    gameData: {
      admin: startedRoom.admin,
      viceAdmin,
      arrivalsOrder,
      activePlayer: gamersAndGuests[0],
      gamers: gamersAndGuests,
      roundScores,
      totalScores,
      options,
    },
  });

  return {};
}

export async function getIcons({
  imageLength,
  pairsNumber,
  roomToken,
  roomId,
  gameData,
}) {
  let icons;
  const alreadySelected = [];
  let remaining = pairsNumber;

  while (remaining > 0) {
    const randomKey = Math.floor(Math.random() * imageLength);
    if (alreadySelected.some((key) => key === randomKey)) continue;
    alreadySelected.push(randomKey);
    alreadySelected.push(randomKey);
    remaining--;
  }

  const sortedSelected = shuffleArray(alreadySelected);

  icons = sortedSelected.map((key) => ({
    key,
    triggered: false,
    discovered: false,
  }));

  const newData = { ...gameData, icons };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

const getNextGamer = (gamers, activePlayer, newIcons) => {
  let triggered = newIcons.filter((icon) => icon.triggered).length;

  if (triggered <= 1) return activePlayer;

  const index = gamers.findIndex(
    (gamer) => gamer.id === activePlayer.id && gamer.name === activePlayer.name
  );
  const nextIndex = (index + 1) % gamers.length;
  const nextGamer = gamers[nextIndex];

  return nextGamer;
};

export async function revealCard({ roomToken, gameData, index }) {
  const { icons, gamers } = gameData;
  let { totalScores } = gameData;

  const icon = icons[index];
  const newIcon = { ...icon, triggered: true };

  const newIcons = [...icons];
  newIcons[index] = newIcon;

  let success = false;
  const checkDiscovered = () => {
    const newIconKey = newIcon.key;
    let count = 0;
    newIcons.map((icon) => {
      if (icon.key === newIconKey && icon.triggered) count++;
    });
    if (count >= 2) {
      success = true;
      newIcons.forEach((icon, index) => {
        if (icon.key === newIconKey) {
          newIcons[index].discovered = true;
        }
      });
    }
  };
  checkDiscovered();

  let newRoundScores = [...gameData.roundScores];
  if (success) {
    const gamerIndex = newRoundScores.findIndex(
      (score) => Object.entries(score)[0][0] === gameData.activePlayer.name
    );
    newRoundScores[gamerIndex] = {
      [gameData.activePlayer.name]:
        Object.entries(newRoundScores[gamerIndex])[0][1] + 1,
    };
  }

  const newActivePlayer = success
    ? gameData.activePlayer
    : getNextGamer(gameData.gamers, gameData.activePlayer, newIcons);

  const isEnded = newIcons.every((icon) => icon.discovered);

  const scoresEvolution = {};
  if (isEnded) {
    let maxRoundScore = 0;
    newRoundScores.forEach((score) => {
      const gamerScore = Object.entries(score)[0][1];
      if (gamerScore > maxRoundScore) maxRoundScore = gamerScore;
    });

    const winners = [];
    newRoundScores.forEach((score) => {
      Object.entries(score).forEach((gamerScore) => {
        if (gamerScore[1] === maxRoundScore) winners.push(gamerScore[0]);
      });
    });

    totalScores = totalScores.map((score) => {
      if (winners.some((winner) => winner === Object.keys(score)[0])) {
        const gamerName = Object.keys(score)[0];
        const scoreEvolution = winners.length === 1 ? 1 : 0.5;
        scoresEvolution[gamerName] = scoreEvolution;
        return {
          [gamerName]: Object.values(score)[0] + scoreEvolution,
        };
      } else {
        const gamerName = Object.keys(score)[0];
        const scoreEvolution = 0;
        scoresEvolution[gamerName] = scoreEvolution;
        return score;
      }
    });
  }

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      success,
      icons: newIcons,
      activePlayer: newActivePlayer,
      roundScores: newRoundScores,
      totalScores,
      scoresEvolution,
      ended: isEnded,
    },
  });
}

export async function hideUndiscovered({ roomId, roomToken, gameData }) {
  const { icons } = gameData;

  if (!icons) return;

  const newIcons = icons.map((icon) => ({ ...icon, triggered: false }));

  const newData = {
    ...gameData,
    icons: newIcons,
  };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function prepareNewGame({ roomToken, gameData }) {
  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      newGame: true,
    },
  });
}

export async function goNewMemoryGame({
  userId,
  roomToken,
  gameData,
  options,
}) {
  await saveLastParams({ userId, options });

  const newRoundScores = gameData.gamers.map((gamer) => ({
    [gamer.name]: 0,
  }));

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      icons: [],
      roundScores: newRoundScores,
      newGame: false,
      ended: false,
      options,
    },
  });
}

export async function removeGamers({
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
    ended: true,
    admin: admins.newAdmin,
    viceAdmin: admins.newViceAdmin,
    arrivalsOrder,
  };

  await saveAndDispatchData({ roomId, roomToken, newData });
}
