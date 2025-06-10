"use client";

import { useEffect, useState, useCallback } from "react";

import { removeUndercoverGamers } from "./gameActions";

import NextEndingPossibilities from "@/components/NextEndingPossibilities";
import Disconnected from "@/components/disconnection/Disconnected";
import Undercover from "./Undercover";

export default function Secret({
  roomId,
  roomToken,
  user,
  onlineGamers,
  gameData,
  storedLocation,
}) {
  const mode = gameData.options?.mode;
  const isAdmin = gameData.admin === user.name;
  const [showNext, setShowNext] = useState(true);

  const [isEnded, setIsEnded] = useState(false);
  useEffect(() => {
    setIsEnded(!!gameData.ended);
    setShowNext(!!gameData.ended);
  }, [gameData.ended]);

  const removeGamers = useCallback(
    ({ roomId, roomToken, gameData, onlineGamers, admins, arrivalsOrder }) => {
      switch (mode) {
        case "Undercover":
          return removeUndercoverGamers({
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
      {mode === "Undercover" && (
        <Undercover
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
        reset={() => console.log("to be done")}
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
