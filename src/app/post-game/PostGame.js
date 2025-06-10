"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { postGamesList } from "@/assets/globals";

import usePreventBackSwipe from "@/utils/usePreventBackSwipe";

import ThreeSmoke from "@/components/Room/ThreeSmoke";
import { StaticNextStep } from "@/components/NextStep";
import ControlButton from "@/components/ControlButton";
import LoadingRoomOctagon from "@/components/Room/LoadingRoomOctagon";

export default function PostGame({ user, postGames }) {
  usePreventBackSwipe();
  const { params: userParams } = user;
  const barsSizes = useMemo(
    () => ({
      bottom: userParams?.bottomBarSize || 8,
      top: userParams?.topBarSize || 8,
    }),
    [userParams?.bottomBarSize, userParams?.topBarSize]
  );
  const calculatedHeight = `calc(100dvh - ${barsSizes.top / 4}rem - ${
    barsSizes.bottom / 4
  }rem)`;
  const searchParams = useSearchParams();
  const searchGame = searchParams.get("game") || postGamesList[0].game;
  const back = Boolean(searchParams.get("back"));

  const [hasLoadingOctagonAnimated, setHasLoadingOctagonAnimated] =
    useState(false);
  useEffect(() => {
    setTimeout(() => setHasLoadingOctagonAnimated(true), 2900);
  }, []);

  const [selectedGame, setSelectedGame] = useState(searchGame);
  const [showedControls, setShowedControls] = useState(false);
  const [showedGameList, setShowedGameList] = useState(false);
  const [showedInfo, setShowedInfo] = useState(false);

  const selectionClass = (game) => {
    return `${
      game === selectedGame
        ? "border border-green-400 bg-green-100 text-green-400 p-2 h-16 w-28 text-center flex items-center justify-center"
        : "border border-blue-400 bg-blue-100 text-blue-400 p-2 h-12 w-24 text-center flex items-center justify-center"
    }`;
  };

  if (!hasLoadingOctagonAnimated && !back)
    return (
      <div
        className="h-screen w-full px-2 overflow-x-hidden bg-black"
        style={{
          paddingTop: `${barsSizes.top / 4}rem`,
          paddingBottom: `${barsSizes.bottom / 4}rem`,
        }}
      >
        <LoadingRoomOctagon isJoinStarted />
      </div>
    );

  return (
    <div
      onClick={() => {
        setShowedGameList(false);
        setShowedInfo(false);
        setShowedControls(false);
      }}
      className="w-full h-full relative"
      style={{
        paddingTop: `${barsSizes.top / 4}rem`,
        paddingBottom: `${barsSizes.bottom / 4}rem`,
      }}
    >
      <ThreeSmoke />

      <div
        className="w-full flex justify-center absolute"
        style={{
          height: `${calculatedHeight}`,
        }}
      >
        {!showedControls ? (
          <StaticNextStep
            onLongPress={() => {
              setShowedControls(true);
            }}
          >
            <div className="text-sm">{"Outils"}</div>
          </StaticNextStep>
        ) : (
          <>
            <div
              className="w-full absolute flex justify-around"
              style={{
                pointerEvents: "none",
                height: `${calculatedHeight}`,
              }}
            >
              <ControlButton
                layout="?"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowedInfo(true);
                  setShowedGameList(false);
                }}
              />
              <ControlButton
                layout="!"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowedInfo(false);
                  setShowedGameList(true);
                }}
              />
            </div>
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-20"
              style={{
                zIndex: 20,
                pointerEvents: "auto",
                bottom: 0,
              }}
            >
              <Link
                href={"/categories/?prelobby=true"}
                className="border border-blue-300 bg-blue-100 p-1"
              >
                Retour
              </Link>
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              <Link
                href={`/post-game/historical/?game=${selectedGame}`}
                className="border border-blue-300 bg-blue-100 p-1 mr-1 absolute right-0"
                style={{
                  bottom: `${barsSizes.bottom / 4}rem`,
                  zIndex: 20,
                }}
              >
                Historique
              </Link>
            </div>
          </>
        )}
      </div>

      {showedInfo && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-[90%] border rounded-md border-sky-700 bg-sky-100 text-sky-700 p-2 flex flex-col">
            <div className="text-sky-700 text-sm w-full flex items-center justify-center">
              Tu es sur la page des parties en cours
            </div>
            <div className="text-sky-700 text-sm w-full flex items-center justify-center">
              Ces parties ont moins de 10 jours
            </div>
            <div className="text-sky-700 text-sm w-full flex items-center justify-center">
              Pour les parties plus anciennes, consulte
            </div>
            <div className="text-sky-700 text-sm w-full flex items-center justify-center">
              l'historique
            </div>
          </div>
        </div>
      )}

      {showedGameList && (
        <div className="relative flex flex-col items-center justify-center gap-4 w-full h-full z-10">
          {postGamesList.map((postGame, i) => (
            <div
              key={i}
              onClick={() => {
                setSelectedGame(postGame.game);
                setShowedControls(false);
                setShowedGameList(false);
              }}
              className={selectionClass(postGame.game)}
            >
              {postGame.layout}
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          height: `calc(100dvh - ${barsSizes.top / 4}rem - ${
            barsSizes.bottom / 4
          }rem)`,
          margin: "4rem 0",
        }}
      >
        <div className="z-0 flex flex-col items-center w-full">
          <div>
            {postGamesList.filter((pg) => pg.game === selectedGame)[0].layout}
          </div>

          <div className="flex flex-col items-center w-full">
            {postGames[selectedGame].map((postGame, i) => {
              let ret;
              switch (postGame.gameName) {
                // case "triaction":
                //   ret = (
                //     <TriactionPG
                //       key={i}
                //       postGame={postGame}
                //       userName={user.name}
                //     />
                //   );
                //   break;
                default:
                  ret = null;
              }
              return ret;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
