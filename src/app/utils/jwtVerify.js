import * as jose from "jose";

export async function jwtVerify(token) {
  if (!token?.value) return { payload: null, protectedHeader: null };
  const secret = new TextEncoder().encode(process.env.PRIVATE_KEY);
  const { payload, protectedHeader } = await jose.jwtVerify(
    token.value,
    secret
  );

  return {
    userStatus: payload.sub,
    userMail: payload.mail,
    protectedHeader,
  };
}
