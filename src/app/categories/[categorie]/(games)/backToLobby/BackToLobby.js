"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function BackToLobby({ path, user, guestName }) {
  const router = useRouter();

  const searchParams = useSearchParams();
  const categorie = searchParams.get("categorie");
  const game = searchParams.get("game");

  // no path when admin
  const href = !path
    ? `/categories/${categorie}/${game}/`
    : `${path}&guestName=${guestName}`;

  useEffect(() => {
    setTimeout(() => router.push(href), 0);
  }, []);

  return <div className="h-screen w-screen bg-black" />;
}
