export default async function checkViceAdminAndArrivals({
  roomId,
  admin,
  viceAdmin,
  gamersAndGuests,
}) {
  const arrivalsOrder = (
    await prisma.room.findFirst({
      where: { id: roomId },
      select: {
        arrivalsOrder: {
          orderBy: { arrivalTime: "asc" },
        },
      },
    })
  ).arrivalsOrder;

  const hereSet = new Set(gamersAndGuests.map((gamer) => gamer.name));

  const checkedArrivalsOrder = arrivalsOrder.filter((arrival) =>
    hereSet.has(arrival.userName)
  );

  const newViceAdmin = arrivalsOrder.find(
    (arrival) => arrival.userName !== admin
  )?.userName;

  if (newViceAdmin !== viceAdmin) {
    await prisma.room.update({
      where: { id: roomId },
      data: { viceAdmin: newViceAdmin },
    });
  }

  return { newViceAdmin, arrivalsOrder: checkedArrivalsOrder };
}
