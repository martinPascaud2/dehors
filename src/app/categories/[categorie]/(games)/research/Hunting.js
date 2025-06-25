"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./hunting.css";
import { IoShuffleOutline } from "react-icons/io5";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { LightningIcon, PersonSimpleRunIcon } from "@phosphor-icons/react";
import { FaBullseye } from "react-icons/fa6";
import {
  GiCrossedSwords,
  GiAutomaticSas,
  GiAngelOutfit,
  GiDeathSkull,
} from "react-icons/gi";
import { FaHandPointUp } from "react-icons/fa";

import { TouchBackend } from "react-dnd-touch-backend";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5toTouch } from "@/components/DND/HTML5toTouch";
import { usePreview } from "react-dnd-preview";
const ItemType = "Item";

import shuffleArray from "@/utils/shuffleArray";

import NextStep from "@/components/NextStep";
import ToggleCheckbox from "@/components/ToggleCheckbox";
import IGCountdownOption from "@/components/IGCountdownOption";
import HuntingCountdown from "./HuntingCountdown";

const userIcon = new L.Icon({
  iconUrl: "/position.png",
  iconSize: [35, 35],
});

import {
  sendPosition,
  getPositions,
  proposeTeams,
  accept,
  decline,
  backToPreparing,
  goNewHunting,
  goToHidding,
  goToPlaying,
} from "./gameActions";

const DroppableItem = ({
  name,
  moveItem,
  setDragged,
  ffaTeams = null,
  vsTeams = null,
}) => {
  const [role, setRole] = useState("undefined");
  const [hoverType, setHoverType] = useState();

  const [{ isOver }, dropRef] = useDrop({
    accept: ItemType,
    hover: (draggedItem) => {
      const { type } = draggedItem;
      setHoverType(type);
    },
    drop: (draggedItem) => {
      // moveItem({ draggedItem });
      moveItem({ draggedItem, name });
      setDragged();
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  useEffect(() => {
    if (!ffaTeams) return;

    const { hunters, hunteds } = ffaTeams;

    if (hunters.has(name)) setRole("hunter");
    else if (hunteds.has(name)) setRole("hunted");
    else setRole("undefined");
  }, [ffaTeams]);

  useEffect(() => {
    if (!vsTeams) return;

    const { hunters: redHunters, hunteds: redHunteds } = vsTeams.red;
    const { hunters: blueHunters, hunteds: blueHunteds } = vsTeams.blue;

    if (redHunters.has(name) || blueHunters.has(name)) setRole("hunter");
    else if (redHunteds.has(name) || blueHunteds.has(name)) setRole("hunted");
    else setRole("undefined");
  }, [vsTeams]);

  const hoverMap = {
    hunter: {
      borderColor: "#b45309", // amber-700
      color: "#b45309", // amber-700
    },
    hunted: {
      borderColor: "#0369a1", // sky-700
      color: "#0369a1", // sky-700
    },
    red: {
      borderColor: "#b91c1c", // red-700
      color: "#b91c1c", // red-700
    },
    blue: {
      borderColor: "#1d4ed8", // blue-700
      color: "#1d4ed8", // blue-700
    },
  };

  const styleMap = {
    hunter: {
      borderColor: isOver ? hoverMap[hoverType].borderColor : "#b45309",
      color: isOver ? hoverMap[hoverType].color : "#b45309",
      backgroundColor: "#fcd34d",
    }, // amber-700 amber-300
    hunted: {
      borderColor: isOver ? hoverMap[hoverType].borderColor : "#0369a1",
      color: isOver ? hoverMap[hoverType].color : "#0369a1",
      backgroundColor: "#7dd3fc",
    }, // sky-700 sky-300
    undefined: {
      borderColor: isOver ? hoverMap[hoverType].borderColor : "#d6d3d1",
      color: isOver ? hoverMap[hoverType].color : "#d6d3d1",
    }, // slate-300
  };

  return (
    <div
      ref={dropRef}
      className="border border-2 p-1 w-full text-center font-semibold text-lg"
      style={styleMap[role]}
    >
      {name}
    </div>
  );
};

const DraggableItem = ({ type, setDragged, dragged }) => {
  const [{ isDragging }, ref] = useDrag({
    type: ItemType,
    item: { type },
    // canDrag: !!value,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    if (!setDragged) return;

    if (isDragging) setDragged(type);
    else setDragged();
  }, [isDragging, setDragged, type]);

  const styleMap = {
    hunter: {
      borderColor: "#b45309",
      // color: "#b45309",
      backgroundColor: "#fcd34d",
    }, // amber-700 amber-300
    hunted: {
      borderColor: "#0369a1",
      // color: "#0369a1",
      backgroundColor: "#7dd3fc",
    }, // sky-700 sky-300
    red: {
      borderColor: "#b91c1c",
      backgroundColor: "#b91c1c",
    }, // red-700
    blue: {
      borderColor: "#1d4ed8",
      backgroundColor: "#1d4ed8",
    }, // blue-700
  };

  return (
    <div
      ref={(node) => ref(node)}
      className={`border w-20 h-12 flex justify-center items-center`}
      style={styleMap[type]}
    >
      {type === "hunter" && (
        <LightningIcon
          size={48}
          className={`text-amber-700 py-1 ${
            dragged === type ? "collapse" : "animate-[fadeIn_0.5s_ease-in-out]"
          }`}
        />
      )}
      {type === "hunted" && (
        <PersonSimpleRunIcon
          size={48}
          className={`text-sky-700 py-1 ${
            dragged === type ? "collapse" : "animate-[fadeIn_0.5s_ease-in-out]"
          }`}
        />
      )}
    </div>
  );
};

const Preview = () => {
  const preview = usePreview();

  if (!preview.display) {
    return null;
  }

  const { item, style } = preview;
  const { type } = item;

  return (
    <div style={{ ...style }}>
      {type === "hunter" && (
        <LightningIcon size={48} className="text-amber-700 py-1" />
      )}
      {type === "hunted" && (
        <PersonSimpleRunIcon size={48} className="text-sky-700 py-1" />
      )}
      {type === "red" && <div className="h-8 w-8 rounded-full bg-red-700" />}
      {type === "blue" && <div className="h-8 w-8 rounded-full bg-blue-700" />}
    </div>
  );
};

const InGameOptions = ({
  setShowedOptions,
  setShowNext,
  gameData,
  roomId,
  roomToken,
}) => {
  const options = useMemo(() => gameData.options, []);
  const [distribution, setDistribution] = useState(options.distribution);
  const [countDownTime, setCountDownTime] = useState(options.countDownTime);
  const [geolocation, setGeolocation] = useState(options.geolocation);
  const [destiny, setDestiny] = useState(options.destiny);

  const handleToggleDistribution = useCallback(() => {
    setDistribution(distribution === "FFA" ? "VS" : "FFA");
  }, [distribution]);

  const handleToggleGeolocation = useCallback(() => {
    setGeolocation(geolocation === "automatic" ? "manual" : "automatic");
  }, [geolocation]);

  const handleToggleDestiny = useCallback(() => {
    setDestiny(destiny === "resurrection" ? "death" : "resurrection");
  }, [destiny]);

  const goNewOptions = useCallback(async () => {
    const newOptions = {
      ...gameData.options,
      distribution,
      countDownTime,
      geolocation,
      destiny,
    };
    const areTeamKept = distribution === gameData.options.distribution;

    await goNewHunting({
      gameData,
      roomId,
      roomToken,
      newOptions,
      areTeamKept,
    });

    setShowedOptions(false);
    setShowNext(false);
  }, [
    distribution,
    geolocation,
    destiny,
    countDownTime,
    gameData.distribution,
  ]);

  return (
    <div
      onClick={() => {
        setShowedOptions(false);
        setShowNext(false);
      }}
      className="h-full w-full relative flex flex-col justify-center items-center gap-4"
    >
      <div className="w-full flex justify-center items-center">
        <div className="mr-2 text-sky-700">
          <FaBullseye className="h-8 w-8 mb-1" />
        </div>
        <ToggleCheckbox
          checked={distribution === "FFA"}
          onChange={handleToggleDistribution}
          colors={{
            bg: { yes: "#fef3c7", no: "#f5f5f4" },
            border: { yes: "#b45309", no: "#44403c" },
          }}
          size={70}
        />
        <div className="ml-2 text-sky-700">
          <GiCrossedSwords className="h-8 w-8 mb-1" />
        </div>
      </div>

      <IGCountdownOption
        setCD={setCountDownTime}
        min={1}
        max={360}
        last={countDownTime}
      />

      <div className="w-full flex justify-center items-center">
        <div className="mr-2 text-sky-700">
          <GiAutomaticSas className="h-8 w-8 mb-1" />
        </div>
        <ToggleCheckbox
          checked={geolocation === "automatic"}
          onChange={handleToggleGeolocation}
          colors={{
            bg: { yes: "#fef3c7", no: "#f5f5f4" },
            border: { yes: "#b45309", no: "#44403c" },
          }}
          size={70}
        />
        <div className="ml-2 text-sky-700">
          <FaHandPointUp className="h-8 w-8 mb-1" />
        </div>
      </div>

      <div className="w-full flex justify-center items-center">
        <div className="mr-2 text-sky-700">
          <GiAngelOutfit className="h-8 w-8 mb-1" />
        </div>
        <ToggleCheckbox
          checked={destiny === "resurrection"}
          onChange={handleToggleDestiny}
          colors={{
            bg: { yes: "#fef3c7", no: "#f5f5f4" },
            border: { yes: "#b45309", no: "#44403c" },
          }}
          size={70}
        />
        <div className="ml-2 text-sky-700">
          <GiDeathSkull className="h-8 w-8 mb-1" />
        </div>
      </div>

      <NextStep
        onClick={() => {
          goNewOptions();
        }}
        iconName="validate"
        ready={true}
      />
    </div>
  );
};

const PreparingPhase = ({
  isAdmin,
  gameData,
  ffaTeams,
  setFfaTeams,
  vsTeams,
  setVsTeams,
  roomId,
  roomToken,
  setShowNext,
}) => {
  const [dragged, setDragged] = useState();
  const [ready, setReady] = useState(false);
  const [showedOptions, setShowedOptions] = useState(false);
  const options = useMemo(() => {
    return gameData.options;
  }, [gameData.options]);

  const moveItem = ({ draggedItem, name }) => {
    if (options.distribution === "FFA") {
      const { type } = draggedItem;

      let {
        hunters: newHunters,
        hunteds: newHunteds,
        undefineds: newUndefineds,
      } = ffaTeams;
      if (type === "hunter") {
        newHunters.add(name);
        newHunteds.delete(name);
        newUndefineds.delete(name);
      } else if (type === "hunted") {
        newHunters.delete(name);
        newHunteds.add(name);
        newUndefineds.delete(name);
      }

      setFfaTeams({
        hunters: new Set([...newHunters].sort()),
        hunteds: new Set([...newHunteds].sort()),
        undefineds: new Set([...newUndefineds].sort()),
      });
    } else if (options.distribution === "VS") {
      const { type } = draggedItem;

      let {
        hunters: newRedHunters,
        hunteds: newRedHunteds,
        undefineds: newRedUndefineds,
      } = vsTeams.red;
      let {
        hunters: newBlueHunters,
        hunteds: newBlueHunteds,
        undefineds: newBlueUndefineds,
      } = vsTeams.blue;

      if (type === "hunter") {
        if (
          newRedHunters.has(name) ||
          newRedHunteds.has(name) ||
          newRedUndefineds.has(name)
        ) {
          newRedHunters.add(name);
          newRedHunteds.delete(name);
          newRedUndefineds.delete(name);
        } else if (
          newBlueHunters.has(name) ||
          newBlueHunteds.has(name) ||
          newBlueUndefineds.has(name)
        ) {
          newBlueHunters.add(name);
          newBlueHunteds.delete(name);
          newBlueUndefineds.delete(name);
        }
      } else if (type === "hunted") {
        if (
          newRedHunters.has(name) ||
          newRedHunteds.has(name) ||
          newRedUndefineds.has(name)
        ) {
          newRedHunters.delete(name);
          newRedHunteds.add(name);
          newRedUndefineds.delete(name);
        } else if (
          newBlueHunters.has(name) ||
          newBlueHunteds.has(name) ||
          newBlueUndefineds.has(name)
        ) {
          newBlueHunters.delete(name);
          newBlueHunteds.add(name);
          newBlueUndefineds.delete(name);
        }
      } else if (type === "red") {
        if (newBlueHunters.has(name)) newRedHunters.add(name);
        else if (newBlueHunteds.has(name)) newRedHunteds.add(name);
        else if (newBlueUndefineds.has(name)) newRedUndefineds.add(name);
        newBlueHunters.delete(name);
        newBlueHunteds.delete(name);
        newBlueUndefineds.delete(name);
      } else if (type === "blue") {
        if (newRedHunters.has(name)) newBlueHunters.add(name);
        else if (newRedHunteds.has(name)) newBlueHunteds.add(name);
        else if (newRedUndefineds.has(name)) newBlueUndefineds.add(name);
        newRedHunters.delete(name);
        newRedHunteds.delete(name);
        newRedUndefineds.delete(name);
      }

      setVsTeams({
        red: {
          hunters: new Set([...newRedHunters].sort()),
          hunteds: new Set([...newRedHunteds].sort()),
          undefineds: new Set([...newRedUndefineds].sort()),
        },
        blue: {
          hunters: new Set([...newBlueHunters].sort()),
          hunteds: new Set([...newBlueHunteds].sort()),
          undefineds: new Set([...newBlueUndefineds].sort()),
        },
      });
    }
  };

  useEffect(() => {
    if (!ffaTeams && !vsTeams) return;

    let ready = true;
    if (options.distribution === "FFA" && ffaTeams) {
      if (ffaTeams.hunters.size === 0) ready = false;
      if (ffaTeams.hunteds.size === 0 && ffaTeams.undefineds.size === 0)
        ready = false;
    } else if (options.distribution === "VS" && vsTeams) {
      if (vsTeams.red.hunters.size === 0) ready = false;
      if (vsTeams.blue.hunters.size === 0) ready = false;
      if (vsTeams.red.hunteds.size === 0 && vsTeams.red.undefineds.size === 0)
        ready = false;
      if (vsTeams.blue.hunteds.size === 0 && vsTeams.blue.undefineds.size === 0)
        ready = false;
    }
    setReady(ready);
  }, [ffaTeams, vsTeams, options.distribution]);

  console.log("vsTeams", vsTeams);

  return (
    <>
      {isAdmin && !showedOptions && (
        <DndProvider backend={TouchBackend} options={{ HTML5toTouch }}>
          <div className="h-full w-full flex flex-col items-center relative">
            <div className="w-full flex justify-center">
              <div className="relative w-full flex flex-col items-center justify-center gap-4">
                {options.distribution === "FFA" && (
                  <>
                    <div className="w-full flex justify-center items-center gap-2 relative">
                      <div className="absolute left-2 top-1/2 translate-y-[-50%] flex items-center">
                        <IoShuffleOutline className="h-12 w-12 border border-black rounded-full text-stone-500 border-stone-500" />
                      </div>

                      <DraggableItem
                        type="hunter"
                        moveItem={moveItem}
                        setDragged={setDragged}
                        dragged={dragged}
                      />
                      <DraggableItem
                        type="hunted"
                        moveItem={moveItem}
                        setDragged={setDragged}
                        dragged={dragged}
                      />

                      <Preview />
                    </div>

                    <div className="flex flex-col items-center gap-2 w-full">
                      {[...ffaTeams.hunters].map((hunter, i) => (
                        <div key={i} className="w-2/3 flex justify-center">
                          <DroppableItem
                            name={hunter}
                            moveItem={moveItem}
                            setDragged={setDragged}
                            ffaTeams={ffaTeams}
                          />
                        </div>
                      ))}
                      {[...ffaTeams.hunteds].map((hunted, i) => (
                        <div key={i} className="w-2/3 flex justify-center">
                          <DroppableItem
                            name={hunted}
                            moveItem={moveItem}
                            setDragged={setDragged}
                            ffaTeams={ffaTeams}
                          />
                        </div>
                      ))}
                      {[...ffaTeams.undefineds].map((undefined, i) => (
                        <div key={i} className="w-2/3 flex justify-center">
                          <DroppableItem
                            name={undefined}
                            moveItem={moveItem}
                            setDragged={setDragged}
                            ffaTeams={ffaTeams}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {options.distribution === "VS" && (
                  <>
                    <div className="w-full flex justify-center relative">
                      <div className="absolute left-2 top-1/2 translate-y-[-50%] flex items-center">
                        <IoShuffleOutline className="h-12 w-12 border border-black rounded-full text-stone-500 border-stone-500" />
                      </div>
                      <div className="w-2/3 flex justify-center items-center gap-2">
                        <DraggableItem
                          type="blue"
                          moveItem={moveItem}
                          setDragged={setDragged}
                          dragged={dragged}
                        />
                        <DraggableItem
                          type="hunter"
                          moveItem={moveItem}
                          setDragged={setDragged}
                          dragged={dragged}
                        />
                        <DraggableItem
                          type="hunted"
                          moveItem={moveItem}
                          setDragged={setDragged}
                          dragged={dragged}
                        />
                        <DraggableItem
                          type="red"
                          moveItem={moveItem}
                          setDragged={setDragged}
                          dragged={dragged}
                        />

                        <Preview />
                      </div>
                    </div>

                    <div className="w-5/6 h-fit flex justify-center gap-4">
                      <div className="h-full w-full border border-red-700 border-x-0 border-b-0 border-t-4 flex flex-col items-center gap-2">
                        {vsTeams &&
                          [...vsTeams.red.hunters].map((hunter, i) => (
                            <div key={i} className="w-full flex justify-center">
                              <DroppableItem
                                name={hunter}
                                moveItem={moveItem}
                                setDragged={setDragged}
                                vsTeams={vsTeams}
                              />
                            </div>
                          ))}
                        {vsTeams &&
                          [...vsTeams.red.hunteds].map((hunted, i) => (
                            <div key={i} className="w-full flex justify-center">
                              <DroppableItem
                                name={hunted}
                                moveItem={moveItem}
                                setDragged={setDragged}
                                vsTeams={vsTeams}
                              />
                            </div>
                          ))}
                        {vsTeams &&
                          [...vsTeams.red.undefineds].map((undefined, i) => (
                            <div key={i} className="w-full flex justify-center">
                              <DroppableItem
                                name={undefined}
                                moveItem={moveItem}
                                setDragged={setDragged}
                                vsTeams={vsTeams}
                              />
                            </div>
                          ))}
                      </div>

                      <div className="h-full w-full border border-blue-700 border-x-0 border-b-0 border-t-4 flex flex-col items-center gap-2">
                        {vsTeams &&
                          [...vsTeams.blue.hunters].map((hunter, i) => (
                            <div key={i} className="w-full flex justify-center">
                              <DroppableItem
                                name={hunter}
                                moveItem={moveItem}
                                setDragged={setDragged}
                                vsTeams={vsTeams}
                              />
                            </div>
                          ))}
                        {vsTeams &&
                          [...vsTeams.blue.hunteds].map((hunted, i) => (
                            <div key={i} className="w-full flex justify-center">
                              <DroppableItem
                                name={hunted}
                                moveItem={moveItem}
                                setDragged={setDragged}
                                vsTeams={vsTeams}
                              />
                            </div>
                          ))}
                        {vsTeams &&
                          [...vsTeams.blue.undefineds].map((undefined, i) => (
                            <div key={i} className="w-full flex justify-center">
                              <DroppableItem
                                name={undefined}
                                moveItem={moveItem}
                                setDragged={setDragged}
                                vsTeams={vsTeams}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="absolute bottom-0">
              <NextStep
                onClick={() =>
                  proposeTeams({ ffaTeams, vsTeams, roomId, roomToken })
                }
                onLongPress={() => {
                  setShowedOptions(true);
                  setShowNext(true);
                }}
                iconName="next"
                ready={ready}
              />
            </div>
          </div>
        </DndProvider>
      )}

      {isAdmin && showedOptions && (
        <InGameOptions
          setShowedOptions={setShowedOptions}
          gameData={gameData}
          roomId={roomId}
          roomToken={roomToken}
          setShowNext={setShowNext}
        />
      )}

      {!isAdmin && <div>Création des équipes</div>}
    </>
  );
};

const ProposingPhase = ({
  isAdmin,
  gameData,
  userName,
  roomId,
  roomToken,
  setShowNext,
}) => {
  const waitingForGamers = useMemo(() => {
    return gameData.waitingForGamers.sort();
  }, [gameData.waitingForGamers]);
  const acceptedGamers = useMemo(() => {
    return gameData.acceptedGamers.sort();
  }, [gameData.acceptedGamers]);
  const decliners = useMemo(() => {
    return gameData.decliners.sort();
  }, [gameData.decliners]);
  const distribution = useMemo(() => {
    return gameData.options.distribution;
  }, [gameData.options.distribution]);

  const [hasChosen, setHasChosen] = useState(false);

  useEffect(() => {
    if (hasChosen) return;
    if (!waitingForGamers.some((waiting) => waiting === userName))
      setHasChosen(true);
  }, [waitingForGamers]);

  const ChooseButtons = useCallback(
    () => (
      <div className="absolute bottom-0 w-2/3 flex justify-center gap-2">
        <div
          onClick={() => accept({ userName, roomId, roomToken })}
          className="border border-green-700 bg-green-300 text-green-700 p-1 w-full flex justify-center items-center"
        >
          <CheckIcon className="h-10 w-10" />
        </div>
        <div
          onClick={() => decline({ userName, roomId, roomToken })}
          className="border border-red-700 bg-red-300 text-red-700 p-1 w-full flex justify-center items-center"
        >
          <XMarkIcon className="h-10 w-10" />
        </div>
      </div>
    ),
    [userName, roomId, roomToken]
  );

  if (!isAdmin && !hasChosen && distribution === "FFA") {
    const { proposed } = gameData;
    const { hunteds, hunters } = proposed;
    return (
      <div className="w-full h-full flex items-start justify-center relative">
        <div className="flex flex-col items-center gap-2 w-2/3">
          {hunters.map((hunter) => (
            <div
              key={hunter}
              className="border border-2 p-1 w-full text-center font-semibold text-lg border-amber-700 bg-amber-300 text-amber-700"
            >
              {hunter}
            </div>
          ))}
          {hunteds.map((hunted) => (
            <div
              key={hunted}
              className="border border-2 p-1 w-full text-center font-semibold text-lg border-sky-700 bg-sky-300 text-sky-700"
            >
              {hunted}
            </div>
          ))}
        </div>

        <ChooseButtons />
      </div>
    );
  }

  if (!isAdmin && !hasChosen && distribution === "VS") {
    const { proposed } = gameData;
    const { red, blue } = proposed;
    return (
      <div className="w-5/6 h-full flex justify-center items-start gap-4 relative">
        {[red, blue].map((team, index) => {
          const { hunteds, hunters } = team;
          return (
            <div
              key={index}
              className={`h-fit w-full border border-${
                index === 0 ? "red" : "blue"
              }-700 border-x-0 border-b-0 border-t-4 flex flex-col items-center gap-2`}
            >
              {hunters.map((hunter) => (
                <div
                  key={hunter}
                  className="border border-2 p-1 w-full text-center font-semibold text-lg border-amber-700 bg-amber-300 text-amber-700"
                >
                  {hunter}
                </div>
              ))}
              {hunteds.map((hunted) => (
                <div
                  key={hunted}
                  className="border border-2 p-1 w-full text-center font-semibold text-lg border-sky-700 bg-sky-300 text-sky-700"
                >
                  {hunted}
                </div>
              ))}
            </div>
          );
        })}

        <ChooseButtons />
      </div>
    );
  }

  return (
    <div
      onClick={() => setShowNext(false)}
      className="w-full h-full flex flex-col items-center relative"
    >
      <div className="w-2/3 flex flex-col items-center gap-2">
        {acceptedGamers.map((gamer, i) => {
          return (
            <div
              key={i}
              className="w-full border border-2 p-1 text-center font-semibold text-lg border-green-700 text-green-700 bg-green-300"
            >
              {gamer}
            </div>
          );
        })}
        {decliners.map((gamer, i) => {
          return (
            <div
              key={i}
              className="w-full border border-2 p-1 text-center font-semibold text-lg border-red-700 text-red-700 bg-red-300"
            >
              {gamer}
            </div>
          );
        })}
        {waitingForGamers.map((gamer, i) => {
          return (
            <div
              key={i}
              className="w-full border border-2 p-1 text-center font-semibold text-lg border-slate-300 text-slate-300"
            >
              {gamer}
            </div>
          );
        })}
      </div>

      {isAdmin && (
        <>
          {acceptedGamers.length !== gameData.gamers.length ? (
            <NextStep
              onClick={async () => {
                setShowNext(false);
                await backToPreparing({ roomId, roomToken });
              }}
              onLongPress={() => setShowNext(true)}
              iconName="cancel"
              ready={true}
            />
          ) : (
            <NextStep
              onClick={() => goToHidding({ roomId, roomToken })}
              onLongPress={() => setShowNext(true)}
              iconName="next"
              ready={true}
            />
          )}
        </>
      )}

      {!isAdmin && decliners.some((decliner) => decliner === userName) && (
        <div className="absolute bottom-0 w-1/3 flex justify-center">
          <div
            onClick={() => accept({ userName, roomId, roomToken })}
            className="border border-green-700 bg-green-300 text-green-700 p-1 w-full flex justify-center items-center mx-1"
          >
            <CheckIcon className="h-10 w-10" />
          </div>
        </div>
      )}
    </div>
  );
};

const HiddingPhase = ({
  isAdmin,
  gameData,
  roomId,
  roomToken,
  setShowNext,
}) => {
  const onTimeUp = useCallback(async () => {
    if (!isAdmin || !roomId || !roomToken) return;
    await goToPlaying({ roomId, roomToken });
  }, [roomId, roomToken]);

  return (
    <div className="h-full w-full relative flex justify-center items-center">
      <div className="h-full w-[80%] flex justify-center items-center">
        <HuntingCountdown
          finishCountdownDate={gameData.startDate}
          onTimeUp={onTimeUp}
        />
      </div>
      {isAdmin && (
        <>
          <div
            onClick={() => goNewHunting({ gameData, roomId, roomToken })}
            className="absolute bottom-0 left-0 text-white"
          >
            Reset
          </div>
          <div
            onClick={() => onTimeUp()}
            className="absolute bottom-0 text-white right-0"
          >
            Passer
          </div>
        </>
      )}
    </div>
  );
};

const RealtimeMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [position]);
  return null;
};

const FitBounds = ({ positions }) => {
  const map = useMap();

  useEffect(() => {
    if (!positions || positions.length === 0) return;

    const bounds = L.latLngBounds(
      positions
        .filter(
          (p) =>
            typeof p.latitude === "number" &&
            typeof p.longitude === "number" &&
            !isNaN(p.latitude) &&
            !isNaN(p.longitude)
        )
        .map((p) => [p.latitude, p.longitude])
    );

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);

  return null;
};

const Map = ({ isAdmin, user, gameData, roomId, roomToken, positions }) => {
  const [position, setPosition] = useState([48.8566, 2.3522]);
  const activatedWatch = useRef(false);

  console.log("positions", positions);
  // dev
  const simulateNewPosition = async () => {
    const newPosition = [position[0] + 0.001, position[1] + 0.001];
    setPosition(newPosition);
    await sendPosition({ roomId, roomToken, user, newPosition });
  };

  useEffect(() => {
    let lastSentTime = 0;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);

        const now = Date.now();

        // const newPosition = coords;
        // sendPosition({ roomId, roomToken, user, newPosition });
        if (now - lastSentTime >= 10000) {
          lastSentTime = now;
          const newPosition = coords;
          if (activatedWatch.current) {
            sendPosition({ roomId, roomToken, user, newPosition });
          }
        }
      },
      (err) => console.error(err),
      {
        enableHighAccuracy: true,
        // timeout: 10000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="w-full h-full flex justify-center items-center relative">
      <MapContainer
        id="map"
        center={position}
        zoom={17}
        style={{ height: "70vh", width: "90%" }}
        // zoomControl={false}
        zoomControl={true}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
      >
        <RealtimeMap position={position} />
        <FitBounds positions={positions} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {positions &&
          positions.map((p, i) => {
            const { latitude, longitude } = p;
            if (
              typeof latitude !== "number" ||
              typeof longitude !== "number" ||
              isNaN(latitude) ||
              isNaN(longitude)
            )
              return null;
            return (
              <div key={i} className="w-full h-full">
                <Marker position={[latitude, longitude]} icon={userIcon}>
                  <Popup>
                    Dernière position de {p.name} :<br />
                    {latitude}, {longitude}
                  </Popup>
                </Marker>
              </div>
            );
          })}
        <button
          onClick={simulateNewPosition}
          style={{ position: "absolute", zIndex: 1000, bottom: 0 }}
        >
          Simuler
        </button>
        {isAdmin && (
          <div
            onClick={() => goNewHunting({ gameData, roomId, roomToken })}
            className="absolute flex justify-center bottom-0 z-[1000] left-1/2 translate-x-[–50%]"
          >
            Reset
          </div>
        )}
        <button
          onClick={() => (activatedWatch.current = !activatedWatch.current)}
          style={{ position: "absolute", zIndex: 1000, bottom: 0, right: 0 }}
        >
          {activatedWatch.current
            ? "Désactiver\u00A0watch"
            : "Activer\u00A0watch"}
        </button>
      </MapContainer>
    </div>
  );
};

const PlayingPhase = ({ isAdmin, user, roomId, roomToken, gameData }) => {
  const [positions, setPositions] = useState(gameData.positions);

  return (
    <>
      <Map
        isAdmin={isAdmin}
        user={user}
        gameData={gameData}
        roomId={roomId}
        roomToken={roomToken}
        positions={positions}
      />
      <div
        onClick={async () => {
          const newPositions = await getPositions({ roomId });
          setPositions(newPositions);
        }}
        className="absolute bottom-10"
      >
        Positions
      </div>
    </>
  );
};

export default function Hunting({
  roomId,
  roomToken,
  user,
  gameData,
  setShowNext,
  setGameBackground,
}) {
  const isAdmin = useMemo(() => {
    return user.name === gameData.admin;
  }, [gameData.admin]);
  const isEnded = useMemo(() => {
    return gameData.ended;
  }, [gameData.ended]);
  const phase = useMemo(() => {
    return gameData.phase;
  }, [gameData.phase]);
  const [ffaTeams, setFfaTeams] = useState(
    gameData.ffaTeams || {
      hunters: new Set(),
      hunteds: new Set(),
      undefineds: new Set(gameData.gamers.map((gamer) => gamer.name)),
    }
  );
  const [vsTeams, setVsTeams] = useState();

  useEffect(() => {
    const { distribution } = gameData.options;
    if (distribution !== "FFA") return;

    if (phase === "preparing" && gameData.keepTeams)
      setFfaTeams({
        hunters: new Set(gameData.proposed.hunters.sort()),
        hunteds: new Set(gameData.proposed.hunteds.sort()),
        undefineds: new Set(),
      });
    else if (phase === "preparing" && !gameData.keepTeams) {
      setFfaTeams({
        hunters: new Set(),
        hunteds: new Set(),
        undefineds: new Set(gameData.gamers.map((gamer) => gamer.name).sort()),
      });
    }
  }, [phase, gameData.keepTeams, isEnded, gameData.options.distribution]);

  useEffect(() => {
    const { distribution } = gameData.options;
    if (distribution !== "VS") return;

    if (phase === "preparing" && gameData.keepTeams && gameData.proposed) {
      setVsTeams({
        red: {
          hunters: new Set(gameData.proposed.red.hunters.sort()),
          hunteds: new Set(gameData.proposed.red.hunteds.sort()),
          undefineds: new Set(),
        },
        blue: {
          hunters: new Set(gameData.proposed.blue.hunters.sort()),
          hunteds: new Set(gameData.proposed.blue.hunteds.sort()),
          undefineds: new Set(),
        },
      });
    } else if (phase === "preparing" && !gameData.keepTeams) {
      const shuffledGamers = shuffleArray(
        gameData.gamers.map((gamer) => gamer.name)
      );
      const middle = Math.ceil(shuffledGamers.length / 2);
      const redTeam = shuffledGamers.slice(0, middle);
      const blueTeam = shuffledGamers.slice(middle);

      const randomTeams = gameData.vsTeams || {
        red: {
          hunters: new Set(),
          hunteds: new Set(),
          undefineds: new Set(redTeam.sort()),
        },
        blue: {
          hunters: new Set(),
          hunteds: new Set(),
          undefineds: new Set(blueTeam.sort()),
        },
      };

      setVsTeams(randomTeams);
    }
  }, [phase, gameData.keepTeams, isEnded, gameData.options.distribution]);

  useEffect(() => {
    if (phase === "hidding") setGameBackground("black");
    else setGameBackground("smoke");
  }, [phase]);

  if (isEnded) return null;

  return (
    <div className="h-full w-full flex flex-col items-center relative">
      {phase === "preparing" && (
        <PreparingPhase
          isAdmin={isAdmin}
          gameData={gameData}
          ffaTeams={ffaTeams}
          setFfaTeams={setFfaTeams}
          vsTeams={vsTeams}
          setVsTeams={setVsTeams}
          roomId={roomId}
          roomToken={roomToken}
          setShowNext={setShowNext}
        />
      )}

      {phase === "proposing" && (
        <ProposingPhase
          isAdmin={isAdmin}
          gameData={gameData}
          userName={user.name}
          roomId={roomId}
          roomToken={roomToken}
          setShowNext={setShowNext}
        />
      )}

      {phase === "hidding" && (
        <HiddingPhase
          isAdmin={isAdmin}
          gameData={gameData}
          roomId={roomId}
          roomToken={roomToken}
          setShowNext={setShowNext}
        />
      )}

      {phase === "playing" && (
        <PlayingPhase
          isAdmin={isAdmin}
          user={user}
          gameData={gameData}
          roomId={roomId}
          roomToken={roomToken}
        />
      )}
    </div>
  );
}
