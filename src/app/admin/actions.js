"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import * as jose from "jose";

export async function adminConnect(prevState, formData) {
  const mail = formData.get("mail");
  const password = formData.get("password");

  const setCookieToken = async (status) => {
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
  };

  if (
    mail === process.env.ADMIN_MAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    setCookieToken("Admin");
    redirect(`/admin/app-edition`);
  } else {
    return {
      status: 424,
      message: "Identifiants incorrects ; veuillez réessayer.",
    };
  }
}
