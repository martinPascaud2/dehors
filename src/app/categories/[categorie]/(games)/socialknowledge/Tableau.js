"use client";

import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import React from "react";
import { useFormState } from "react-dom";
import Image from "next/image";

import usePreventScroll from "@/utils/usePreventScroll";

import shuffleArray from "@/utils/shuffleArray";
import getAreSimilar from "./getAreSimilar";

import {
  startGame,
  sendResponse,
  checkResponses,
  sendSortedResponses,
  checkSorted,
  sendSecondSorted,
  checkSecond,
  writtingComeBack,
  firstSubmitComeBack,
  getGamerFirstTurnSorted,
  seeRevelation,
  checkHasSeen,
  adminRevelate,
  getAllSortedResponses,
  goResult,
} from "./gameActions";

import ClickableCountDown from "@/components/ClickableCountdown";
import NextStep from "@/components/NextStep";

import { TouchBackend } from "react-dnd-touch-backend";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5toTouch } from "@/components/DND/HTML5toTouch";
import { usePreview } from "react-dnd-preview";

import {
  CheckIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronDoubleRightIcon,
  PauseIcon,
} from "@heroicons/react/24/outline";
import { IoCloudOfflineSharp } from "react-icons/io5";
import Gold from "/public/gold.png";
import Silver from "/public/silver.png";
import Bronze from "/public/bronze.png";

const ItemType = "COLUMN_ITEM";

const tailColors = [
  "#93c5fd", // blue
  "#d8b4fe", // purple
  "#fda4af", // rose
  "#fcd34d", // amber
  "#86efac", // green
  "#67e8f9", // cyan
  "#a5b4fc", // indigo
  "#f0abfc", // fuchsia
  "#fca5a5", // red
  "#fde047", // yellow
];

const MyPreview = ({ dimensions }) => {
  const preview = usePreview();

  if (!preview.display) {
    return null;
  }

  const { itemType, item, style } = preview;

  return (
    <td
      className={`item-list__item flex justify-center items-center w-fit border border-black bg-green-100 p-2 text-center h-${dimensions.height} shadow-[inset_0_0_0_1px_#16a34a] z-20`}
      style={{
        ...style,
        width: dimensions.width,
      }}
    >
      {item.label}
    </td>
  );
};

const MyRowPreview = ({ dimensions, otherGamersResponses }) => {
  const preview = usePreview();

  if (!preview.display) {
    return null;
  }

  const { itemType, item, style } = preview;

  return (
    <td
      className={`item-list__item flex items-center w-full border border-black bg-green-100 text-center h-${dimensions.height} shadow-[inset_0_0_0_1px_#16a34a] z-20`}
      style={{
        ...style,
        width: dimensions.width,
      }}
    >
      {Object.values(otherGamersResponses).map((responses, i) => (
        <div
          key={i}
          className="w-full h-full border border-black flex items-center justify-center"
        >
          {responses[item.gamerIndex]}
        </div>
      ))}
    </td>
  );
};

const Revelator = ({
  allResponsesByUser,
  gamersNames,
  deletedGamersNames,
  allThemes,
  roomId,
  roomToken,
  gameData,
  isAdmin,
}) => {
  const [currentGamerIndex, setCurrentGamerIndex] = useState(0);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isReadyForNextGamer, setIsReadyForNextGamer] = useState(false);
  const [isRevelationEnded, setIsRevelationEnded] = useState(false);
  const [allSortedResponses, setAllSortedResponses] = useState();
  const [goodOrBadResponses, setGoodOrBadResponses] = useState([]);

  useEffect(() => {
    if (!isRunning || !isAdmin) return;

    const interval = setInterval(async () => {
      await adminRevelate({ roomId, roomToken, gameData });
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning, currentThemeIndex, roomId, roomToken, gameData, isAdmin]);

  useEffect(() => {
    const currentThemeIndex = gameData.revelationIndexes?.currentThemeIndex;
    const currentGamerIndex = gameData.revelationIndexes?.currentGamerIndex;
    setCurrentThemeIndex(currentThemeIndex);
    setCurrentGamerIndex(currentGamerIndex);
    if (currentThemeIndex >= allThemes.length - 1) {
      setIsRunning(false);
      setIsReadyForNextGamer(true);
      if (currentGamerIndex >= gamersNames.length - 1) {
        setIsRevelationEnded(true);
      }
    }
  }, [gameData, allThemes.length, gamersNames.length]);

  useEffect(() => {
    const get = async () => {
      const sortedResponses = await getAllSortedResponses({
        gamers: gameData.gamers,
        gamersNames,
        options: gameData.options,
      });
      setAllSortedResponses(sortedResponses);
    };
    get();
  }, [gameData, gamersNames]);

  useEffect(() => {
    if (!allSortedResponses) return;
    const goodOrBadResponses = {};
    gamersNames.forEach((name) => {
      goodOrBadResponses[name] = [];
    });

    Object.entries(allSortedResponses)
      .sort(([userNameA], [userNameB]) => userNameA.localeCompare(userNameB))
      .forEach(([name, gamerResponses]) => {
        Object.entries(gamerResponses)
          .sort(([themeA], [themeB]) => themeA.localeCompare(themeB))
          .forEach(([theme, responses], themeIndex) => {
            responses.forEach((response, forThisGamerIndex) => {
              const countThisOne =
                forThisGamerIndex === currentGamerIndex &&
                themeIndex <= currentThemeIndex;

              if (!countThisOne) return;

              if (
                getAreSimilar(
                  response,
                  allResponsesByUser[gamersNames[forThisGamerIndex]][theme]
                )
              ) {
                const gamerGoodOrBad = [...goodOrBadResponses[name]];
                gamerGoodOrBad.push(true);
                goodOrBadResponses[name] = gamerGoodOrBad;
              } else {
                const gamerGoodOrBad = [...goodOrBadResponses[name]];
                gamerGoodOrBad.push(false);
                goodOrBadResponses[name] = gamerGoodOrBad;
              }
            });
          });
      });

    setGoodOrBadResponses(goodOrBadResponses);
  }, [
    allSortedResponses,
    gamersNames,
    allResponsesByUser,
    currentGamerIndex,
    currentThemeIndex,
  ]);

  return (
    <div className="w-full">
      {isAdmin && (
        <div className="w-full flex justify-center">
          {!isRevelationEnded ? (
            <button
              onClick={() => {
                setIsRunning(!isRunning);
                setIsReadyForNextGamer(false);
              }}
              className="border border-blue-400 bg-blue-100 p-1 text-blue-400 mt-2"
            >
              {!isRunning ? (
                !isReadyForNextGamer ? (
                  <ChevronRightIcon className="w-8 h-8" />
                ) : (
                  <ChevronDoubleRightIcon className="w-8 h-8" />
                )
              ) : (
                <PauseIcon className="w-8 h-8" />
              )}
            </button>
          ) : (
            <button
              onClick={() => goResult({ roomId, roomToken, gameData })}
              className="border border-blue-400 bg-blue-100 text-blue-400 p-2 mt-2"
            >
              Résultats
            </button>
          )}
        </div>
      )}

      <table className="flex flex-col items-center justify-center w-full border-b border-black mt-4">
        <thead className="w-full">
          <tr className="w-full flex justify-around">
            {allThemes.map((theme) => (
              <th
                scope="row"
                key={theme}
                className="flex-1 flex items-end justify-center"
              >
                {theme}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="w-full flex flex-col">
          {Object.entries(allResponsesByUser)
            .sort(([userNameA], [userNameB]) =>
              userNameA.localeCompare(userNameB)
            )
            .map(([gamer, responses], gamerIndex) => {
              return (
                <tr key={gamer} className="flex justify-around">
                  {Object.entries(responses).map(
                    ([theme, response], themeIndex) => {
                      const show =
                        gamerIndex < currentGamerIndex ||
                        (gamerIndex === currentGamerIndex &&
                          themeIndex <= currentThemeIndex);

                      const isTheOne = gamerIndex === currentGamerIndex;

                      const isDeleted = deletedGamersNames.some(
                        (deleted) => deleted === gamer
                      );

                      return (
                        <React.Fragment key={themeIndex}>
                          <td
                            className="absolute left-[50%] translate-x-[-50%] w-full h-[25px] px-[9px] text-center bg-gradient-to-r from-gray-100 to-gray-100 via-transparent"
                            style={{
                              backgroundColor: !isDeleted
                                ? tailColors[gamerIndex]
                                : "#d1d5db",
                            }}
                          >
                            <div className="outline outline-1 outline-black flex justify-center w-full items-center h-full">
                              <div className="relative flex justify-center items-center">
                                {gamer}
                                <div className="absolute left-full flex">
                                  {!isTheOne &&
                                    goodOrBadResponses &&
                                    goodOrBadResponses[gamer]?.map(
                                      (goodOrBad, i) => {
                                        if (goodOrBad) {
                                          return (
                                            <div key={`${gamer}-${i}`}>
                                              <CheckIcon className="w-6 h-6 text-green-600" />
                                            </div>
                                          );
                                        } else {
                                          return (
                                            <div key={`${gamer}-${i}`}>
                                              <XMarkIcon className="w-6 h-6 text-red-600" />
                                            </div>
                                          );
                                        }
                                      }
                                    )}
                                </div>
                              </div>
                              {isDeleted && (
                                <IoCloudOfflineSharp className="ml-1" />
                              )}
                            </div>
                          </td>

                          <td
                            key={theme}
                            style={{
                              borderBottomWidth: "0px",
                            }}
                            className={`flex items-center justify-center w-full h-${
                              gamersNames.length >= 6 ? 8 : 10
                            } text-center text-sm mt-6 border border-black leading-tight`}
                          >
                            {!show ? "" : response}
                          </td>
                        </React.Fragment>
                      );
                    }
                  )}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

const ResponseForm = ({
  writtenIndex,
  setWrittenIndex,
  allThemes,
  response,
  setResponse,
  message,
  setMessage,
  gameData,
  roomId,
  roomToken,
  user,
}) => {
  const sendResponseWith = sendResponse.bind(null, {
    gameData,
    roomId,
    roomToken,
    user,
  });
  const innerHeight = useMemo(() => window.innerHeight, []);
  const [state, formAction] = useFormState(sendResponseWith, {});
  const refForm = useRef();
  const inputRef = useRef();

  useEffect(() => {
    inputRef?.current?.focus();
  }, [writtenIndex, inputRef]);

  return (
    <div
      className="flex flex-col justify-start items-center overflow-hidden fixed"
      style={{ top: innerHeight / 3, height: "100%" }}
    >
      {writtenIndex < allThemes.length ? (
        <>
          <form
            ref={refForm}
            action={async (formData) => {
              if (response.length < 4) {
                setMessage("Réponse trop courte");
                return;
              } else if (response.length > 25) {
                setMessage("Réponse trop longue");
                return;
              }
              await formAction(formData);
              setWrittenIndex((prevIndex) => prevIndex + 1);
              setResponse("");
              setMessage("");
              refForm.current?.reset();
            }}
            className="flex flex-col justify-center items-center"
          >
            <label htmlFor="response">{allThemes[writtenIndex]}</label>
            <input
              ref={inputRef}
              onChange={(e) => {
                setResponse(e.target.value);
                setMessage("");
              }}
              type="text"
              name="response"
              id="response"
              defaultValue=""
              className="border focus:outline-none focus:border-2"
            />

            <input type="hidden" name="theme" value={allThemes[writtenIndex]} />
            <input
              type="hidden"
              name="isLast"
              value={writtenIndex === allThemes.length - 1}
            />

            {/* <button
              type="submit"
              className="border border-blue-300 bg-blue-100"
            >
              Envoyer
            </button> */}
          </form>

          <div className="w-full text-center italic">{message}</div>
        </>
      ) : (
        <div>En attente des autres joueurs...</div>
      )}
    </div>
  );
};

const DraggableItem = ({
  item,
  index,
  moveItem,
  clickMoveFromIndex,
  setClickMoveFromIndex,
  goodResponse,
  isBlocked,
  correctionLocked,
  firstTurnName,
  height,
}) => {
  const [{ isDragging }, ref] = useDrag({
    type: ItemType,
    item: { index, label: item },
    canDrag: !correctionLocked,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    // hover: (draggedItem) => {
    drop: (draggedItem) => {
      if (draggedItem.index !== index && !isBlocked && !correctionLocked) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
        setClickMoveFromIndex();
      }
    },
  });

  const moveByClick = () => {
    if (isBlocked || correctionLocked) return;
    if (clickMoveFromIndex === undefined) setClickMoveFromIndex(index);
    else {
      moveItem(clickMoveFromIndex, index);
      setClickMoveFromIndex();
    }
  };

  return (
    <>
      <td
        ref={(node) => ref(drop(node))}
        style={{
          padding: "0px",
          margin: "",
          backgroundColor:
            goodResponse === undefined
              ? clickMoveFromIndex === index || correctionLocked === true
                ? "#dcfce7"
                : "#f3f4f6"
              : goodResponse
              ? "#dcfce7"
              : "#fee2e2",
          borderBottomWidth: "0px",
          zIndex: 10,
          userSelect: "none",
        }}
        className={`flex flex-col text-center items-center justify-center w-full h-${
          height === "medium" ? "10" : "8"
        } text-sm overflow-hidden mt-6 border border-black relative leading-tight`}
        onClick={() => moveByClick()}
      >
        {item}
        <div className="absolute bottom-0 right-0 text-xs">{firstTurnName}</div>
      </td>
    </>
  );
};

const DraggableColumn = ({
  items,
  moveItem,
  gamersNames,
  deletedGamersNames,
  otherGamersNames,
  allResponses,
  phase,
  theme,
  firstTurnSorted,
  previousFirstNamesByTheme,
}) => {
  const [dimensions, setDimensions] = useState();
  const dimensionsRef = useRef(null);
  const [clickMoveFromIndex, setClickMoveFromIndex] = useState();

  const [badResponses, setBadResponses] = useState();
  const [correctionLockeds, setCorrectionLockeds] = useState();

  useEffect(() => {
    if (dimensionsRef.current) {
      const { width, height } = dimensionsRef.current.getBoundingClientRect();
      if (width !== 0 && height !== 0)
        setDimensions({ width, height: gamersNames.length >= 6 ? 8 : 10 });
    }
  }, [setDimensions, gamersNames]);

  useEffect(() => {
    if (!firstTurnSorted || !gamersNames || !allResponses) return;

    let badResponses = {};
    gamersNames.forEach((name) => {
      badResponses[name] = 0;
    });

    let correctionLockeds = {};
    Object.entries(firstTurnSorted).forEach(([th, responses]) => {
      let passedGamerIndex = 0;
      responses.forEach((response, gamerIndex) => {
        if (response !== null) {
          if (
            !getAreSimilar(response, allResponses[th][gamersNames[gamerIndex]])
          ) {
            badResponses[gamersNames[gamerIndex]] += 1;
            if (th === theme)
              correctionLockeds[gamerIndex - passedGamerIndex] = false;
          } else {
            if (th === theme)
              correctionLockeds[gamerIndex - passedGamerIndex] = true;
          }
        } else {
          passedGamerIndex = 1;
        }
      });
    });
    setBadResponses(badResponses);
    phase === "secondChance_withCorrection" &&
      setCorrectionLockeds(correctionLockeds);
  }, [firstTurnSorted, allResponses, gamersNames]);

  return (
    <>
      <DndProvider backend={TouchBackend} options={{ HTML5toTouch }}>
        <tr ref={dimensionsRef} className="w-full h-full">
          {items.map((item, index) => {
            let goodResponse;
            if (phase === "no_chance") {
              goodResponse = getAreSimilar(
                item,
                allResponses[theme][otherGamersNames[index]]
              );
            }

            const isDeleted = deletedGamersNames.some(
              (deleted) => deleted === otherGamersNames[index]
            );

            return (
              <React.Fragment key={index}>
                <td
                  className={`absolute left-[50%] translate-x-[-50%] w-full h-[25px] px-[9px] bg-gradient-to-r from-gray-100 to-gray-100 via-transparent`}
                  style={{
                    userSelect: "none",
                    backgroundColor: !isDeleted ? tailColors[index] : "#d1d5db",
                  }}
                >
                  <div className="flex outline outline-1 outline-black justify-center w-full">
                    <div className="text-center relative">
                      <div className="flex items-center">
                        {otherGamersNames[index]}
                        {isDeleted && <IoCloudOfflineSharp className="ml-1" />}
                      </div>
                      <div className="absolute top-0 translate-x-[100%] w-full flex">
                        {badResponses &&
                          Array.from(
                            { length: badResponses[otherGamersNames[index]] },
                            (_, i) => (
                              <div key={`${index}-${i}`}>
                                <XMarkIcon className="w-6 h-6 text-red-600" />
                              </div>
                            )
                          )}
                      </div>
                    </div>
                  </div>
                </td>

                <DraggableItem
                  key={index}
                  item={item}
                  index={index}
                  moveItem={moveItem}
                  clickMoveFromIndex={clickMoveFromIndex}
                  setClickMoveFromIndex={setClickMoveFromIndex}
                  goodResponse={goodResponse}
                  isBlocked={phase === "no_chance"}
                  correctionLocked={correctionLockeds?.[index]}
                  firstTurnName={
                    previousFirstNamesByTheme &&
                    previousFirstNamesByTheme[theme]?.[index]
                  }
                  height={gamersNames.length >= 6 ? "small" : "medium"}
                />
              </React.Fragment>
            );
          })}

          {phase !== "no_chance" && <MyPreview dimensions={dimensions} />}
        </tr>
      </DndProvider>
    </>
  );
};

const DraggableRow = ({
  gamerIndex,
  otherGamersResponses,
  moveItem,
  easyClickMoveFromIndex,
  setEasyClickMoveFromIndex,
  height,
  goodResponse,
  isBlocked,
  correctionLocked,
  previousFirstNamesByTheme,
}) => {
  const [{ isDragging }, ref] = useDrag({
    type: ItemType,
    item: { gamerIndex },
    canDrag: !correctionLocked,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    // hover: (draggedItem) => {
    drop: (draggedItem) => {
      if (
        draggedItem.gamerIndex !== gamerIndex &&
        !isBlocked &&
        !correctionLocked
      ) {
        moveItem(draggedItem.gamerIndex, gamerIndex);
        draggedItem.gamerIndex = gamerIndex;
        setEasyClickMoveFromIndex();
      }
    },
  });

  const moveByClick = () => {
    if (isBlocked || correctionLocked) return;
    if (easyClickMoveFromIndex === undefined)
      setEasyClickMoveFromIndex(gamerIndex);
    else {
      moveItem(easyClickMoveFromIndex, gamerIndex);
      setEasyClickMoveFromIndex();
    }
  };

  if (Number.isNaN(gamerIndex) || !otherGamersResponses) return;
  return (
    <tr
      ref={(node) => ref(drop(node))}
      onClick={() => moveByClick()}
      className={`flex justify-around items-center w-full text-center h-${
        height === "medium" ? "10" : "8"
      }`}
      style={{
        backgroundColor:
          goodResponse === undefined
            ? easyClickMoveFromIndex === gamerIndex || correctionLocked === true
              ? "#dcfce7"
              : "#f3f4f6"
            : goodResponse
            ? "#dcfce7"
            : "#fee2e2",
      }}
    >
      {Object.values(otherGamersResponses).map((responses, i) => (
        <td
          key={i}
          className={`w-full h-full border border-black border-y-0 flex items-center justify-center relative text-sm leading-tight`}
        >
          {responses[gamerIndex]}
          <div className="absolute bottom-0 right-0 text-xs">
            {previousFirstNamesByTheme &&
              Object.values(previousFirstNamesByTheme)[0][gamerIndex]}
          </div>
        </td>
      ))}
    </tr>
  );
};

const EasyRow = ({
  gamersNames,
  otherGamersResponses,
  userName,
  moveItem,
  easyClickMoveFromIndex,
  setEasyClickMoveFromIndex,
  otherGamersNames,
  deletedGamersNames,
  firstTurnSorted,
  allResponses,
  phase,
  previousFirstNamesByTheme,
}) => {
  const [dimensions, setDimensions] = useState();
  const dimensionsRef = useRef(null);
  const [badResponses, setBadResponses] = useState();
  const [correctionLockeds, setCorrectionLockeds] = useState();

  useEffect(() => {
    if (dimensionsRef.current) {
      const { width, height } = dimensionsRef.current.getBoundingClientRect();
      if (width !== 0 && height !== 0)
        setDimensions({ width, height: gamersNames.length >= 6 ? 8 : 10 });
    }
  }, [setDimensions, gamersNames]);

  useEffect(() => {
    if (!firstTurnSorted || !gamersNames || !allResponses) return;

    let badResponses = {};
    gamersNames.forEach((name) => {
      badResponses[name] = 0;
    });

    let correctionLockeds = {};
    Object.entries(firstTurnSorted).forEach(([th, responses]) => {
      let passedGamerIndex = 0;
      responses.forEach((response, gamerIndex) => {
        if (response !== null) {
          if (
            !getAreSimilar(response, allResponses[th][gamersNames[gamerIndex]])
          ) {
            badResponses[gamersNames[gamerIndex]] += 1;
            correctionLockeds[gamerIndex - passedGamerIndex] = false;
          } else {
            correctionLockeds[gamerIndex - passedGamerIndex] = true;
          }
        } else {
          passedGamerIndex = 1;
        }
      });
    });
    setBadResponses(badResponses);
    phase === "secondChance_withCorrection" &&
      setCorrectionLockeds(correctionLockeds);
  }, [firstTurnSorted, allResponses, gamersNames, phase]);

  if (!otherGamersResponses) return null;
  return (
    <tbody ref={dimensionsRef} className="flex flex-col items-center">
      {gamersNames
        .filter((gamerName) => gamerName !== userName)
        .map((gamerName, gamerIndex) => {
          let goodResponse;
          if (phase === "no_chance") {
            const trueResponse = Object.values(allResponses)[0][gamerName];
            const responded =
              Object.values(otherGamersResponses)[0][gamerIndex];
            goodResponse = getAreSimilar(trueResponse, responded);
          }

          const isDeleted = deletedGamersNames.some(
            (deleted) => deleted === otherGamersNames[gamerIndex]
          );

          return (
            <React.Fragment key={gamerIndex}>
              <tr
                className={`h-[25px] border border-black w-full flex justify-center bg-gradient-to-r from-gray-100 to-gray-100 via-transparent
                `}
                style={{
                  backgroundColor: !isDeleted
                    ? tailColors[gamerIndex]
                    : "#d1d5db",
                }}
              >
                <td className="flex w-full justify-center">
                  <div className="flex justify-center items-center relative">
                    {gamerName}
                    {isDeleted && <IoCloudOfflineSharp className="ml-1" />}
                    <div className="absolute top-0 translate-x-[100%] w-full flex">
                      {badResponses &&
                        Array.from(
                          {
                            length: badResponses[otherGamersNames[gamerIndex]],
                          },
                          (_, i) => (
                            <div key={`${gamerIndex}-${i}`}>
                              <XMarkIcon className="w-6 h-6 text-red-600" />
                            </div>
                          )
                        )}
                    </div>
                  </div>
                </td>
              </tr>
              <DraggableRow
                gamerIndex={gamerIndex}
                otherGamersResponses={otherGamersResponses}
                moveItem={moveItem}
                easyClickMoveFromIndex={easyClickMoveFromIndex}
                setEasyClickMoveFromIndex={setEasyClickMoveFromIndex}
                height={gamersNames.length >= 6 ? "small" : "medium"}
                goodResponse={goodResponse}
                isBlocked={phase === "no_chance"}
                correctionLocked={correctionLockeds?.[gamerIndex]}
                previousFirstNamesByTheme={previousFirstNamesByTheme}
              />
              {phase !== "no_chance" && (
                <tr>
                  <MyRowPreview
                    dimensions={dimensions}
                    otherGamersResponses={otherGamersResponses}
                  />
                </tr>
              )}
            </React.Fragment>
          );
        })}
    </tbody>
  );
};

export default function Tableau({ roomId, roomToken, user, gameData }) {
  usePreventScroll();
  const {
    themes,
    allResponsesByUser,
    gamersNames,
    deletedGamersNames = [],
    finishCountdownDate,
  } = gameData;
  const [phase, setPhase] = useState(gameData.phase);
  const [allResponses, setAllResponses] = useState(gameData.allResponses);

  const isAdmin = gameData.admin === user.name;
  const [writtenIndex, setWrittenIndex] = useState(0);
  const [response, setResponse] = useState("");
  const [otherGamersResponses, setOtherGamersResponses] = useState();
  const [hasClickedOnCountdown, setHasClickedOnCountdown] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);
  const [easyClickMoveFromIndex, setEasyClickMoveFromIndex] = useState();
  const [isValidationSaved, setIsValidationSaved] = useState(false);
  const [isWantNext, setIsWantNext] = useState(false);
  const [firstTurnSorted, setFirstTurnSorted] = useState();
  const [previousFirstNamesByTheme, setPreviousFirstNamesByTheme] = useState();

  const [isComingBack, setIsComingBack] = useState(true);
  const [message, setMessage] = useState("");

  const allThemes = themes.sort();

  useEffect(() => {
    setPhase((prevPhase) => {
      if (prevPhase === gameData.phase) return prevPhase;
      return gameData.phase;
    });
    setAllResponses((prevAllResponses) => {
      if (
        JSON.stringify(prevAllResponses) ===
        JSON.stringify(gameData.allResponses)
      )
        return prevAllResponses;
      return gameData.allResponses;
    });
  }, [gameData.phase, gameData.allResponses]);

  useEffect(() => {
    if (phase === "sorting") {
      const filteredResponses = Object.fromEntries(
        Object.entries(allResponses).map(([category, responses]) => [
          category,
          Object.fromEntries(
            Object.entries(responses).filter(([name]) => name !== user.name)
          ),
        ])
      );

      let otherGamersResponses = {};
      for (const [theme, responses] of Object.entries(filteredResponses)) {
        let themeResponses =
          gameData.options.difficulty === "easy"
            ? Object.values(responses)
            : shuffleArray(Object.values(responses));
        otherGamersResponses[theme] = themeResponses;
      }
      setOtherGamersResponses(otherGamersResponses);
    }
  }, [phase, allResponses, user.name, gameData.options.difficulty]);

  useEffect(() => {
    setHasClickedOnCountdown(false);
  }, [otherGamersResponses]);
  useEffect(() => {
    if (!phase) return;
    if (phase !== "sorting") {
      setHasClickedOnCountdown(false);
      setHasValidated(false);
      setIsValidationSaved(false);
    }
  }, [phase]);

  const onValidate = useCallback(() => {
    setHasValidated(true);
  }, []);

  useEffect(() => {
    if (!hasValidated || !user || !phase || hasClickedOnCountdown) return;

    setHasValidated(false);
    setIsValidationSaved(true);

    const send = async () => {
      if (phase === "sorting") {
        await sendSortedResponses({
          user,
          sortedResponses: otherGamersResponses,
          gameData,
          roomId,
          roomToken,
        });
      } else if (
        phase === "secondChance_withoutCorrection" ||
        phase === "secondChance_withCorrection"
      ) {
        await sendSecondSorted({
          user,
          secondSorted: otherGamersResponses,
          gameData,
          roomId,
          roomToken,
        });
      }
    };
    send();
  }, [hasValidated, user, phase, hasClickedOnCountdown]);

  useEffect(() => {
    if (!phase || !gamersNames || !user) return;

    const getSorted = async () => {
      if (
        phase === "secondChance_withoutCorrection" ||
        phase === "secondChance_withCorrection"
      ) {
        const firstTurn = await getGamerFirstTurnSorted({
          gamer: user,
          gamersNames,
        });
        setFirstTurnSorted(firstTurn);
      }
    };
    getSorted();
  }, [phase, gamersNames, user]);

  useEffect(() => {
    const comeBack = async () => {
      if (phase === "writing" && isComingBack === true) {
        const savedWrittenIndex = await writtingComeBack({ user });
        setWrittenIndex(savedWrittenIndex);
        setIsComingBack(false);
      } else if (
        (phase === "no_chance" ||
          phase === "secondChance_withoutCorrection" ||
          phase === "secondChance_withCorrection") &&
        isComingBack === true
      ) {
        const otherGamersResponses = await firstSubmitComeBack({ user });
        setOtherGamersResponses(otherGamersResponses);
        setIsComingBack(false);
      }
    };
    comeBack();
  }, [phase, isComingBack, user]);

  const otherGamersNames = gamersNames?.filter((name) => name !== user.name);

  useEffect(() => {
    if (
      !allResponses ||
      !["secondChance_withoutCorrection", "secondChance_withCorrection"].some(
        (phaseName) => phaseName === phase
      )
    )
      return;
    let previousFirstNamesByTheme = {};
    Object.keys(allResponses).forEach((theme) => {
      previousFirstNamesByTheme[theme] = otherGamersNames;
    });
    setPreviousFirstNamesByTheme(previousFirstNamesByTheme);
  }, [allResponses, phase]);

  useEffect(() => {
    if (!gameData || !roomId || !roomToken || !phase) return;

    const checkAllWritingSent = async () => {
      if (gameData.isDeletedUser && isAdmin && phase === "writing") {
        await checkResponses({
          gameData,
          roomId,
          roomToken,
        });
      }
    };

    const checkAllSortedSent = async () => {
      if (gameData.isDeletedUser && isAdmin && phase === "sorting") {
        await checkSorted({ gameData, roomId, roomToken });
      }
    };

    const checkAllHasSeen = async () => {
      if (gameData.isDeletedUser && isAdmin && phase === "no_chance") {
        await checkHasSeen({ gameData, roomId, roomToken });
      }
    };

    const checkAllSecond = async () => {
      if (
        gameData.isDeletedUser &&
        isAdmin &&
        (phase === "secondChance_withoutCorrection" ||
          phase === "secondChance_withCorrection")
      ) {
        await checkSecond({ gameData, roomId, roomToken });
      }
    };

    checkAllWritingSent();
    checkAllSortedSent();
    checkAllHasSeen();
    checkAllSecond();
  }, [gameData, isAdmin, roomId, roomToken, phase]);

  const TableauTable = useCallback(
    ({ allResponses, phase, firstTurnSorted }) => {
      const moveItemByRow = (fromIndex, toIndex) => {
        const newColumns = {};
        for (let columnKey in otherGamersResponses) {
          const updatedColumn = [...otherGamersResponses[columnKey]];
          const [movedItem] = updatedColumn.slice(fromIndex, fromIndex + 1);
          const [exchangedItem] = updatedColumn.slice(toIndex, toIndex + 1);
          updatedColumn.splice(toIndex, 1, movedItem);
          updatedColumn.splice(fromIndex, 1, exchangedItem);
          newColumns[columnKey] = updatedColumn;
        }
        setOtherGamersResponses(newColumns);

        setPreviousFirstNamesByTheme((prevNamesColumns) => {
          if (!prevNamesColumns) return prevNamesColumns;
          else {
            const newPreviousFirstNamesByTheme = {};
            for (let columnKey in prevNamesColumns) {
              const updatedNamesColumn = [...prevNamesColumns[columnKey]];
              const [movedName] = updatedNamesColumn.slice(
                fromIndex,
                fromIndex + 1
              );
              const [exchangedName] = updatedNamesColumn.slice(
                toIndex,
                toIndex + 1
              );
              updatedNamesColumn.splice(toIndex, 1, movedName);
              updatedNamesColumn.splice(fromIndex, 1, exchangedName);
              newPreviousFirstNamesByTheme[columnKey] = updatedNamesColumn;
            }
            return newPreviousFirstNamesByTheme;
          }
        });
      };

      const moveItemInColumn = (columnKey, fromIndex, toIndex) => {
        const updatedColumn = [...otherGamersResponses[columnKey]];
        const [movedItem] = updatedColumn.slice(fromIndex, fromIndex + 1);
        const [exchangedItem] = updatedColumn.slice(toIndex, toIndex + 1);
        updatedColumn.splice(toIndex, 1, movedItem);
        updatedColumn.splice(fromIndex, 1, exchangedItem);
        setOtherGamersResponses((prevColumns) => ({
          ...prevColumns,
          [columnKey]: updatedColumn,
        }));

        setPreviousFirstNamesByTheme((prevNamesColumns) => {
          if (!prevNamesColumns) return prevNamesColumns;
          else {
            const updatedNamesColumn = [...prevNamesColumns[columnKey]];
            const [movedName] = updatedNamesColumn.slice(
              fromIndex,
              fromIndex + 1
            );
            const [exchangedName] = updatedNamesColumn.slice(
              toIndex,
              toIndex + 1
            );
            updatedNamesColumn.splice(toIndex, 1, movedName);
            updatedNamesColumn.splice(fromIndex, 1, exchangedName);
            return {
              ...prevNamesColumns,
              [columnKey]: updatedNamesColumn,
            };
          }
        });
      };

      return (
        <table className="w-full flex flex-col items-around border border-x-0 border-t-0 border-b-1 border-black">
          <DndProvider backend={TouchBackend} options={{ HTML5toTouch }}>
            <thead className="w-full">
              <tr
                className="w-full flex justify-around"
                style={{ userSelect: "none" }}
              >
                {otherGamersResponses &&
                  Object.keys(otherGamersResponses).map((columnKey) => (
                    <th
                      scope="row"
                      key={columnKey}
                      className="flex-1 flex items-end justify-center"
                    >
                      {columnKey}
                    </th>
                  ))}
              </tr>
            </thead>

            {gameData.options.difficulty === "easy" ? (
              <EasyRow
                gamersNames={gamersNames}
                otherGamersResponses={otherGamersResponses}
                userName={user.name}
                moveItem={(fromIndex, toIndex) =>
                  moveItemByRow(fromIndex, toIndex)
                }
                easyClickMoveFromIndex={easyClickMoveFromIndex}
                setEasyClickMoveFromIndex={setEasyClickMoveFromIndex}
                otherGamersNames={otherGamersNames}
                deletedGamersNames={deletedGamersNames}
                firstTurnSorted={firstTurnSorted}
                allResponses={allResponses}
                phase={phase}
                previousFirstNamesByTheme={previousFirstNamesByTheme}
              />
            ) : (
              <tbody className="flex w-full">
                {otherGamersResponses &&
                  Object.keys(otherGamersResponses).map((theme, i) => (
                    <DraggableColumn
                      key={i}
                      items={otherGamersResponses[theme]}
                      moveItem={(fromIndex, toIndex) =>
                        moveItemInColumn(theme, fromIndex, toIndex)
                      }
                      gamersNames={gamersNames}
                      deletedGamersNames={deletedGamersNames}
                      otherGamersNames={otherGamersNames}
                      allResponses={allResponses}
                      phase={phase}
                      theme={theme}
                      firstTurnSorted={firstTurnSorted}
                      previousFirstNamesByTheme={previousFirstNamesByTheme}
                    />
                  ))}
              </tbody>
            )}
          </DndProvider>
        </table>
      );
    },
    [
      gamersNames,
      deletedGamersNames,
      otherGamersResponses,
      user.name,
      previousFirstNamesByTheme,
      otherGamersNames,
      easyClickMoveFromIndex,
      gameData.options.difficulty,
    ]
  );

  return (
    <div className="relative animate-[fadeIn_1.5s_ease-in-out]">
      <div className="flex flex-col items-center justify-start h-full p-2 bg-gray-100 relative overflow-hidden">
        {phase === "writing" && (
          <div className="flex justify-center items-center h-full">
            <ResponseForm
              writtenIndex={writtenIndex}
              setWrittenIndex={setWrittenIndex}
              allThemes={allThemes}
              response={response}
              setResponse={setResponse}
              message={message}
              setMessage={setMessage}
              gameData={gameData}
              roomId={roomId}
              roomToken={roomToken}
              user={user}
            />
          </div>
        )}

        {phase === "sorting" && (
          <div className="flex flex-col justify-start items-center h-[100vw] w-full">
            <div className="flex items-center justify-center">
              <div className="m-4 flex flex-col items-center">
                <div className="font-semibold">Trouvez les réponses !</div>
                <div className="font-normal">(glisser ou cliquer)</div>
              </div>
              <div>
                {!hasClickedOnCountdown ? (
                  <ClickableCountDown
                    finishCountdownDate={finishCountdownDate}
                    onTimeUp={onValidate}
                    onClick={() => setHasClickedOnCountdown(true)}
                    isValidationSaved={isValidationSaved}
                  />
                ) : (
                  <button
                    onClick={() => {
                      setHasValidated(true);
                      setHasClickedOnCountdown(false);
                    }}
                    className={`h-16 w-16 border ${
                      !isValidationSaved
                        ? "border-blue-300 bg-blue-100 text-blue-400"
                        : "border-green-300 bg-green-100 text-green-400"
                    } rounded-full`}
                  >
                    Valider
                  </button>
                )}
              </div>
            </div>

            <TableauTable />
          </div>
        )}

        {phase === "no_chance" && (
          <>
            {!isWantNext ? (
              <button
                onClick={async () => {
                  await seeRevelation({ user, gameData, roomId, roomToken });
                  setIsWantNext(true);
                }}
                className="border border-blue-400 bg-blue-100 p-2 text-blue-400 my-2"
              >
                Suite
              </button>
            ) : (
              <div className="my-2 p-2">En attente des autres joueurs...</div>
            )}
            <TableauTable allResponses={allResponses} phase={phase} />
          </>
        )}

        {(phase === "secondChance_withoutCorrection" ||
          phase === "secondChance_withCorrection") && (
          <div className="flex flex-col justify-start items-center h-[100vw] w-full">
            <div className="flex items-center justify-center">
              <div className="m-4 flex flex-col items-center">
                <div className="font-semibold">Seconde chance</div>
                <div className="font-normal">(glisser ou cliquer)</div>
              </div>

              <div>
                {!hasClickedOnCountdown ? (
                  <ClickableCountDown
                    finishCountdownDate={finishCountdownDate}
                    onTimeUp={onValidate}
                    onClick={() => setHasClickedOnCountdown(true)}
                    isValidationSaved={isValidationSaved}
                  />
                ) : (
                  <button
                    onClick={() => {
                      setHasValidated(true);
                      setHasClickedOnCountdown(false);
                    }}
                    className={`h-16 w-16 border ${
                      !isValidationSaved
                        ? "border-blue-300 bg-blue-100 text-blue-400"
                        : "border-green-300 bg-green-100 text-green-400"
                    } rounded-full`}
                  >
                    Valider
                  </button>
                )}
              </div>
            </div>

            <TableauTable
              allResponses={allResponses}
              phase={phase}
              firstTurnSorted={firstTurnSorted}
            />
          </div>
        )}

        {phase === "revelating" && (
          <Revelator
            allResponsesByUser={allResponsesByUser}
            gamersNames={gamersNames}
            deletedGamersNames={deletedGamersNames}
            allThemes={allThemes}
            roomId={roomId}
            roomToken={roomToken}
            gameData={gameData}
            isAdmin={isAdmin}
          />
        )}

        {phase === "results" && (
          <div className="h-full flex flex-col justify-center">
            <div className="font-bold m-2 text-lg text-center">Résultats</div>
            <table>
              <tbody>
                {Object.entries(gameData.results)
                  .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
                  .map(([name, score], i) => {
                    const isDeleted = deletedGamersNames.some(
                      (deleted) => deleted === name
                    );
                    return (
                      <tr
                        key={i}
                        className={`gap-8 my-2 ${
                          !isDeleted ? "text-black" : "text-gray-300"
                        }`}
                      >
                        <td className="p-4">
                          {(() => {
                            let placeDisplay;
                            let displayImage = true;
                            switch (i) {
                              case 0:
                                placeDisplay = Gold;
                                break;
                              case 1:
                                placeDisplay = Silver;
                                break;
                              case 2:
                                placeDisplay = Bronze;
                                break;
                              default:
                                placeDisplay = `${i + 1}e`;
                                displayImage = false;
                            }
                            return (
                              <>
                                {displayImage ? (
                                  <div className="w-8 h-8">
                                    <Image
                                      alt="place"
                                      src={placeDisplay}
                                      width={500}
                                      height={500}
                                    />
                                  </div>
                                ) : (
                                  <div className="text-center text-xl">
                                    {placeDisplay}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </td>
                        <td className="p-4 text-center">{name}</td>
                        {gameData.firstTurnResults && (
                          <td className="p-4">
                            {"("}
                            {gameData.firstTurnResults[name]}
                            {")"}
                          </td>
                        )}
                        <td className="p-4 font-bold">{score}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
