"use server";

import * as jose from "jose";
import { cookies } from "next/headers";

export async function setCookieToken(status, mail) {
  const secret = new TextEncoder().encode(process.env.PRIVATE_KEY);
  const alg = "HS256";

  const jwt = await new jose.SignJWT({
    [process.env.NEXT_PUBLIC_DEHORS_URL]: true,
    mail,
  })
    .setProtectedHeader({ alg })
    .setSubject(status)
    .sign(secret);

  cookies().set({
    name: "SG_token",
    value: jwt,
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 10,
  });
}
