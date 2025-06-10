export default async function wait({ roomId }) {
  const room = await prisma.room.updateMany({
    where: {
      id: roomId,
      actionInProgress: false,
    },
    data: {
      actionInProgress: true,
    },
  });

  if (room.count === 0) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return wait({ roomId });
  }

  await new Promise((resolve) => setTimeout(resolve, 100));
}
