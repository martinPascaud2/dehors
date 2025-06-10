"use server";

import { cookies } from "next/headers";
import { jwtVerify } from "./jwtVerify";
import prisma from "./prisma";

export default async function getUser() {
  // const token = cookies().get("SG_token");

  const cookieStore = await cookies(); // check
  const token = cookieStore.get("SG_token");

  const { userMail } = await jwtVerify(token);

  let user;
  if (userMail)
    user = await prisma.user.findFirst({
      where: {
        email: userMail,
      },
    });

  return user;
}

export async function getUserParams() {
  const token = cookies().get("SG_token");
  const { userMail } = await jwtVerify(token);

  const userParams = (
    await prisma.user.findFirst({
      where: {
        email: userMail,
      },
    })
  )?.params;

  return userParams;
}
