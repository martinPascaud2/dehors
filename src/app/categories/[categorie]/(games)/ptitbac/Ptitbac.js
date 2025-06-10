"use client";

import { useEffect, useState, useCallback, useRef } from "react";

import levenshtein from "@/utils/levenshtein";
import {
  startCountdown,
  sendResponses,
  goValidation,
  refereeTrigger,
  validate,
  manageEmptyTheme,
  removeGamers,
} from "./gameActions";

import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

import CountDown from "@/components/CountDown";
import NextStep from "@/components/NextStep";
import NextEndingPossibilities from "@/components/NextEndingPossibilities";
import Disconnected from "@/components/disconnection/Disconnected";

function gatherGroups({ groups, threshold }) {
  const gatheredGroups = [...groups];

  let merged = true;
  while (merged) {
    merged = false;

    for (let i = 0; i < gatheredGroups.length; i++) {
      for (let j = i + 1; j < gatheredGroups.length; j++) {
        if (
          gatheredGroups[i].some((firstMember) =>
            gatheredGroups[j].some(
              (secondMember) =>
                levenshtein(
                  firstMember.response.word,
                  secondMember.response.word
                ) <= threshold
            )
          )
        ) {
          gatheredGroups[i] = [
            ...new Set([...gatheredGroups[i], ...gatheredGroups[j]]),
          ];
          gatheredGroups.splice(j, 1);
          merged = true;
          break;
        }
      }
      if (merged) break;
    }
  }

  return gatheredGroups;
}

function groupSimilarWords(responses, threshold = 1) {
  const groups = [];
  const visited = new Set();

  Object.entries(responses).forEach((res) => {
    if (!visited.has(res[0])) {
      const group = [{ gamer: res[0], response: res[1] }];
      visited.add(res[0]);

      Object.entries(responses).forEach((otherRes) => {
        if (
          !visited.has(otherRes[0]) &&
          levenshtein(res[1].word, otherRes[1].word) <= threshold
        ) {
          group.push({ gamer: otherRes[0], response: otherRes[1] });
          visited.add(otherRes[0]);
        }
      });

      groups.push(group);
    }
  });

  const gatheredGroups = gatherGroups({ groups, threshold });

  return gatheredGroups;
}

export default function Ptitbac({
  roomId,
  roomToken,
  user,
  onlineGamers,
  gameData,
  storedLocation,
}) {
  const isAdmin = gameData.admin === user.name;
  const isReferee = isAdmin; //check
  const {
    gamers,
    phase,
    hasFirstTurn,
    letter,
    themes,
    finishCountdownDate,
    counts,
    lastTurnCounts,
    winners,
  } = gameData;

  const [responses, setResponses] = useState(
    Array.from({ length: themes?.length }, () => "")
  );
  const inputRefs = useRef([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);

  const [valTheme, setValTheme] = useState("");
  const [themesResponses, setThemesResponses] = useState({});
  const [allFalse, setAllFalse] = useState();
  const [refereeValidation, setRefereeValidation] = useState({});
  const [isEnded, setIsEnded] = useState(false);
  const [showNext, setShowNext] = useState(true);

  useEffect(() => {
    inputRefs?.current[0]?.focus();
  }, [inputRefs, phase, themes]);

  useEffect(() => {
    setIsEnded(!!gameData.ended);
    setShowNext(!!gameData.ended);
  }, [gameData.ended]);

  const handleChange = (e, i) => {
    if (e.target.value.length === 0 || hasValidated) return;
    const newResponses = [...responses];
    newResponses[i] =
      e.target.value.charAt(0).toUpperCase() +
      e.target.value.slice(1).toLowerCase();
    setResponses(newResponses);
    setIsCompleted(newResponses.every((res) => res.length >= 2));
  };

  useEffect(() => {
    if ((hasValidated && phase === "searching") || phase === "sending") {
      const send = async () => {
        await sendResponses({
          responses,
          userId: user.id,
          roomToken,
          gameData,
        });
      };
      send();
    }
  }, [hasValidated, phase]);

  useEffect(() => {
    phase === "searching" &&
      setResponses(Array.from({ length: themes.length }, () => `${letter}`));

    const send = async () => {
      if (phase === "sending") {
        setResponses(Array.from({ length: themes.length }, () => ""));
        setIsCompleted(false);
        isAdmin &&
          setTimeout(async () => {
            await goValidation({
              gamers: gameData.gamers,
              roomId,
              roomToken,
              gameData,
            });
          }, 2000);
      }
    };
    send();

    if (phase?.startsWith("validating")) {
      setValTheme(themes[phase.split("-")[1]]);
      setHasValidated(false);
    }
  }, [phase]);

  useEffect(() => {
    if (
      themesResponses &&
      valTheme &&
      themesResponses[valTheme] &&
      Object.keys(themesResponses).length &&
      Object.values(themesResponses[valTheme]).every(
        (res) => res.validated === false
      )
    )
      setAllFalse(true);
    else setAllFalse(false);
  }, [valTheme]); // tricky : no themesResponses_dep

  useEffect(() => {
    if (
      !gameData.themesResponses ||
      !Object.values(gameData.themesResponses).length ||
      !valTheme ||
      !gameData.themesResponses[valTheme]
    )
      return;
    setThemesResponses(gameData.themesResponses);

    const groupedRes = groupSimilarWords(gameData.themesResponses[valTheme], 1);
    const refVal = {};
    groupedRes.forEach((group, i) => {
      refVal[i] = {
        gamers: group.map((gamer) => gamer.gamer),
        word: group[0].response.word,
        validated: group[0].response.validated,
      };
    });
    setRefereeValidation(refVal);
  }, [gameData.themesResponses, valTheme, phase]);

  useEffect(() => {
    if (phase !== "validating") return;
    gameData.refereeValidation &&
      setRefereeValidation(gameData.refereeValidation);
  }, [gameData.refereeValidation]);

  const validationList = useCallback(() => {
    if (
      !valTheme ||
      !themesResponses ||
      !themesResponses[valTheme] ||
      !Object.keys(refereeValidation).length ||
      !phase.startsWith("validating")
    ) {
      return;
    }

    return (
      <div>
        <div className="flex justify-center border-b">
          Validation pour la catégorie :
          <span className="font-semibold">&nbsp;{valTheme}</span>
        </div>

        {Object.values(refereeValidation).map((group, i) => {
          const isInvalidated = group.validated === false;

          return (
            <div
              key={i}
              className="flex justify-between items-center border-b mr-2"
            >
              <div className="flex flex-col my-2 items-start w-1/6">
                {group.gamers.map((gamer, j) => {
                  return (
                    <div key={j} className="flex flex-col my-1 ml-2">
                      <div className="flex gap-2">
                        <div className="font-semibold">{gamer}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col w-1/6 justify-center items-center">
                <div>{group.word}</div>
              </div>
              <div
                className={`flex flex-col w-1/6 justify-center items-center ${
                  isReferee && "border border-blue-300 bg-blue-100"
                }`}
              >
                <div
                  onClick={async () => {
                    if (!isReferee) return;
                    const newRefereeValidation = {
                      ...refereeValidation,
                      [i]: {
                        ...refereeValidation[i],
                        validated: !refereeValidation[i].validated,
                      },
                    };
                    await refereeTrigger({
                      newRefereeValidation,
                      roomId,
                      roomToken,
                      gameData,
                    });
                  }}
                >
                  {!isInvalidated ? (
                    <CheckIcon className="block h-6 w-6 " />
                  ) : (
                    <XMarkIcon className="block h-6 w-6 " />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isReferee && (
          <NextStep
            onClick={async () => {
              if (allFalse) {
                await manageEmptyTheme({ roomId, roomToken, gameData });
              } else {
                await validate({ roomId, roomToken, gameData });
              }
            }}
          >
            Suite
          </NextStep>
        )}
      </div>
    );
  }, [
    gameData,
    isReferee,
    roomToken,
    themesResponses,
    valTheme,
    phase,
    allFalse,
    refereeValidation,
  ]);

  const handleTimeUp = () => {
    setTimeout(() => {
      setHasValidated(true);
    }, 1000);
  };

  return (
    <div className="relative animate-[fadeIn_1.5s_ease-in-out] w-full h-full">
      <div className="flex flex-col overflow-y-auto">
        <div className="flex flex-col items-center">
          <div className="font-semibold">Points</div>
          {counts
            ?.sort((a, b) => a.name.localeCompare(b.name))
            .map((gamerCount) => {
              const turnPoints =
                lastTurnCounts &&
                gamerCount.gold -
                  lastTurnCounts.find(
                    (lastCount) => lastCount.name === gamerCount.name
                  ).gold;

              return (
                <div key={gamerCount.name}>
                  {gamerCount.name} :{" "}
                  <span className="font-semibold">{gamerCount.gold}</span> point
                  {gamerCount.gold > 1 ? "s" : ""}
                  {phase !== "searching" && !hasFirstTurn ? (
                    <span className="italic text-sm">(+{turnPoints})</span>
                  ) : null}
                </div>
              );
            })}
        </div>

        {!isEnded && (
          <>
            {phase === "waiting" && isAdmin && (
              <NextStep
                onClick={async () =>
                  await startCountdown({
                    time: gameData.options.countDownTime, //remove
                    roomId,
                    roomToken,
                    gameData,
                  })
                }
              >
                Lancer
              </NextStep>
            )}

            {phase === "searching" && (
              <div className="flex flex-col items-center">
                <div>
                  Cherchez des mots commençants par la lettre{" "}
                  <span className="font-bold">{letter}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {themes.map((theme, i) => (
                    <div
                      key={theme}
                      className="w-full flex flex-col items-center"
                    >
                      <div className="m-1">{theme}</div>
                      <input
                        ref={(el) => (inputRefs.current[i] = el)}
                        type="text"
                        value={responses[i] || ""}
                        onChange={(e) => handleChange(e, i)}
                        onKeyDown={(e) => {
                          if (e.key === "/") {
                            e.preventDefault();
                          }
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (i + 1 < themes.length) {
                              inputRefs.current[i + 1]?.focus();
                            } else {
                              inputRefs.current[i]?.blur();
                            }
                          }
                        }}
                        className="w-4/5 border focus:outline-none focus:border"
                      />
                    </div>
                  ))}
                </div>

                {!hasValidated && isCompleted && (
                  <NextStep onClick={() => setHasValidated(true)}>
                    J&apos;ai fini
                  </NextStep>
                )}
                <div className="h-fit">
                  <CountDown
                    finishCountdownDate={finishCountdownDate}
                    onTimeUp={handleTimeUp}
                  />
                </div>
              </div>
            )}

            {phase?.startsWith("validating") &&
              themesResponses &&
              Object.keys(themesResponses).length && (
                <>
                  <div>{validationList()}</div>
                </>
              )}
          </>
        )}

        {phase === "ended" && winners && (
          <div className="flex justify-center">
            {winners.map((winner, i) => (
              <span key={i}>
                {i > 0 ? (i === winners.length - 1 ? "et " : ", ") : ""}
                {winner.name}
                &nbsp;
              </span>
            ))}
            {winners.length === 1 ? "a" : "ont"} gagné la partie !
          </div>
        )}
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
        modeName="P'tit bac"
        gameData={gameData}
        user={user}
      />
    </div>
  );
}
