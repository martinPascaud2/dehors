"use server";

import prisma from "./prisma";
import genToken from "./genToken";

export default async function putTmpAccountToken({ userId }) {
  const tmpToken = genToken(10);
  await prisma.user.update({
    where: { id: userId },
    data: { tmpToken },
  });
  return tmpToken;
}
