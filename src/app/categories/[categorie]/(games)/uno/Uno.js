"use client";

import { useState, useEffect } from "react";
import { MultiBackend, DndProvider, Preview } from "react-dnd-multi-backend";

import {
  playCard,
  drawCard,
  skipTurn,
  untriggerUnoPhase,
  triggerUnoFail,
  goEnd,
  addCount,
  goNewUnoGame,
  removeGamers,
} from "./gameActions";

import { DND } from "@/components/DND/DND";
import { HTML5toTouch } from "@/components/DND/HTML5toTouch";
import { generatePreview } from "@/components/DND/generatePreview";

import NextEndingPossibilities from "@/components/NextEndingPossibilities";
import Disconnected from "@/components/disconnection/Disconnected";

export default function Uno({
  roomId,
  roomToken,
  user,
  onlineGamers,
  gameData,
  storedLocation,
}) {
  const { gamers, phase, mustDraw, hasFreelyDrawn, unoPlayerName, counts } =
    gameData;
  const isAdmin = gameData.admin === user.name;
  const isActive = gameData.activePlayer?.id === user.id;
  const [items, setItems] = useState([]);
  const [gamerItems, setGamerItems] = useState([]);
  const [newHCs, setNewHCs] = useState(null);
  const [toDraw, setToDraw] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [choosingColor, setChoosingColor] = useState(false);
  const [isUno, setIsUno] = useState(false);
  const [availableCounter, setAvailableCounter] = useState(false);
  const [counterTimeout, setCounterTimeout] = useState(null);
  const [newHand, setNewHand] = useState(null);

  const [isEnded, setIsEnded] = useState(false);
  const [showNext, setShowNext] = useState(true);
  useEffect(() => {
    setIsEnded(gameData.ended || gameData.nextGame); // check
    // setIsEnded(!!gameData.ended);
    setShowNext(!!gameData.ended);
  }, [gameData.ended, gameData.nextGame]);

  const checkIsAllowed = ({
    itemType: newItemType,
    itemData: newItemData,
    handItems,
  }) => {
    if (!items[0]) return false;
    const { type: currItemType, data: currItemData } = items[0];
    const { color: currItemColor, text: currItemText } = currItemData;
    const { color: newItemColor, text: newItemText } = newItemData;

    if (phase === "start" && currItemColor === "custom") return true;

    const differentColor = newItemColor !== currItemColor;
    const differentText = newItemText !== currItemText;

    switch (newItemType) {
      case "number":
        if (differentColor && differentText) return false;
        break;
      case "+2":
        if (differentColor && differentText) return false;
        break;
      case "reverse":
        if (differentColor && differentText) return false;
        break;
      case "skip":
        if (differentColor && differentText) return false;
        break;
      case "joker":
        //always possible
        break;
      case "+4":
        for (let handItem of handItems) {
          const { data } = handItem;
          if (data.color === currItemColor || data.text === currItemText) {
            return false;
          }
        }
        break;
      default:
    }
    return true;
  };

  const onNewCard = async (card) => {
    if (card[0].data.color === "custom") {
      setIsLocked(true);
      setChoosingColor(true);
    } else {
      let unoPlayerName;
      if (gamerItems.length === 2) unoPlayerName = user.name;

      await playCard({
        card,
        gameData,
        roomId,
        roomToken,
        playerName: user.name,
        unoPlayerName,
      });
    }
  };

  const chooseColor = async (color) => {
    const dataSpecial = items[0].data;
    const coloredSpecial = [{ ...items[0], data: { ...dataSpecial, color } }];
    setChoosingColor(false);

    let unoPlayerName;
    if (gamerItems.length === 1) unoPlayerName = user.name;

    await playCard({
      card: coloredSpecial,
      gameData,
      roomId,
      roomToken,
      playerName: user.name,
      unoPlayerName,
    });
  };

  useEffect(() => {
    phase === "start" && setNewHCs(gameData.startedCards[user.name]);
  }, [phase]);

  useEffect(() => {
    setItems([{ id: 0, ...gameData.card }]);
    setIsLocked(!isActive || mustDraw);
    setToDraw(gameData.toDraw);
  }, [gameData.card, gameData.activePlayer]);

  useEffect(() => {
    if (phase === "uno") {
      if (unoPlayerName === user.name) {
        setIsUno(true);
      } else {
        setCounterTimeout(
          setTimeout(() => {
            setAvailableCounter(true);
          }, 3000)
        );
        setIsUno(false);
      }
    } else {
      setIsUno(false);
      clearTimeout(counterTimeout);
      setCounterTimeout(null);
      setAvailableCounter(false);
    }
    return () => {
      clearTimeout(counterTimeout);
    };
  }, [phase]);

  useEffect(() => {
    const end = async () => {
      if (
        gameData.gamersCards &&
        gameData.gamersCards[user.name].length === 0 &&
        phase !== "start" &&
        phase !== "ended"
      ) {
        await goEnd({ roomId, roomToken, gameData });
      }
    };
    end();
  }, [gameData, phase, user, roomId, roomToken]);

  useEffect(() => {
    if (phase === "ended") {
      let count = 0;
      gamerItems.forEach((item) => {
        if (item.type === "number") count += parseInt(item.data.text);
        else if (item.type === "+4") count += 50;
        else count += 20;
      });
      addCount({ user, count });
      setNewHand([]);
    }
  }, [phase]);

  return (
    <div className="relative animate-[fadeIn_1.5s_ease-in-out]">
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
            maxStageCards={1}
            gameName="uno"
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

          {isActive && (
            <div className="h-20">
              {!!toDraw && (
                <div>
                  Vous devez piocher {toDraw} carte{toDraw >= 2 ? "s" : ""}
                </div>
              )}
              {!hasFreelyDrawn && (
                <button
                  onClick={async () => {
                    if (hasFreelyDrawn) return;
                    const newCard = await drawCard({
                      roomId,
                      roomToken,
                      gameData,
                      playerName: user.name,
                    });
                    setNewHCs([
                      {
                        ...newCard,
                        id: 0,
                      },
                    ]);
                  }}
                  className="p-2 border border-blue-300 bg-blue-100"
                >
                  Piocher
                </button>
              )}
              {hasFreelyDrawn && (
                <button
                  onClick={() => skipTurn({ roomId, roomToken, gameData })}
                  className="p-2 border border-blue-300 bg-blue-100"
                >
                  Passer votre tour
                </button>
              )}
            </div>
          )}

          {choosingColor && (
            <div className="flex justify-around">
              <div
                onClick={() => chooseColor("red")}
                className="border-2 border-red-300 p-2"
              >
                Rouge
              </div>
              <div
                onClick={() => chooseColor("green")}
                className="border-2 border-green-300 p-2"
              >
                Vert
              </div>
              <div
                onClick={() => chooseColor("yellow")}
                className="border-2 border-yellow-300 p-2"
              >
                Jaune
              </div>
              <div
                onClick={() => chooseColor("blue")}
                className="border-2 border-blue-300 p-2"
              >
                Bleu
              </div>
            </div>
          )}

          {!isLocked && (
            <div className="flex justify-center">C&apos;est à vous !</div>
          )}
          <div className="flex flex-wrap w-full justify-around">
            {gamers?.map((gamer, i) => (
              <div
                key={i}
                className={`${
                  gameData.activePlayer?.name === gamer.name
                    ? "border-2 border-slate-300"
                    : ""
                }`}
              >
                {gamer.name}
              </div>
            ))}
          </div>

          {phase === "uno" && (
            <>
              {isUno && (
                <div
                  onClick={() =>
                    untriggerUnoPhase({ roomId, roomToken, gameData })
                  }
                  className="border border-blue-300 bg-blue-100"
                >
                  Uno !
                </div>
              )}
              {availableCounter && (
                <div
                  onClick={() =>
                    triggerUnoFail({ roomId, roomToken, gameData })
                  }
                  className="border border-blue-300 bg-blue-100"
                >
                  Contre Uno !
                </div>
              )}
            </>
          )}

          {phase === "ended" && counts && (
            <div>
              {Object.entries(counts).map((count, i) => (
                <div key={i}>
                  {count[0]} : {count[1]} point{count[1] >= 2 ? "s" : ""}
                </div>
              ))}
            </div>
          )}
        </DndProvider>
      </div>

      <NextEndingPossibilities
        isAdmin={isAdmin}
        isEnded={isEnded}
        gameData={gameData}
        roomToken={roomToken}
        roomId={roomId}
        reset={goNewUnoGame}
        storedLocation={storedLocation}
        user={user}
      />

      <Disconnected
        roomId={roomId}
        roomToken={roomToken}
        onlineGamers={onlineGamers}
        gamers={gamers}
        isAdmin={isAdmin}
        onGameBye={({ admins, arrivalsOrder }) =>
          removeGamers({
            roomId,
            roomToken,
            gameData,
            onlineGamers,
            admins,
            arrivalsOrder,
          })
        }
        modeName="uno"
        gameData={gameData}
        user={user}
      />
    </div>
  );
}
