"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import {
  goFirstRound,
  serverSucceed,
  serverFail,
  removeGamers,
} from "./gameActions";

import { XMarkIcon } from "@heroicons/react/24/outline";
import NextStep from "@/components/NextStep";
import NextEndingPossibilities from "@/components/NextEndingPossibilities";
import Disconnected from "@/components/disconnection/Disconnected";

const imageContext = require.context("./icons", false, /\.(png)$/);

const images = {};
const imagesNames = [];
let imageLength = 0;
imageContext.keys().forEach((path) => {
  const imageName = path.replace(/^\.\/(.*)\.png$/, "$1");
  !imageName.startsWith("src") &&
    (imagesNames.push(imageName),
    (images[imageName] = imageContext(path).default),
    imageLength++);
});

export default function Dobble({
  roomId,
  roomToken,
  user,
  onlineGamers,
  gameData,
  storedLocation,
}) {
  const isAdmin = gameData.admin === user.name;
  const { gamers } = gameData;
  const [roundNumber, setRoundNumber] = useState(0);
  const [scores, setScores] = useState([]);
  const [isEnded, setIsEnded] = useState(false);
  const [locked, setLocked] = useState(false);

  const [randomIcons, setRandomIcons] = useState([]);
  const [onlyWithOne, setOnlyWithOne] = useState([]);
  const sameKey = gameData.round?.sameKey;

  useEffect(() => {
    gameData.round?.number &&
      roundNumber !== gameData.round.number &&
      (setRoundNumber(gameData.round.number), setLocked(false));
  }, [gameData.round, roundNumber]);

  useEffect(() => {
    if (gameData.nextGame) return;

    setRandomIcons(gameData.round?.randomIcons);
    setOnlyWithOne(gameData.round?.onlyWithOne);

    const newScores = gameData.gamers
      ?.map((gamer) => ({
        name: gamer.name,
        score: gameData.count?.[gamer.name] || 0,
      }))
      .sort((a, b) => b.score - a.score);
    setScores(newScores);
  }, [gameData.round, gameData.count, gameData.gamers, gameData.nextGame]);

  useEffect(() => {
    if (roundNumber !== gameData.round?.number) return;
    const goFail = async () => {
      await serverFail({
        roomId,
        roomToken,
        roundNumber,
        imageLength,
        userName: user.name,
      });
    };

    if (
      locked &&
      (!gameData.recRounds ||
        !gameData.recRounds[gameData.round.number] ||
        !gameData.recRounds[gameData.round.number].failersList.some(
          (failer) => failer === user.name
        ))
    ) {
      goFail();
    }
  }, [
    locked,
    gameData.recRounds,
    gameData.round,
    roomId,
    roomToken,
    roundNumber,
    user.name,
  ]);

  const goSucceed = () => {
    serverSucceed({
      roomId,
      roomToken,
      gameData,
      imageLength,
      roundNumber,
      user,
    });
  };

  useEffect(() => {
    if (!scores) return;
    const winner = scores.find((score) => score.score === 10);
    if (winner) setIsEnded(true);
  }, [scores]);
  useEffect(() => {
    if (gameData.ended) setIsEnded(true);
  }, [gameData.ended]);

  return (
    <div className="relative animate-[fadeIn_1.5s_ease-in-out]">
      {isAdmin && roundNumber === 0 && (
        <NextStep
          onClick={() => {
            goFirstRound({ roomId, roomToken, gameData, imageLength });
          }}
        >
          Lancer
        </NextStep>
      )}

      <div className="overflow-y-auto">
        <div className="flex flex-row flex-wrap justify-center">
          <div className="w-full flex flex-col items-center justify-center">
            <div>Scores</div>
            {scores?.map((score) => (
              <div key={score.name}>
                {score.name} : {score.score}
              </div>
            ))}
          </div>

          {!isEnded ? (
            <>
              <div
                className={`w-[90vw] m-2 p-2 ${
                  randomIcons && "border"
                } flex flex-cols flex-wrap justify-around content-around ${
                  gameData.rotation?.top ? "rotate-180" : ""
                }`}
              >
                {randomIcons?.map((icon) => (
                  <Image
                    key={icon.key}
                    src={images[imagesNames[icon.key]]}
                    alt={imagesNames[icon.key]}
                    className=""
                    style={{
                      transform: `rotate(${icon.rotation}deg)`,
                      width: `${icon.size}vw`,
                      height: `${icon.size}vw`,
                    }}
                  />
                ))}
              </div>

              <div
                className={`w-[90vw] m-2 p-2 ${
                  onlyWithOne && "border"
                } flex flex-cols flex-wrap justify-around content-around ${
                  gameData.rotation?.bot ? "rotate-180" : ""
                }`}
              >
                {onlyWithOne?.map((icon) => (
                  <button
                    key={icon.key}
                    onClick={() => {
                      !locked &&
                        (sameKey === icon.key ? goSucceed() : setLocked(true));
                      // (goFail(), setLocked(true)));
                    }}
                    style={{
                      transform: `rotate(${icon.rotation}deg)`,
                      width: `${icon.size}vw`,
                      height: `${icon.size}vw`,
                    }}
                    className="relative"
                  >
                    <Image
                      src={images[imagesNames[icon.key]]}
                      alt={imagesNames[icon.key]}
                      className="m-2 p-2"
                    />
                    {locked && sameKey !== icon.key && (
                      <XMarkIcon className="absolute top-[4vw] left-[4vw] text-red-600" />
                    )}
                    {locked && sameKey === icon.key && (
                      <div
                        className={`absolute top-[2vw] left-[2vw] border border-green-600 rounded-full w-full h-full`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col">
                <div>{scores[0].name} remporte la partie !</div>
              </div>
            </>
          )}
        </div>
      </div>

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
        modeName="dobble"
        gameData={gameData}
        user={user}
      />
    </div>
  );
}
