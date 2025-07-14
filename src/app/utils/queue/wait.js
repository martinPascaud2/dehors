import { randomUUID } from "crypto";

const LOCK_TIMEOUT = 10000;

export default async function wait({ roomId, tries = 0 }) {
  if (tries > 50) {
    throw new Error("Too many attempts");
  }

  const now = new Date();
  const lockId = randomUUID();

  const room = await prisma.room.updateMany({
    where: {
      id: roomId,
      actionInProgress: false,
    },
    data: {
      actionInProgress: true,
      lockedAt: now,
      lockId,
    },
  });

  if (room.count > 0) {
    return;
  }

  const existingRoom = await prisma.room.findUnique({
    where: { id: roomId },
  });

  const lockExpired =
    !existingRoom.lockedAt ||
    now.getTime() - existingRoom.lockedAt.getTime() > LOCK_TIMEOUT;

  if (lockExpired) {
    const override = await prisma.room.updateMany({
      where: {
        id: roomId,
        OR: [
          { actionInProgress: false },
          {
            lockedAt: {
              lt: new Date(Date.now() - LOCK_TIMEOUT),
            },
          },
        ],
      },
      data: {
        actionInProgress: true,
        lockedAt: now,
        lockId,
      },
    });

    if (override.count === 0) {
      await new Promise((r) => setTimeout(r, 200));
      return wait({ roomId, tries: tries + 1 });
    }

    const check = await prisma.room.findUnique({ where: { id: roomId } });
    if (check.lockId !== lockId) {
      await new Promise((r) => setTimeout(r, 200));
      return wait({ roomId, tries: tries + 1 });
    }

    return;
  }

  await new Promise((r) => setTimeout(r, 100));
  return wait({ roomId, tries: tries + 1 });
}

// export default async function wait({ roomId }) {
//   const room = await prisma.room.updateMany({
//     where: {
//       id: roomId,
//       actionInProgress: false,
//     },
//     data: {
//       actionInProgress: true,
//     },
//   });

//   if (room.count === 0) {
//     await new Promise((resolve) => setTimeout(resolve, 100));
//     return wait({ roomId });
//   }

//   await new Promise((resolve) => setTimeout(resolve, 100));
// }
