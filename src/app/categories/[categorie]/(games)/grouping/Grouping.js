"use client";
// check all
import ChooseOneMoreGame from "@/components/ChooseOneMoreGame";
import { useEffect, useState } from "react";

export default function Grouping({
  roomToken,
  user,
  gameData,
  storedLocation,
}) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (gameData.admin === user.name) setIsAdmin(true);
  }, [gameData.admin, user.name]);

  if (!isAdmin) return null;

  return null;

  return (
    <>
      {isAdmin && (
        <ChooseOneMoreGame
          gameData={gameData}
          roomToken={roomToken}
          isFirst={true}
          storedLocation={storedLocation}
        />
      )}
    </>
  );
}
