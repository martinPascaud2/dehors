"use client";

import { useState, useEffect } from "react";

import { MultiBackend, DndProvider, Preview } from "react-dnd-multi-backend";
import { DND } from "@/components/DND/DND";
import { HTML5toTouch } from "@/components/DND/HTML5toTouch";
import { generatePreview } from "@/components/DND/generatePreview";

import { playCard } from "./gameActions";

import NextEndingPossibilities from "@/components/NextEndingPossibilities";
import Disconnected from "@/components/disconnection/Disconnected";

export default function Sort({
  roomId,
  roomToken,
  user,
  onlineGamers,
  gameData,
  storedLocation,
}) {
  const isAdmin = gameData.admin === user.name;
  const isActive = gameData.activePlayer?.id === user.id;
  const { gamers } = gameData;

  const [isEnded, setIsEnded] = useState(false);
  const [showNext, setShowNext] = useState(true);

  const [items, setItems] = useState([]);
  const [gamerItems, setGamerItems] = useState([]);
  const [newHCs, setNewHCs] = useState(null);
  const [newHand, setNewHand] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    setIsEnded(!!gameData.ended);
    setShowNext(!!gameData.ended);
  }, [gameData.ended]);

  useEffect(() => {
    if (!gameData.stageCards) return;
    console.log("gameData.stageCards", gameData.stageCards);
    // setItems([{ id: 0, ...gameData.card }]);
    // setItems([{ id: 0, ...gameData.stageCards }]);
    setItems([[...gameData.stageCards]][0]);
    setIsLocked(!isActive);
    //   }, [gameData.card, gameData.activePlayer, isActive]);
  }, [gameData.stageCards, gameData.activePlayer, isActive]);

  const checkIsAllowed = ({
    itemType: newItemType,
    itemData: newItemData,
    handItems,
  }) => {
    return true;
    if (!items[0]) return false;
    const { type: currItemType, data: currItemData } = items[0];
    const { color: currItemColor, text: currItemText } = currItemData;
    const { color: newItemColor, text: newItemText } = newItemData;

    return true;
  };

  const onNewCard = async (cards) => {
    console.log("cards", cards);

    await playCard({
      cards,
      gameData,
      roomId,
      roomToken,
      playerName: user.name,
    });

    //   await playCard({
    //     card,
    //     gameData,
    //     roomId,
    //     roomToken,
    //     playerName: user.name,
    //     unoPlayerName,
    //   });
  };

  console.log("gameData", gameData);
  console.log("items sort", items);

  return (
    <div className="overflow-y-auto">
      <DndProvider backend={MultiBackend} options={HTML5toTouch}>
        <Preview>{generatePreview}</Preview>
        <DND
          items={items}
          setItems={setItems}
          setGamerItems={setGamerItems}
          oneShot={true}
          newHCs={newHCs}
          setNewHCs={setNewHCs}
          maxStageCards={10}
          gameName="sort"
          isLocked={isLocked}
          checkIsAllowed={checkIsAllowed}
          onNewItems={onNewCard}
          newHand={newHand}
          setNewHand={setNewHand}
          // for coming back
          dataGamerCards={
            gameData.gamersCards && gameData.gamersCards[user.name]
          }
        />
      </DndProvider>

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
        gamers={gamers}
        isAdmin={isAdmin}
        onGameBye={async ({ admins, arrivalsOrder }) => {
          await removeGamers({
            roomId,
            roomToken,
            gameData,
            onlineGamers,
            imageLength,
            admins,
            arrivalsOrder,
          });
        }}
        modeName="sort"
        gameData={gameData}
        user={user}
      />
    </div>
  );
}
