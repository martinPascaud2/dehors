"use server";

import { initGamersAndGuests } from "@/utils/initGamersAndGuests";
import checkViceAdminAndArrivals from "@/utils/checkViceAdminAndArrivals";

export async function launchGame({
  roomId,
  roomToken,
  adminId,
  guests,
  multiGuests,
  options,
}) {
  const notStartedRoom = await prisma.room.findFirst({
    where: {
      id: roomId,
    },
  });

  const gamersAndGuests = initGamersAndGuests({
    adminId,
    gamers: notStartedRoom.gamers,
    guests,
    multiGuests,
  });
  const { newViceAdmin: viceAdmin, arrivalsOrder } =
    await checkViceAdminAndArrivals({
      roomId,
      admin: notStartedRoom.admin,
      viceAdmin: notStartedRoom.viceAdmin,
      gamersAndGuests,
    });

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: notStartedRoom.started,
    gameData: {
      admin: notStartedRoom.admin,
      viceAdmin,
      arrivalsOrder,
      gamers: gamersAndGuests,
      // ended: true,
      isSearching: true,
    },
  });

  return {};
}

// check: no removeGamers
