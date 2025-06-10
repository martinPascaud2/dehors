"use client";

import { useEffect, useState, useCallback } from "react";

import { formatWord } from "@/utils/formatWord";
import { removeChainGamers, removeTeamGamers } from "./gameActions";

import TeamDrawing from "./TeamDrawing";
import ChainDrawing from "./ChainDrawing";
import NextEndingPossibilities from "@/components/NextEndingPossibilities";
import Disconnected from "@/components/disconnection/Disconnected";

export default function Drawing({
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
        case "Esquissé":
          return removeChainGamers({
            roomId,
            roomToken,
            gameData,
            onlineGamers,
            admins,
            arrivalsOrder,
          });
        case "Pictionary":
          return removeTeamGamers({
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
      {mode === "Pictionary" && (
        <TeamDrawing
          roomId={roomId}
          roomToken={roomToken}
          user={user}
          gameData={gameData}
        />
      )}

      {mode === "Esquissé" && (
        <ChainDrawing
          roomId={roomId}
          roomToken={roomToken}
          user={user}
          gameData={gameData}
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
