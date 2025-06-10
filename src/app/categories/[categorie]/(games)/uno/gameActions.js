"use server";

import pusher from "@/utils/pusher";

import { modesRules } from "@/assets/globals";
import { saveAndDispatchData } from "@/components/Room/actions";
import checkPlayers from "@/utils/checkPlayers";
import { initGamersAndGuests } from "@/utils/initGamersAndGuests";
import checkViceAdminAndArrivals from "@/utils/checkViceAdminAndArrivals";

import { unoCards } from "./cardsData";

const getRandomCard = (remainCards) => {
  const randomCardIndex =
    remainCards[Math.floor(Math.random() * remainCards.length)];
  const randomCard = unoCards[randomCardIndex];
  const newRemainCards = remainCards.filter(
    (index) => index !== randomCardIndex
  );
  return { randomCard, newRemainCards };
};

const getStartedCards = ({ remainCards, gamersAndGuests }) => {
  let startedCards = {};
  let startedRemains = remainCards;

  gamersAndGuests.forEach((gamer) => {
    const gamerCards = [];
    for (let i = 7; i > 0; i--) {
      const { randomCard, newRemainCards: newStartedRemains } =
        getRandomCard(startedRemains);
      gamerCards.push(randomCard);
      startedRemains = newStartedRemains;
    }
    startedCards[gamer.name] = gamerCards;
  });

  return { startedCards, startedRemains };
};

export async function launchGame({
  roomId,
  roomToken,
  adminId,
  gamers,
  guests,
  multiGuests,
  // options,
}) {
  const { error: playersError } = checkPlayers({
    mode: "uno",
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

  let remainCards = Object.keys(unoCards).map((string) => parseInt(string));

  const { randomCard, newRemainCards } = getRandomCard(remainCards);
  const usedCards = [randomCard.data.dataId];
  remainCards = newRemainCards;

  const { startedCards, startedRemains } = getStartedCards({
    remainCards,
    gamersAndGuests,
  });

  const initCounts = async () => {
    await Promise.all(
      gamersAndGuests.map(async (gamer) => {
        if (!gamer.multiGuest) {
          await prisma.user.update({
            where: { id: gamer.id },
            data: { unoCount: 0 },
          });
        } else {
          await prisma.multiguest.upsert({
            where: { id: gamer.dataId },
            update: { unoCount: 0 },
            create: {
              id: gamer.dataId,
              unoCount: 0,
            },
          });
        }
      })
    );
  };
  await initCounts();

  const newData = {
    admin: startedRoom.admin,
    viceAdmin,
    arrivalsOrder,
    activePlayer: gamersAndGuests[0],
    gamers: gamersAndGuests,
    phase: "start",
    rotation: "clock",
    card: randomCard,
    remainCards: startedRemains,
    usedCards,
    startedCards, // check
    gamersCards: startedCards,
    mustDraw: false,
    toDraw: 0,
    // options,
  };

  await saveAndDispatchData({ roomId, roomToken, newData });

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
  });

  return {};
}

const getNextGamer = ({ gameData, card }) => {
  let { rotation } = gameData;
  if (card?.type === "reverse") {
    rotation = rotation === "clock" ? "trigo" : "clock";
  }

  const { gamers, activePlayer } = gameData;

  const index = gamers.findIndex(
    (gamer) => gamer.id === activePlayer.id && gamer.name === activePlayer.name
  );
  const nextIndex =
    rotation === "clock"
      ? (index + 1) % gamers.length
      : index === 0
      ? gamers.length - 1
      : index - 1;

  const skip = card?.type === "skip" ? 1 : 0;
  const nextSkippedIndex =
    rotation === "clock"
      ? (nextIndex + skip) % gamers.length
      : skip
      ? nextIndex === 0
        ? gamers.length - 1
        : nextIndex - 1
      : nextIndex;

  const nextGamer = gamers[nextSkippedIndex];

  return { newActivePlayer: nextGamer, newRotation: rotation };
};

export async function skipTurn({ roomId, roomToken, gameData }) {
  const { newActivePlayer } = getNextGamer({ gameData, card: null });

  const newData = {
    ...gameData,
    activePlayer: newActivePlayer,
    hasFreelyDrawn: false,
  };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function playCard({
  card,
  gameData,
  roomId,
  roomToken,
  playerName,
  unoPlayerName,
}) {
  const { newActivePlayer, newRotation } = getNextGamer({
    gameData,
    card: card[0],
  });

  const mustDraw = ["+2", "+4"].some((str) => str === card[0].data.text);
  let toDraw = 0;
  if (mustDraw) {
    toDraw = parseInt(card[0].data.text);
  }

  const { usedCards } = gameData;
  const newUsedCards = usedCards;
  newUsedCards.push(card[0].data.dataId);

  const gamerCards = gameData.gamersCards[playerName];
  const newGamerCards = gamerCards.filter(
    (gamerCard) => gamerCard.data.dataId !== card[0].data.dataId
  );
  const newGamersCards = { ...gameData.gamersCards };
  newGamersCards[playerName] = newGamerCards;

  const newData = {
    ...gameData,
    gamersCards: newGamersCards,
    activePlayer: newActivePlayer,
    card: card[0],
    usedCards: newUsedCards,
    rotation: newRotation,
    phase: unoPlayerName ? "uno" : "gaming",
    unoPlayerName,
    mustDraw,
    toDraw,
    hasFreelyDrawn: false,
  };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function drawCard({ roomId, roomToken, gameData, playerName }) {
  const { remainCards, mustDraw, toDraw, usedCards } = gameData;

  let { randomCard, newRemainCards } = getRandomCard(remainCards);

  let newUsedCards = usedCards;
  if (newRemainCards.length === 0) {
    newRemainCards = usedCards;
    newUsedCards = [];
  }

  const newToDraw = toDraw !== 0 ? toDraw - 1 : 0;
  let newMustDraw = mustDraw;
  let newActivePlayer = gameData.activePlayer;
  let hasFreelyDrawn = false;

  if (mustDraw && newToDraw === 0) {
    newActivePlayer = getNextGamer({ gameData, card: null }).newActivePlayer;
    newMustDraw = false;
  } else if (!mustDraw) {
    hasFreelyDrawn = true;
  }

  const gamerCards = gameData.gamersCards[playerName];
  const newGamerCards = [...gamerCards, { ...randomCard }];
  const newGamersCards = { ...gameData.gamersCards };
  newGamersCards[playerName] = newGamerCards;

  const newData = {
    ...gameData,
    gamersCards: newGamersCards,
    remainCards: newRemainCards,
    usedCards: newUsedCards,
    activePlayer: newActivePlayer,
    mustDraw: newMustDraw,
    toDraw: newToDraw,
    hasFreelyDrawn,
    phase: "gaming",
  };
  await saveAndDispatchData({ roomId, roomToken, newData });

  return randomCard;
}

export async function untriggerUnoPhase({ roomId, roomToken, gameData }) {
  const newData = {
    ...gameData,
    phase: "gaming",
  };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function triggerUnoFail({ roomId, roomToken, gameData }) {
  const { unoPlayerName } = gameData;
  const newActivePlayer = gameData.gamers.find(
    (gamer) => gamer.name === unoPlayerName
  );

  const newData = {
    ...gameData,
    activePlayer: newActivePlayer,
    mustDraw: true,
    toDraw: 2,
    phase: "gaming",
  };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function goEnd({ roomId, roomToken, gameData }) {
  const newData = {
    ...gameData,
    phase: "ended",
  };
  await saveAndDispatchData({ roomId, roomToken, newData });

  let counts = {};
  setTimeout(async () => {
    await Promise.all(
      gameData.gamers.map(async (gamer) => {
        if (gamer.multiGuest) {
          const count = (
            await prisma.multiguest.findFirst({ where: { id: gamer.dataId } })
          ).unoCount;
          counts[gamer.name] = count;
        } else {
          const count = (
            await prisma.user.findFirst({ where: { id: gamer.id } })
          ).unoCount;
          counts[gamer.name] = count;
        }
      })
    );

    const newData = {
      ...gameData,
      phase: "ended",
      ended: true,
      counts,
      activePlayer: null,
    };
    await saveAndDispatchData({ roomId, roomToken, newData });
  }, 3000);
}

export async function addCount({ user, count }) {
  if (user.multiGuest) {
    const oldCount = (
      await prisma.multiguest.findFirst({ where: { id: user.dataId } })
    ).unoCount;
    const newCount = oldCount + count;

    await prisma.multiguest.upsert({
      where: { id: user.dataId },
      update: { unoCount: newCount },
      create: {
        id: user.dataId,
        unoCount: newCount,
      },
    });
  } else {
    const oldCount = (await prisma.user.findFirst({ where: { id: user.id } }))
      .unoCount;
    const newCount = oldCount + count;

    await prisma.user.update({
      where: { id: user.id },
      data: { unoCount: newCount },
    });
  }
}

export async function goNewUnoGame({ roomId, roomToken, gameData }) {
  const { gamers } = gameData;
  let remainCards = Object.keys(unoCards).map((string) => parseInt(string));
  const { randomCard, newRemainCards } = getRandomCard(remainCards);
  const usedCards = [randomCard.id];
  remainCards = newRemainCards;
  const { startedCards, startedRemains } = getStartedCards({
    remainCards,
    gamersAndGuests: gamers,
  });

  const newData = {
    ...gameData,
    activePlayer: gamers[0],
    phase: "start",
    rotation: "clock",
    card: randomCard,
    remainCards: startedRemains,
    usedCards,
    startedCards,
    gamersCards: startedCards,
    mustDraw: false,
    toDraw: 0,
    ended: false,
    // options,
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
  const { gamers, startedCards, gamersCards, activePlayer, mustDraw, toDraw } =
    gameData;
  const onlineGamersList = onlineGamers.map((gamer) => gamer.userName);
  const onlineGamersSet = new Set(onlineGamersList);

  const remainingGamers = gamers.filter((gamer) =>
    onlineGamersSet.has(gamer.name)
  );

  const newStartedCards = Object.fromEntries(
    Object.entries(startedCards).filter(([gamerName]) =>
      onlineGamersSet.has(gamerName)
    )
  );

  const newGamersCards = Object.fromEntries(
    Object.entries(gamersCards).filter(([gamerName]) =>
      onlineGamersSet.has(gamerName)
    )
  );

  let newMustDraw;
  let newToDraw;
  let newActivePlayer;

  if (!onlineGamersSet.has(activePlayer.name)) {
    newActivePlayer = getNextGamer({
      gameData: { ...gameData, gamers: remainingGamers },
      card: null,
    }).newActivePlayer;
    newMustDraw = false;
    newToDraw = 0;
  } else {
    newActivePlayer = activePlayer;
    newMustDraw = mustDraw;
    newToDraw = toDraw;
  }

  const ended = remainingGamers.length < modesRules.uno.limits.min;

  const newData = {
    ...gameData,
    gamers: remainingGamers,
    startedCards: newStartedCards,
    gamersCards: newGamersCards,
    activePlayer: newActivePlayer,
    mustDraw: newMustDraw,
    toDraw: newToDraw,
    ended,
    admin: admins.newAdmin,
    viceAdmin: admins.newViceAdmin,
    arrivalsOrder,
  };

  await saveAndDispatchData({ roomId, roomToken, newData });
}
