"use client";

import { useRouter } from "next/navigation";

import { gamesRefs } from "@/assets/globals";

// check: to remove ?
export default function ChooseLastGame({
  lastGame,
  lastMode,
  lastPosition,
  group,
  roomToken,
}) {
  const router = useRouter();

  const goNextGame = () => {
    const nextGroup = { ...group };
    delete nextGroup.lastGame;
    nextGroup.roomToken = roomToken;
    nextGroup.lastPosition = lastPosition;

    localStorage.setItem("group", JSON.stringify(nextGroup));

    router.push(`/categories/${gamesRefs[lastGame].categorie}/${lastGame}`);
  };
  return (
    <>
      <div
        onClick={() => goNextGame()}
        className="border border-blue-300 bg-blue-100 w-fit"
      >
        Rejouer à {lastMode?.mode || gamesRefs[lastGame].name}
      </div>
    </>
  );
}
