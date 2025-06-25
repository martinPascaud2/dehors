"use client";

import { useEffect, useState, useCallback } from "react";

import { removeStandardGamers, goNewHunting } from "./gameActions";

import NextEndingPossibilities from "@/components/NextEndingPossibilities";
// import Disconnected from "@/components/disconnection/Disconnected";
import Hunting from "./Hunting";

export default function Research({
  roomId,
  roomToken,
  user,
  onlineGamers,
  gameData,
  storedLocation,
  setGameBackground,
}) {
  const mode = gameData.options?.mode;
  const isAdmin = gameData.admin === user.name;
  const [showNext, setShowNext] = useState(false);

  const [isEnded, setIsEnded] = useState(false);
  useEffect(() => {
    setIsEnded(!!gameData.ended);
    setShowNext(!!gameData.ended);
  }, [gameData.ended]);

  const removeGamers = useCallback(
    ({ roomId, roomToken, gameData, onlineGamers, admins, arrivalsOrder }) => {
      switch (mode) {
        case "Hunted":
          return removeStandardGamers({
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
      {mode === "Hunted" && (
        <Hunting
          roomId={roomId}
          roomToken={roomToken}
          user={user}
          gameData={gameData}
          setShowNext={setShowNext}
          setGameBackground={setGameBackground}
        />
      )}

      <NextEndingPossibilities
        isAdmin={isAdmin}
        isEnded={isEnded}
        gameData={gameData}
        roomToken={roomToken}
        roomId={roomId}
        reset={() => {
          switch (mode) {
            case "Hunted":
              goNewHunting({ gameData, roomId, roomToken });
          }
        }}
        storedLocation={storedLocation}
        user={user}
        showed={showNext}
      />

      {/* <Disconnected
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
      /> */}
    </>
  );
}
