"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { postGamesList } from "@/assets/globals";

import formatDate from "@/utils/formatDate";
import usePreventBackSwipe from "@/utils/usePreventBackSwipe";

import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Historical({ barsSizes, postGames }) {
  usePreventBackSwipe();
  const searchParams = useSearchParams();
  const searchGame = searchParams.get("game") || postGamesList[0].game;

  return (
    <>
      <div
        className={`fixed h-[${barsSizes.top / 4}rem] w-full z-[70] bg-black`}
        style={{
          height: `${barsSizes.top / 4}rem`,
        }}
      />
      <div
        className={`fixed h-[${
          barsSizes.bottom / 4
        }rem] w-full z-[70] bg-black bottom-0`}
        style={{ height: `${barsSizes.bottom / 4}rem` }}
      />

      <Link
        href={`/post-game/?game=${searchGame}&back=true`}
        className="absolute z-20 border border-blue-300 bg-blue-100 p-2"
        style={{ top: `${barsSizes.top / 4}rem` }}
      >
        Retour
      </Link>

      <div className="absolute h-full w-full z-0 flex flex-col items-center justify-start">
        <div
          className={`overflow-y-auto z-[60] w-full`}
          style={{
            height: `calc(100dvh - ${barsSizes.top / 4}rem)`,
            marginTop: `${barsSizes.top / 4}rem`,
            marginBottom: `${barsSizes.bottom / 4}rem`,
          }}
        >
          <div className="font-bold text-center text-lg">
            {postGamesList.filter((pg) => pg.game === searchGame)[0].layout}
          </div>

          {postGames[searchGame].map((postGame, i) => {
            const { createdAt: date } = postGame;
            const { actions } = postGame.gameData;

            return (
              <div key={i} className="flex flex-col">
                <div className="text-center w-full font-semibold">
                  {formatDate(date)}
                </div>

                {Object.entries(actions).map(([gamer, actions]) => {
                  const { backed, proposedBack, kept } = actions;
                  console.log("backed", backed);
                  return (
                    <div key={gamer} className="ml-4 flex my-2">
                      <div>
                        {gamer}&nbsp;{"=>"}&nbsp;
                      </div>
                      <ul>
                        <li className="flex">
                          {`\u2022`}&#34;{backed.action}&#34;(
                          <span className="italic">{backed.from}</span>)
                          {backed.done ? (
                            <CheckIcon className="h-6 w-6 text-green-600" />
                          ) : (
                            <XMarkIcon className="h-6 w-6 text-red-600" />
                          )}
                        </li>
                        <li className="flex">
                          {`\u2022`}&#34;{proposedBack.action}&#34;(
                          <span className="italic">{proposedBack.from}</span>)
                          {proposedBack.done ? (
                            <CheckIcon className="h-6 w-6 text-green-600" />
                          ) : (
                            <XMarkIcon className="h-6 w-6 text-red-600" />
                          )}
                        </li>
                        <li className="flex">
                          {`\u2022`}&#34;{kept.action}&#34;(
                          <span className="italic">{kept.from}</span>)
                          {kept.done ? (
                            <CheckIcon className="h-6 w-6 text-green-600" />
                          ) : (
                            <XMarkIcon className="h-6 w-6 text-red-600" />
                          )}
                        </li>
                      </ul>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
