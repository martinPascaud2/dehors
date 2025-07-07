const LOCK_TIMEOUT = 5000;

export default async function wait({ roomId, tries = 0 }) {
  if (tries > 50) {
    throw new Error("Too many attempts");
  }

  const now = new Date();

  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  const lockExpired =
    !room.lockedAt || now.getTime() - room.lockedAt.getTime() > LOCK_TIMEOUT;

  if (room.actionInProgress && !lockExpired) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return wait({ roomId, tries: tries + 1 });
  }

  await prisma.room.update({
    where: { id: roomId },
    data: {
      actionInProgress: true,
      lockedAt: now,
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 100));
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
