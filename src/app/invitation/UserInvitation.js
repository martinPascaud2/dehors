"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UserInvitation({ searchParams, userName }) {
  const { categorie, gameName, token } = searchParams;
  const router = useRouter();

  useEffect(() => {
    if (!searchParams) return;
    const gameUrl = `${process.env.NEXT_PUBLIC_DEHORS_URL}/categories/${categorie}/${gameName}/?token=${token}`;
    setTimeout(() => router.push(gameUrl), 3000);
  }, [searchParams]);

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen">
      <div>Bienvenue {userName} !</div>
      <div>Veuillez patienter...</div>
    </div>
  );
}
