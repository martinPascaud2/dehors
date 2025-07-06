import { NextResponse } from "next/server";

import { jwtVerify } from "@/utils/jwtVerify";
import { checkGuestAllowed } from "@/utils/checkGuestAllowed";

export async function middleware(request) {
  if (
    request.nextUrl.pathname.startsWith("/sw.js") ||
    request.nextUrl.pathname.startsWith("/workbox") ||
    request.nextUrl.pathname.startsWith("/manifest.json") ||
    request.nextUrl.pathname.startsWith("/icon") ||
    request.nextUrl.pathname.startsWith("/categoriesIcons/") ||
    request.nextUrl.pathname.startsWith("/smoke") ||
    request.nextUrl.pathname.startsWith("/position")
  ) {
    console.log("000 request.nextUrl.pathname", request.nextUrl.pathname);

    return NextResponse.next();
  }

  //isolate the client's requested path
  if (request.nextUrl.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("SG_token");

  if (
    !token &&
    request.nextUrl.pathname !== "/" &&
    request.nextUrl.pathname !== "/signin/" &&
    request.nextUrl.pathname !== "/admin/" &&
    request.nextUrl.pathname !== "/invitation/" &&
    request.nextUrl.pathname !== "/guest/"
  ) {
    console.log("111 request.nextUrl.pathname", request.nextUrl.pathname);
    return NextResponse.redirect(new URL("/", request.url));
  }

  const { userStatus } = await jwtVerify(token);

  if (
    token &&
    (request.nextUrl.pathname === "/" ||
      request.nextUrl.pathname === "/signin/") &&
    userStatus !== "Guest"
  ) {
    console.log("222 request.nextUrl.pathname", request.nextUrl.pathname);

    return NextResponse.redirect(new URL("/categories", request.url));
  }

  if (
    userStatus === "Guest" &&
    request.nextUrl.pathname !== "/guest/" &&
    request.nextUrl.pathname !== "/" &&
    !checkGuestAllowed(request.nextUrl.href) &&
    request.nextUrl.pathname !== "/invitation/" &&
    request.nextUrl.pathname !== "/categories/back/backToLobby/" &&
    request.nextUrl.pathname !== "/api/pusherAuth/" &&
    !request.nextUrl.pathname.startsWith("/categoriesIcons/") &&
    !request.nextUrl.pathname.startsWith("/smoke")
  ) {
    console.log("333 request.nextUrl.pathname", request.nextUrl.pathname);

    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    userStatus !== "Admin" &&
    request.nextUrl.pathname.startsWith("/admin/app-edition/")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (userStatus === "User" && request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (
    userStatus === "Admin" &&
    !request.nextUrl.pathname.startsWith("/admin/app-edition/")
  ) {
    return NextResponse.redirect(new URL("/admin/app-edition/", request.url));
  }

  return NextResponse.next();
}
