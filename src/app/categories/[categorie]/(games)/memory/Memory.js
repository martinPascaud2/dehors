"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import isEqual from "lodash.isequal";

import {
  getIcons,
  revealCard,
  hideUndiscovered,
  prepareNewGame,
  goNewMemoryGame,
  removeGamers,
} from "./gameActions";
import { loadImages } from "./loadImages";
import { syncNewOptions } from "@/components/Room/actions";

import Card from "./Card";
const CardMemo = React.memo(Card);
import NextEndingPossibilities from "@/components/NextEndingPossibilities";
import Disconnected from "@/components/disconnection/Disconnected";
import MemoryOptions from "./Options";

export default function Memory({
  roomId,
  roomToken,
  user,
  onlineGamers,
  gameData,
  storedLocation,
}) {
  const { success, roundScores, totalScores, scoresEvolution, gamers } =
    gameData;
  const isAdmin = gameData.admin === user.name;
  const [isActive, setIsActive] = useState(false);

  const [images, setImages] = useState({});
  const [imagesNames, setImagesNames] = useState([]);
  const [imageLength, setImageLength] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeIcons, setActiveIcons] = useState();
  const [triggeredNumber, setTriggeredNumber] = useState(0);

  const [isEnded, setIsEnded] = useState(false);
  const [showNext, setShowNext] = useState(true);
  const [options, setOptions] = useState(gameData.options);
  const [serverMessage, setServerMessage] = useState("");
  const [newGame, setNewGame] = useState(false);

  useEffect(() => {
    if (
      !isAdmin ||
      isLoaded ||
      !gameData ||
      !gameData.options ||
      !gameData.options.themes ||
      !gameData.options.pairsNumber ||
      Object.keys(images).length ||
      imagesNames.length ||
      imageLength
    )
      return;

    const adminLoad = async () => {
      const {
        images: loadedImages,
        imagesNames: loadedImagesNames,
        imageLength: loadedImageLength,
      } = await loadImages({
        prefixes: gameData.options.themes,
        pairsNumber: gameData.options.pairsNumber,
        gameData,
        roomToken,
        roomId,
      });

      setImages(loadedImages);
      setImagesNames(loadedImagesNames);
      setImageLength(loadedImageLength);
      setIsLoaded(true);
    };
    adminLoad();
  }, [gameData.options]);

  useEffect(() => {
    if (isAdmin || !gameData.adminLoad) return;

    const {
      images: loadedImages,
      imagesNames: loadedImagesNames,
      imageLength: loadedImageLength,
    } = gameData.adminLoad;

    setImages(loadedImages);
    setImagesNames(loadedImagesNames);
    setImageLength(loadedImageLength);
  }, [gameData.adminLoad, isAdmin]);

  useEffect(() => {
    setIsEnded(!!gameData.ended);
    setShowNext(!!gameData.ended);
  }, [gameData.ended]);

  useEffect(() => {
    if (!gameData.options || !imageLength || gameData.icons?.length) return;

    async function initialize() {
      await getIcons({
        imageLength,
        pairsNumber: gameData.options.pairsNumber,
        roomToken,
        roomId,
        gameData,
      });
    }
    if (isAdmin && !initialized) {
      initialize();
      setInitialized(true);
    }
  }, [isAdmin, gameData.options, imageLength]);

  useEffect(() => {
    if (!gameData) return;

    if (
      (gameData.activePlayer?.id === user.id ||
        (gameData.activePlayer?.guest && isAdmin)) &&
      triggeredNumber < 2
    ) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [gameData.activePlayer, triggeredNumber, isAdmin]);

  useEffect(() => {
    const triggered = gameData.icons?.filter((icon) => icon.triggered).length;

    //+ triggeredNumber: no save between reveals
    if (triggered >= 2 || triggeredNumber >= 2) {
      setIsActive(false);
      setTimeout(
        async () => {
          isActive && (await hideUndiscovered({ roomId, roomToken, gameData }));
        },
        !success ? 1000 : 0
      );
      setTimeout(
        () => {
          setTriggeredNumber(0);
          setIsActive(true);
        },
        !success ? 2000 : 400
      );
    }
  }, [gameData.icons, isActive]);

  const roundScoresList = useMemo(
    () => (
      <div className="flex flex-col items-center m-2">
        Paires trouvées
        {roundScores?.map((score, i) => (
          <div key={i}>
            {Object.entries(score)[0][0]} : {Object.entries(score)[0][1]}
          </div>
        ))}
      </div>
    ),
    [roundScores]
  );
  const totalScoresList = useMemo(
    () => (
      <div className="flex flex-col items-center m-2">
        <span className="font-semibold">Scores</span>
        {totalScores?.map((score, i) => {
          const [gamerName, gamerScore] = Object.entries(score)[0];
          const gamerRoundFound = Object.values(
            roundScores.find(
              (roundScore) => Object.keys(roundScore)[0] === user.name
            )
          )[0];
          return (
            <div key={i}>
              <span className="font-semibold">{gamerName}</span>
              &nbsp;:&nbsp;
              <span>
                {gamerRoundFound} paire{gamerRoundFound >= 2 ? "s " : " "}
                {"=> "}
              </span>
              {scoresEvolution && scoresEvolution[gamerName]
                ? `+${scoresEvolution[gamerName]} `
                : "+0 "}
              {"=> "}
              <span className="font-semibold">{gamerScore} &nbsp;</span>
            </div>
          );
        })}
      </div>
    ),
    [totalScores, scoresEvolution, roundScores]
  );

  const CardList = useCallback(() => {
    if (!gameData.icons || !Object.keys(images).length || !imagesNames.length)
      return;

    return (
      <div className="flex flex-wrap justify-center">
        {gameData?.icons?.map((icon, i) => {
          const { triggered, discovered } = icon;
          return (
            <CardMemo
              key={i}
              index={i}
              src={images[imagesNames[icon.key]]}
              triggered={triggered}
              discovered={discovered}
              isActive={isActive}
            />
          );
        })}
      </div>
    );
  }, [gameData.icons, images, imagesNames, isActive]);

  useEffect(() => {
    if (!gameData.icons || triggeredNumber !== 0) return;
    setActiveIcons(gameData.icons);
  }, [gameData.icons, triggeredNumber]);

  const ActiveCardList = useCallback(() => {
    if (!activeIcons || !Object.keys(images).length || !imagesNames.length)
      return;

    const reveal = ({ index }) => {
      if (!isActive || triggeredNumber >= 2) return;

      setTriggeredNumber((prevTrigs) => prevTrigs + 1);

      const revealData = { ...gameData, icons: activeIcons };
      revealCard({ roomToken, gameData: revealData, index });

      setActiveIcons((prevActive) => {
        const icon = prevActive[index];
        const newIcon = { ...icon, triggered: true };
        const newActiveIcons = [...prevActive];
        newActiveIcons[index] = newIcon;
        return newActiveIcons;
      });
    };

    return (
      <div className="flex flex-wrap justify-center">
        {activeIcons.map((icon, i) => {
          const { triggered, discovered } = icon;
          return (
            <CardMemo
              key={i}
              index={i}
              src={images[imagesNames[icon.key]]}
              triggered={triggered}
              discovered={discovered}
              isActive={isActive}
              reveal={
                !isEnded
                  ? reveal
                  : () => {
                      return;
                    }
              }
            />
          );
        })}
      </div>
    );
  }, [activeIcons, triggeredNumber]);

  const RenderedCardList = !isActive ? CardList : ActiveCardList;

  useEffect(() => {
    setNewGame(gameData.newGame);
  }, [gameData.newGame]);
  useEffect(() => {
    if (!newGame) return;
    setIsActive(false);
    setImages({});
    setImagesNames([]);
    setImageLength(0);
    setInitialized(false);
    setIsLoaded(false);
    setTriggeredNumber(0);
    setIsEnded(false);
    setServerMessage("");
    setNewGame(false);
  }, [newGame]);
  useEffect(() => {
    setOptions((prevOptions) => {
      const isOptionsDifferent = !isEqual(prevOptions, gameData.options);
      if (isOptionsDifferent) return gameData.options;
      else return prevOptions;
    });
  }, [gameData.options]);

  //sync new game options
  useEffect(() => {
    if (!isAdmin) return;
    const gameDataOptions = gameData.options;
    if (isEqual(gameDataOptions, options)) return;
    const syncOptions = async () => {
      await syncNewOptions({ roomToken, gameData, options });
    };
    syncOptions();
  }, [options]);

  const Options = useCallback(
    () => (
      <MemoryOptions
        isAdmin={isAdmin}
        options={options}
        setOptions={setOptions}
        userId={user.id}
        setServerMessage={setServerMessage}
        modeSelector={false}
      />
    ),
    [isAdmin, options, user.id]
  );

  return (
    <div className="relative overflow-y-auto animate-[fadeIn_1.5s_ease-in-out]">
      <div>
        {!isEnded && (
          <>
            {roundScoresList}
            <div>C&apos;est au tour de {gameData.activePlayer?.name}</div>
            {RenderedCardList()}
          </>
        )}

        {isEnded && (
          <>
            {totalScoresList}
            {Options()}
          </>
        )}
      </div>

      <NextEndingPossibilities
        isAdmin={isAdmin}
        isEnded={isEnded}
        gameData={gameData}
        roomToken={roomToken}
        roomId={roomId}
        reset={async () => {
          await prepareNewGame({ roomToken, gameData });
          await goNewMemoryGame({
            userId: user.id,
            roomToken,
            gameData: { ...gameData, adminLoad: null },
            options,
          });
        }}
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
        modeName="Memory"
        gameData={gameData}
        user={user}
      />
    </div>
  );
}
