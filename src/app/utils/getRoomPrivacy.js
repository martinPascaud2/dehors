"use server";

import prisma from "./prisma";

export default async function getRoomPrivacy({ roomToken }) {
  const room = await prisma.room.findFirst({ where: { token: roomToken } });

  return room.private;
}
