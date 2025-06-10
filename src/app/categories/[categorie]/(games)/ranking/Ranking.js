"use client";

import { useEffect, useState, useCallback } from "react";

import { goNewPodium, removePodiumGamers } from "./gameActions";

import NextEndingPossibilities from "@/components/NextEndingPossibilities";
import Disconnected from "@/components/disconnection/Disconnected";
import Podium from "./Podium";

export default function Ranking({
  roomId,
  roomToken,
  user,
  onlineGamers,
  gameData,
  storedLocation,
}) {
  const mode = gameData.options?.mode;
  const isAdmin = gameData.admin === user.name;
  const [isEnded, setIsEnded] = useState(false);
  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    setIsEnded(!!gameData.ended);
    setShowNext(!!gameData.ended);
  }, [gameData.ended]);

  const removeGamers = useCallback(
    ({ roomId, roomToken, gameData, onlineGamers, admins, arrivalsOrder }) => {
      switch (mode) {
        case "Podium":
          return removePodiumGamers({
            roomId,
            roomToken,
            gameData,
            onlineGamers,
            admins,
            arrivalsOrder,
          });
      }
    },
    [mode]
  );

  return (
    <>
      {mode === "Podium" && (
        <Podium
          roomId={roomId}
          roomToken={roomToken}
          user={user}
          gameData={gameData}
          setShowNext={setShowNext}
        />
      )}

      <NextEndingPossibilities
        isAdmin={isAdmin}
        isEnded={isEnded}
        gameData={gameData}
        roomToken={roomToken}
        roomId={roomId}
        reset={() => goNewPodium({ gameData, roomId, roomToken })}
        storedLocation={storedLocation}
        user={user}
        showed={showNext}
      />

      <Disconnected
        roomId={roomId}
        roomToken={roomToken}
        onlineGamers={onlineGamers}
        gamers={gameData.gamers}
        isAdmin={isAdmin}
        onGameBye={async ({ admins, arrivalsOrder }) => {
          await removeGamers({
            roomId,
            roomToken,
            gameData,
            onlineGamers,
            admins,
            arrivalsOrder,
          });
        }}
        modeName={mode}
        gameData={gameData}
        user={user}
      />
    </>
  );
}
