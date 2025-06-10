"use server";

import cancelBack from "@/utils/cancelBack";

export default async function updateRoomLeavers({
  roomId,
  gamers,
  disconnectedList,
}) {
  const disconnectedSet = new Set(disconnectedList);

  const newLeaversArray = gamers.filter((gamer) =>
    disconnectedSet.has(gamer.name)
  );

  await Promise.all(
    newLeaversArray.map(async (newLeaver) => {
      !newLeaver.multiGuest && (await cancelBack({ userId: newLeaver.id }));
    })
  );

  const newLeaversObject = {};
  newLeaversArray.forEach((newLeaver) => {
    newLeaversObject[newLeaver.name] = newLeaver;
  });

  const room = await prisma.room.findFirst({ where: { id: roomId } });

  const prevHaveLeft = room.haveLeft || {};
  const newHaveLeft = { ...prevHaveLeft, ...newLeaversObject };

  const newGamers = { ...room.gamers };
  Object.keys(room.gamers).forEach((gamerName) => {
    if (disconnectedSet.has(gamerName)) delete newGamers[gamerName];
  });

  await prisma.room.update({
    where: { id: roomId },
    data: { haveLeft: newHaveLeft, gamers: newGamers },
  });
}
