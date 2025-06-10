"use client";

import { useEffect, useState, useCallback } from "react";

import { removeTriactionGamers } from "./gameActions";

import NextEndingPossibilities from "@/components/NextEndingPossibilities";
import Disconnected from "@/components/disconnection/Disconnected";
import Triaction from "./Triaction";

export default function Défi({
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
        case "Triaction":
          return removeTriactionGamers({
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
      {mode === "Triaction" && (
        <Triaction
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
        postgameRef={gameData.postgameRef}
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
