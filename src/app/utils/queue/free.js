export default async function free({ roomId }) {
  await prisma.room.update({
    where: { id: roomId },
    data: { actionInProgress: false },
  });
}
