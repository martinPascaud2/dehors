"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import "./ripple.css";

import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import getAreSimilar from "./getAreSimilar";

import { saveData } from "@/components/Room/actions";
import { useLongPress, LongPressEventType } from "use-long-press";
import {
  aimPlayer,
  sendActions,
  sendActionBack,
  proposeAction,
  sendPropositionBack,
} from "./gameActions";

import { vampiro } from "@/assets/fonts";

import Input from "@/components/keyboard/Input";
import TriactionKeyboard from "@/components/keyboard/TriactionKeyboard";
import WrittenCard from "./WrittenCard";

const RipplingButton = ({
  onLongPress,
  isValidated,
  setIsValidated,
  isActive,
}) => {
  const [longPressed, setLongPressed] = useState(false);
  const [coords, setCoords] = useState({ x: -1, y: -1 });
  const [isRippling, setIsRippling] = useState(false);

  useEffect(() => {
    if (coords.x !== -1 && coords.y !== -1) {
      setIsRippling(true);
    } else setIsRippling(false);
  }, [coords]);

  useEffect(() => {
    if (!isRippling) setCoords({ x: -1, y: -1 });
  }, [isRippling]);

  const callback = useCallback(() => {
    if (longPressed) return;
    setLongPressed(true);
    setIsValidated(true);
    onLongPress();
  }, [longPressed, onLongPress]);

  const cancel = () => {
    setLongPressed(false);
  };
  useEffect(() => {
    if (!isValidated) cancel();
  }, [isValidated, isActive]);

  const bind = useLongPress(isActive ? callback : null, {
    onStart: (e, meta) => {
      const rect = e.target.getBoundingClientRect();
      setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setIsRippling(true);
    },
    onFinish: (event, meta) => {
      setIsRippling(false);
    },
    onCancel: (event, meta) => {
      setIsRippling(false);
    },
    //onMove: () => console.log("Detected mouse or touch movement"),
    filterEvents: (event) => true, //check
    threshold: 2000,
    captureEvent: true,
    cancelOnMovement: false,
    cancelOutsideElement: true,
    detect: LongPressEventType.Pointer,
  });

  return (
    <button
      {...bind()}
      className={`hold-button rounded-md border-0 w-full h-full px-6 py-4 ${
        !longPressed
          ? !isActive
            ? "bg-slate-400"
            : "bg-red-800"
          : "bg-lime-800"
      }  text-slate-100 overflow-hidden relative cursor-pointer`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {isRippling && !longPressed ? (
        <span
          className="absolute w-5 h-5 bg-red-400 block border-0 rounded-full"
          style={{
            animationDuration: "10s",
            animationTimingFunction: "ease",
            animationIterationCount: "1",
            animationFillMode: "forwards",
            animationName: "ripple-effect",
            left: coords.x,
            top: coords.y,
          }}
        />
      ) : (
        ""
      )}
      <span className="content relative z-2 select-none">
        {!isValidated ? "Envoyer" : "Validé !"}
      </span>
    </button>
  );
};

const PendingGamerList = ({ gamers, senders }) => {
  const sortedSenders = senders.sort(
    (a, b) => new Date(a.sendingDate) - new Date(b.sendingDate)
  );

  const sendersSet = new Set(senders.map((sender) => sender.name));
  const sortedNotSenders = gamers
    .filter((gamer) => !sendersSet.has(gamer.name))
    .sort((a, b) =>
      a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
    );

  return (
    <div>
      {sortedSenders.map((sender, i) => {
        return (
          <div key={i} className="flex justify-center items-center">
            <div className="w-40 m-2 py-4 px-2 text-center rounded-md border border-green-700 bg-green-100 text-green-700">
              {sender.name}
            </div>
          </div>
        );
      })}

      {sortedNotSenders.map((notSender, i) => {
        return (
          <div key={i} className="flex justify-center items-center">
            <div className="w-40 m-2 py-4 px-2 text-center rounded-md border border-red-700 bg-red-100 text-red-700">
              {notSender.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const SlidingCard = ({ onDecision, sender, action }) => {
  const containerRef = useRef(null);
  const [startX, setStartX] = useState(null);
  const [translateX, setTranslateX] = useState(0);

  const windowWidth = Math.floor(window.innerWidth);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setTranslateX(0);
  };

  const handleTouchMove = (e) => {
    if (!startX) return;
    const currentX = e.touches[0].clientX * 1.2;
    const deltaX = currentX - startX;
    setTranslateX(deltaX);
  };

  const handleTouchEnd = () => {
    if (Math.abs(acceptation) < 100) {
      setTranslateX(0);
    } else {
      onDecision({ decision: acceptation < 0 ? "accept" : "refuse" });
    }
  };

  const acceptation = ((translateX * 100) / windowWidth) * 1.5;

  const AcceptText = useCallback(() => {
    return (
      <div className="text-2xl">
        <span
          style={{
            background:
              acceptation >= 0
                ? `linear-gradient(to right, transparent ${acceptation}%, white 0%, white ${
                    100 - acceptation
                  }%)`
                : `linear-gradient(to left, green ${-acceptation}%, white 0%, white ${
                    100 + acceptation
                  }%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
        >
          {"<< "}ACCEPTER{" <<"}
        </span>
      </div>
    );
  }, [translateX]);

  const RefuseText = useCallback(() => {
    return (
      <div className="text-2xl">
        <span
          style={{
            background:
              acceptation >= 0
                ? `linear-gradient(to right, red ${acceptation}%, white 0%, white ${
                    100 - acceptation
                  }%)`
                : `linear-gradient(to left, transparent ${-acceptation}%, white 0%, white ${
                    100 + acceptation
                  }%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
        >
          {">> "}REFUSER{" >>"}
        </span>
      </div>
    );
  }, [translateX]);

  return (
    <div className="w-[90%] flex flex-col items-center justify-center">
      <AcceptText />
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.preventDefault()}
        className={`touch-none p-4 bg-white w-full rounded-md border border-slate-300 my-2 flex flex-col items-center`}
        style={{ transform: `translateX(${translateX}px)` }}
      >
        <label>Action proposée par {sender.name}</label>

        <div className={`${vampiro.className} w-full p-2 m-2 text-center`}>
          {action}
        </div>
      </div>
      <RefuseText />
    </div>
  );
};

export default function Triaction({
  roomId,
  roomToken,
  user,
  gameData,
  // setShowNext,
}) {
  const { phase, gamers, activePlayer, senders } = gameData;
  const isAdmin = gameData.admin === user.name;
  const isActive = gameData.activePlayer?.id === user.id;
  const [isValidated, setIsValidated] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showedKeyboard, setShowedKeyboard] = useState(false);
  const [activeInput, setActiveInput] = useState(null);

  const [aimed, setAimed] = useState();
  const place = gamers?.find((gamer) => gamer.name === user.name)?.place;

  const [actions, setActions] = useState({});
  const [readyActions, setReadyActions] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const [previous, setPrevious] = useState();
  const [selected, setSelected] = useState({});
  const [sentBack, setSentBack] = useState({});
  const [isProposed, setIsProposed] = useState(false);

  const [showChoose, setShowChoose] = useState("backed");
  const [chooseTimeout, setChooseTimeout] = useState();

  const [hasReload, setHasReload] = useState(false);

  const aim = async ({ aimerPlace, aimed }) => {
    if (aimed.place) return;
    await aimPlayer({ aimerPlace, aimed, roomToken, gameData });
  };

  const validate = () => {
    setShowConfirm(true);
  };

  const confirm = useCallback(async () => {
    if (
      !gamers ||
      !aimed ||
      !Object.keys(actions).length ||
      !roomToken ||
      !gameData
    )
      return;
    await sendActions({
      sender: gamers.find((gamer) => gamer.name === user.name),
      aimed,
      sentActions: actions,
      roomToken,
      gameData,
    });
    setWaiting(true);
  }, [gamers, aimed, actions, roomToken, gameData]);

  const cancel = () => {
    setIsValidated(false);
    setShowConfirm(false);
  };

  useEffect(() => {
    if (!gamers) return;
    const userPlace = gamers?.find((gamer) => gamer.name === user.name)?.place;
    if (phase === "write") {
      const aimed = gamers.find(
        (gamer) => gamer.place === (userPlace % gamers.length) + 1
      );
      setAimed(aimed);
    } else if (phase === "exchange") {
      setActions(gameData.actions[user.name]);
      const prevPlace = userPlace === 1 ? gamers.length : userPlace - 1;
      const prev = gamers.find((gamer) => gamer.place === prevPlace);
      setPrevious(prev);
      setIsValidated(false);
    }
  }, [phase, gamers, gameData]);

  useEffect(() => {
    if (phase !== "write") return;
    let ready = true;
    if (Object.keys(actions).length < 3) ready = false;
    Object.values(actions).forEach((action) => {
      if (action.length < 5) {
        ready = false;
        return;
      }
    });
    if (getAreSimilar(actions)) ready = false;
    setReadyActions(ready);
  }, [actions, phase]);

  const sendBack = async () => {
    setSentBack(selected);
    setIsValidated(false);
    await sendActionBack({
      backed: selected,
      roomToken,
      gameData,
      sender: user.name,
    });
    setSelected({});
  };

  const propose = async () => {
    let hidden;
    for (let key in actions) {
      if (key !== "backed" && key !== sentBack.id && key !== selected.id)
        hidden = { id: key, action: actions[key] };
    }
    setIsProposed(true);
    await proposeAction({
      sender: gamers.find((gamer) => gamer.name === user.name),
      aimedName: aimed.name,
      proposed: selected,
      hidden,
      roomToken,
      gameData,
    });
  };

  useEffect(() => {
    if (phase !== "choose" || showChoose === "waiting") return;
    setChooseTimeout(
      setTimeout(() => {
        setShowChoose("long");
      }, 5000)
    );

    return () => {
      clearTimeout(chooseTimeout);
    };
  }, [phase]);

  const onDecision = ({ decision }) => {
    const proposer = gameData.propositions[user.name].sender;
    let kept;
    let backed;
    if (decision === "accept") {
      kept = gameData.propositions[user.name].proposed;
      backed = gameData.propositions[user.name].hidden;
      setShowChoose("waiting");
    } else {
      kept = gameData.propositions[user.name].hidden;
      backed = gameData.propositions[user.name].proposed;
      setShowChoose("hiddenReveal");
    }

    sendPropositionBack({
      proposer,
      keeper: gamers.find((gamer) => gamer.name === user.name),
      kept,
      backed,
      roomToken,
      gameData,
    });
  };

  useEffect(() => {
    if (showChoose !== "hiddenReveal" || showChoose === "waiting") return;
    setChooseTimeout(
      setTimeout(() => {
        setShowChoose("hiddenLong");
      }, 5000)
    );

    return () => {
      clearTimeout(chooseTimeout);
    };
  }, [showChoose]);

  useEffect(() => {
    if (!isAdmin || !hasReload) return;
    const save = async () => {
      saveData({ roomId, newData: gameData });
    };
    save();
  }, [gameData, hasReload, isAdmin, roomId]);
  useEffect(() => {
    const reload = async () => {
      if (hasReload || !gameData || !gamers.length) return;
      setWaiting(senders?.some((sender) => sender.name === user.name));
      setActions((prevActions) => {
        if (phase === "write") {
          const storedWrittenActions =
            JSON.parse(localStorage.getItem("SGTriaction_writtenActions")) ||
            {};
          const savedToken = storedWrittenActions.roomToken;
          const savedWrittenActions = storedWrittenActions.actions;
          if (savedToken === roomToken) return savedWrittenActions;
        } else if (phase === "exchange") {
          const actions = { ...gameData.actions[user.name] };
          delete actions.backed;
          return actions;
        }
        return prevActions;
      });
      setSentBack((prevSentBack) => {
        if (gameData.backedActions && gameData.backedActions[user.name])
          return gameData.backedActions[user.name];
        else return prevSentBack;
      });

      const userPlace = gamers?.find((gamer) => gamer.name === user.name).place;

      setAimed(() => {
        const aimed = gamers.find(
          (gamer) => gamer.place === (userPlace % gamers.length) + 1
        );
        return aimed;
      });
      setIsProposed(
        gameData.senders.some((sender) => sender.name === user.name) &&
          phase === "exchange"
      );
      setPrevious(() => {
        const prevPlace = userPlace === 1 ? gamers.length : userPlace - 1;
        const prev = gamers.find((gamer) => gamer.place === prevPlace);
        return prev;
      });
      setShowChoose((prevShow) => {
        if (
          senders.some((sender) => sender.name === user.name) &&
          phase !== "write" &&
          phase !== "exchange"
        )
          return "waiting";
        else return prevShow;
      });

      setHasReload(true);
    };
    reload();
  }, [
    gameData,
    roomId,
    isAdmin,
    actions,
    hasReload,
    user,
    senders,
    gamers,
    phase,
  ]);
  useEffect(() => {
    if (showChoose === "waiting" && chooseTimeout) clearTimeout(chooseTimeout);
  }, [showChoose, chooseTimeout]);

  const activeInputRef = useRef(activeInput);
  useEffect(() => {
    activeInputRef.current = activeInput;
  }, [activeInput]);
  const handleSetInput = useCallback(
    (func) => {
      setActions((prevActions) => {
        const currentInput = activeInputRef.current;
        const newValue = func(prevActions[currentInput] || "");
        const updated = {
          ...prevActions,
          [currentInput]: capitalizeFirstLetter(newValue),
        };

        localStorage.setItem(
          "SGTriaction_writtenActions",
          JSON.stringify({ actions: updated, roomToken })
        );

        return updated;
      });
    },
    [roomToken]
  );

  return (
    <div className="flex flex-col items-center justify-start h-full w-full relative overflow-y-auto animate-[fadeIn_1.5s_ease-in-out]">
      {phase === "peek" && (
        <div className="h-full w-full flex flex-col items-center justify-center">
          <div className="mx-3 text-center">
            <div>Règle peek !</div>
            <div>Les joueurs choisissent leur cible</div>
          </div>
          <div>
            {isActive ? (
              <span className="font-bold">A votre tour !</span>
            ) : (
              <div>
                Au tour de{" "}
                <span className="font-bold">{activePlayer.name}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            {gamers.map((gamer, i) => {
              return (
                <button
                  key={i}
                  onClick={() =>
                    isActive && aim({ aimerPlace: place, aimed: gamer })
                  }
                  className={`rounded-md m-2 px-4 py-2 border text-center ${
                    gamer.place
                      ? "bg-red-300 border-red-600"
                      : "bg-green-300 border-green-600"
                  }`}
                >
                  {gamer.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {phase === "write" && (
        <div className="w-[90%] flex flex-col items-center">
          {!waiting ? (
            <>
              {[1, 2, 3].map((number) => (
                <div
                  key={number}
                  className="w-full h-full rounded-md border border-lime-800 my-3 py-2 px-4 flex flex-col items-center justify-center shadow-lg shadow-gray-800 bg-lime-700"
                >
                  {!showConfirm ? (
                    <div className="w-full h-full p-2">
                      <Input
                        input={actions[number]}
                        openKeyboard={() => {
                          setShowedKeyboard(true);
                          setActiveInput(number);
                        }}
                        active={activeInput === number}
                        placeholder={number}
                        outlineColor={{
                          unactive: "transparent",
                          active: "#3f6212",
                        }} // lime-800
                        backgroundColor={{
                          deactivated: "",
                          unactive: "#ecfccb", // lime-100
                          active: "#ecfccb", // lime-100
                        }}
                        placeholderColor={{
                          unactive: "#9ca3af", // gray-400
                          active: "#3f6212", // lime-800
                        }}
                        inputColor={{ unactive: "#9ca3af", active: "#3f6212" }} // gray-400 lime-800
                        rounded="-none"
                        font={vampiro}
                        minHeight="3rem"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full p-1">
                      <div
                        className={`${vampiro.className} w-full p-2 text-center text-red-900 text-lg bg-lime-100 border-4 border-double border-lime-800`}
                        style={{ minHeight: "3rem" }}
                      >
                        {actions[number]}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {showedKeyboard && (
                <TriactionKeyboard
                  setInput={handleSetInput}
                  onClose={() => {
                    setShowedKeyboard(false);
                    setActiveInput(null);
                  }}
                  onValidate={async () => {}}
                  select={{
                    onUp: () =>
                      setActiveInput((prevActive) => {
                        if (prevActive === 1) return 3;
                        return prevActive - 1;
                      }),
                    onDown: () =>
                      setActiveInput((prevActive) => {
                        if (prevActive === 3) return 1;
                        return prevActive + 1;
                      }),
                  }}
                />
              )}

              <div
                onTouchEnd={() => {
                  if (!readyActions || isValidated) return;
                  setShowedKeyboard(false);
                  setIsValidated(true);
                  setActiveInput(null);
                  validate();
                }}
                className={`rounded-md w-full mt-3 px-6 py-4 ${
                  !isValidated
                    ? !readyActions
                      ? "bg-slate-400"
                      : "bg-red-800"
                    : "bg-lime-800"
                }  text-slate-100 relative flex justify-center items-center`}
              >
                <span className="relative z-2 select-none">
                  {!isValidated ? "Envoyer" : "Vraiment ?"}
                </span>
                {isValidated && (
                  <div className="absolute w-full h-full">
                    <div className="w-full h-full relative">
                      <button
                        onTouchEnd={(e) => {
                          e.stopPropagation();
                          confirm();
                        }}
                        className="absolute left-[20%] top-1/2 translate-y-[-50%] border border-lime-800 bg-lime-100 text-lime-800 py-1 px-2 font-semibold rounded-md"
                      >
                        Oui
                      </button>
                      <div
                        onClick={() => cancel()}
                        className="absolute right-[20%] top-1/2 translate-y-[-50%] border border-red-800 bg-red-100 text-red-800 py-1 px-2 font-semibold rounded-md"
                      >
                        Non
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {!showConfirm ? (
                <div className="flex justify-center m-2 text-slate-900">
                  {!readyActions ? (
                    <div>
                      <span className="font-semibold">Ecris</span> tes trois
                      actions pour{" "}
                      <span className="font-semibold">{aimed?.name} </span>.
                    </div>
                  ) : (
                    <div>
                      <span className="font-semibold">Envoyer</span> les trois
                      actions à{" "}
                      <span className="font-semibold">{aimed?.name} </span>.
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col w-[90%]">
                  <div className="flex justify-center text-center m-2">
                    Ces trois actions ne seront plus modifiables, tu confirmes ?
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="absolute w-full h-full flex flex-col justify-center items-center">
              <PendingGamerList gamers={gamers} senders={senders} />
            </div>
          )}
        </div>
      )}

      {phase === "exchange" && (
        <div className="w-full h-full flex flex-col justify-center items-center">
          {!isProposed ? (
            <>
              {!Object.keys(sentBack).length ? (
                <div className="w-[90%] flex flex-col items-center">
                  {actions &&
                    Object.entries(actions).map((action, number) => {
                      if (action[0] === "backed") return;
                      return (
                        <div
                          key={action[0]}
                          onClick={() => {
                            setIsValidated(false);
                            if (
                              Object.keys(selected)?.length &&
                              selected.id === action[0]
                            )
                              setSelected({});
                            else
                              setSelected({
                                id: action[0],
                                aimed: previous,
                                action: action[1],
                              });
                          }}
                          className={`${
                            selected?.id === action[0] && "bg-green-100"
                          } w-full rounded-md border my-2 p-2 flex flex-col items-center relative`}
                          style={{
                            borderColor:
                              selected?.id === action[0]
                                ? "#3f6212"
                                : "#64748b",
                          }} // lime-900 slate-500
                        >
                          <div
                            className={`${vampiro.className} w-full p-2 m-2 text-center`}
                          >
                            {action[1]}
                          </div>
                          <div
                            className="absolute right-0 top-0"
                            style={{
                              writingMode: "vertical-rl",
                              textOrientation: "upright",
                              letterSpacing: "-4px",
                            }}
                          >
                            {previous?.name.slice(0, 3).toUpperCase()}
                          </div>

                          <div
                            className={`absolute right-1.5 bottom-[-2px] font-semibold text-lg mr-${
                              number === 0 ? "0.5" : "0"
                            }`}
                          >
                            {number + 1}
                          </div>
                        </div>
                      );
                    })}

                  <div className="w-full h-full mt-4">
                    <div
                      onTouchEnd={() => {
                        if (isValidated || !Object.keys(selected).length)
                          return;
                        setIsValidated(true);
                      }}
                      className={`rounded-md w-full mt-3 px-6 py-4 ${
                        !isValidated
                          ? !Object.keys(selected).length
                            ? "bg-slate-400"
                            : "bg-red-800"
                          : "bg-lime-800"
                      }  text-slate-100 relative flex justify-center items-center`}
                    >
                      <span className="relative z-2 select-none">
                        {!isValidated ? "Envoyer" : "Vraiment ?"}
                      </span>
                      {isValidated && (
                        <div className="absolute w-full h-full">
                          <div className="w-full h-full relative">
                            <button
                              onTouchEnd={(e) => {
                                e.stopPropagation();
                                sendBack();
                              }}
                              className="absolute left-[20%] top-1/2 translate-y-[-50%] border border-lime-800 bg-lime-100 text-lime-800 py-1 px-2 font-semibold rounded-md"
                            >
                              Oui
                            </button>
                            <div
                              onClick={() => cancel()}
                              className="absolute right-[20%] top-1/2 translate-y-[-50%] border border-red-800 bg-red-100 text-red-800 py-1 px-2 font-semibold rounded-md"
                            >
                              Non
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-full flex text-center justify-center m-2">
                    {!selected.id ? (
                      <div>
                        <span className="font-semibold">Sélectionne</span> une
                        action à <span className="font-semibold">rendre</span> à
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold">Rendre</span> cette
                        action à
                      </div>
                    )}
                    <span className="font-semibold">
                      &nbsp;{previous?.name}&nbsp;.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-[90%] flex flex-col items-center">
                  {Object.entries(actions).map((action, number) => {
                    if (action[0] === "backed") return;
                    const isBacked = action[0] === sentBack.id;
                    return (
                      <div
                        key={action[0]}
                        onClick={() => {
                          if (isBacked) return;
                          setIsValidated(false);
                          if (
                            Object.keys(selected)?.length &&
                            selected.id === action[0]
                          )
                            setSelected({});
                          else
                            setSelected({
                              //check
                              id: action[0],
                              action: action[1],
                            });
                        }}
                        className={`${
                          isBacked
                            ? "bg-slate-100"
                            : selected?.id === action[0] && "bg-green-100"
                        } w-full rounded-md border my-2 p-2 flex flex-col items-center relative`}
                        style={{
                          borderColor:
                            selected?.id === action[0] ? "#3f6212" : "#64748b", // lime-900 slate-500
                        }}
                      >
                        <div
                          className={`${vampiro.className} w-full p-2 m-2 text-center`}
                        >
                          {action[1]}
                        </div>
                        <div
                          className="absolute right-0 top-0"
                          style={{
                            writingMode: "vertical-rl",
                            textOrientation: "upright",
                            letterSpacing: "-4px",
                          }}
                        >
                          {previous.name.slice(0, 3).toUpperCase()}
                        </div>

                        <div
                          className={`absolute right-1.5 bottom-[-2px] font-semibold text-lg mr-${
                            number === 0 ? "0.5" : "0"
                          }`}
                        >
                          {number + 1}
                        </div>
                      </div>
                    );
                  })}

                  <div className="w-full h-full mt-4">
                    <div
                      onTouchEnd={() => {
                        if (isValidated || !Object.keys(selected).length)
                          return;
                        setIsValidated(true);
                      }}
                      className={`rounded-md w-full mt-3 px-6 py-4 ${
                        !isValidated
                          ? !Object.keys(selected).length
                            ? "bg-slate-400"
                            : "bg-red-800"
                          : "bg-lime-800"
                      }  text-slate-100 relative flex justify-center items-center`}
                    >
                      <span className="relative z-2 select-none">
                        {!isValidated ? "Envoyer" : "Vraiment ?"}
                      </span>
                      {isValidated && (
                        <div className="absolute w-full h-full">
                          <div className="w-full h-full relative">
                            <button
                              onTouchEnd={(e) => {
                                e.stopPropagation();
                                propose();
                              }}
                              className="absolute left-[20%] top-1/2 translate-y-[-50%] border border-lime-800 bg-lime-100 text-lime-800 py-1 px-2 font-semibold rounded-md"
                            >
                              Oui
                            </button>
                            <div
                              onClick={() => cancel()}
                              className="absolute right-[20%] top-1/2 translate-y-[-50%] border border-red-800 bg-red-100 text-red-800 py-1 px-2 font-semibold rounded-md"
                            >
                              Non
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-full flex text-center justify-center flex-wrap m-2">
                    {!selected.id ? (
                      <div>
                        <span className="font-semibold">Sélectionne</span> une
                        action à <span className="font-semibold">proposer</span>{" "}
                        à
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold">Proposer</span> à
                      </div>
                    )}
                    <span className="font-semibold">
                      &nbsp;{aimed?.name}&nbsp;.
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <PendingGamerList gamers={gamers} senders={senders} />
          )}
        </div>
      )}

      {phase === "choose" && (
        <div
          className="w-full h-full flex flex-col justify-center items-center"
          onClick={() => {
            clearTimeout(chooseTimeout);
            let newChoose;
            if (["backed", "long"].some((moment) => moment === showChoose))
              newChoose = "proposition";
            else if (
              ["hiddenReveal", "hiddenLong"].some(
                (moment) => moment === showChoose
              )
            )
              newChoose = "waiting";
            newChoose && setShowChoose(newChoose);
          }}
        >
          {(showChoose === "long" || showChoose === "backed") &&
            (() => {
              const backed = gameData.actions[user.name].backed.action;
              const Press = () => {
                if (showChoose === "backed") return null;
                return (
                  <div className="text-white font-bold animate-bounce m-4">
                    APPUIE
                  </div>
                );
              };
              return (
                <>
                  <Press />
                  <div className="w-[90%] rounded-md border border-slate-300 my-2 p-2 flex flex-col items-center bg-white">
                    <label>Action rendue par {aimed?.name}</label>
                    <div
                      className={`${vampiro.className} w-full p-2 m-2 text-center`}
                    >
                      {backed}
                    </div>
                  </div>
                  <Press />
                </>
              );
            })()}

          {showChoose === "proposition" && (
            <SlidingCard
              onDecision={onDecision}
              sender={previous}
              action={gameData.propositions[user.name].proposed.action}
            />
          )}

          {(showChoose === "hiddenReveal" || showChoose === "hiddenLong") &&
            (() => {
              const hidden = gameData.actions[user.name].kept?.action;
              const Press = () => {
                if (showChoose === "hiddenReveal") return null;
                return (
                  <div className="text-white font-bold animate-bounce m-4">
                    APPUIE
                  </div>
                );
              };

              return (
                <>
                  <Press />
                  <div className="w-[90%] rounded-md border border-slate-300 my-2 p-2 flex flex-col items-center bg-white">
                    <label>Action cachée de {previous.name}</label>
                    <div
                      className={`${vampiro.className} w-full p-2 m-2 text-center`}
                    >
                      {hidden}
                    </div>
                  </div>
                  <Press />
                </>
              );
            })()}

          {showChoose === "waiting" && (
            <>
              <PendingGamerList gamers={gamers} senders={senders} />
              <div className="m-4 text-center">
                Les joueurs choissent : l&apos;action visible ou cachée ?
              </div>
            </>
          )}
        </div>
      )}

      {phase === "finalReveal" &&
        (() => {
          const actions = gameData.actions[user.name];
          const backed = {
            label: `Action renvoyée par ${aimed?.name}`,
            action: actions.backed.action,
          };
          const kept = {
            label: `Proposition de ${previous?.name} acceptée`,
            action: actions.kept.action,
          };
          const proposedBack = {
            label: `Proposition non acceptée par ${aimed?.name}`,
            action: actions.proposedBack.action,
          };

          return (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <WrittenCard data={backed} />
              <WrittenCard data={kept} />
              <WrittenCard data={proposedBack} />
            </div>
          );
        })()}
    </div>
  );
}
