"use server";

import pusher from "@/utils/pusher";
import prisma from "@/utils/prisma";

import { saveAndDispatchData } from "@/components/Room/actions";
import checkPlayers from "@/utils/checkPlayers";
import { initGamersAndGuests } from "@/utils/initGamersAndGuests";
import checkViceAdminAndArrivals from "@/utils/checkViceAdminAndArrivals";

import { sortCards } from "./cardsData";

const getRandomCard = (remainCards) => {
  const randomCardIndex =
    remainCards[Math.floor(Math.random() * remainCards.length)];
  const randomCard = sortCards[randomCardIndex];
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
    for (let i = 6; i > 0; i--) {
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
  options,
}) {
  const { error: playersError } = checkPlayers({
    mode: "sort",
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

  let remainCards = Object.keys(sortCards).map((string) => parseInt(string));
  const { randomCard, newRemainCards } = getRandomCard(remainCards);

  const { startedCards, startedRemains } = getStartedCards({
    remainCards,
    gamersAndGuests,
  });

  const newData = {
    admin: startedRoom.admin,
    viceAdmin,
    arrivalsOrder,
    gamers: gamersAndGuests,
    activePlayer: gamersAndGuests[0],
    stageCards: [randomCard],

    // stageCards: [
    //   ...[{ ...randomCard }, { ...randomCard2 }, { ...randomCard3 }],
    // ],
    gamersCards: startedCards,
  };
  await saveAndDispatchData({ roomId, roomToken, newData });

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
  });

  return {};
}

export async function playCard({
  cards,
  gameData,
  roomId,
  roomToken,
  playerName,
}) {
  console.log("cards", cards);
  console.log("gameData", gameData);
  console.log("roomId", roomId);
  console.log("roomToken", roomToken);
  console.log("playerName", playerName);

  const newData = {
    ...gameData,
    stageCards: cards,
  };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

// to be done: removeGamers
