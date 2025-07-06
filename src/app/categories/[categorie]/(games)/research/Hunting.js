"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import ReactDOM from "react-dom";

import Image from "next/image";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { specialElite } from "@/assets/fonts";
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
import { TfiHandDrag } from "react-icons/tfi";

import { TouchBackend } from "react-dnd-touch-backend";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5toTouch } from "@/components/DND/HTML5toTouch";
import { usePreview } from "react-dnd-preview";
const ItemType = "Item";

import shuffleArray from "@/utils/shuffleArray";
import getServerTime from "@/utils/getServerTime";

import NextStep from "@/components/NextStep";
import ToggleCheckbox from "@/components/ToggleCheckbox";
import IGCountdownOption from "@/components/IGCountdownOption";
import HuntingCountdown, { NextLocationCountdown } from "./HuntingCountdown";

const hunterIcon = new L.Icon({
  iconUrl: `${process.env.NEXT_PUBLIC_DEHORS_URL}/position.webp`,
  iconSize: [35, 35],
});

const huntedIcon = new L.Icon({
  iconUrl: `${process.env.NEXT_PUBLIC_DEHORS_URL}/runIconGreen.webp`,
  iconSize: [35, 35],
});

const hereIcon = new L.Icon({
  iconUrl: `${process.env.NEXT_PUBLIC_DEHORS_URL}/hereIcon.webp`,
  iconSize: [35, 35],
});

import {
  sendPosition,
  getLastPositions,
  proposeTeams,
  accept,
  decline,
  backToPreparing,
  goNewHunting,
  goToHidding,
  goToPlaying,
  sendGrab,
  amIGrabbed,
  resetGrabEvent,
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

      {!isAdmin && <div>Ecran de création des équipes</div>}
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

const HiddingPhase = ({ isAdmin, gameData, roomId, roomToken, user }) => {
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
          roomId={roomId}
          roomToken={roomToken}
          user={user}
        />
      </div>

      {/* {isAdmin && (
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
      )} */}
    </div>
  );
};

// on user
const UpdateView = ({ center, zoom, setZoom }) => {
  const map = useMap();

  useEffect(() => {
    map.on("zoomend", function (e) {
      setZoom(e.target._zoom);
    });
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
};

// see all
const FitBounds = ({ positions, position, zoom, setZoom }) => {
  const map = useMap();

  useEffect(() => {
    if (!positions || positions.length === 0) return;

    const bounds = L.latLngBounds(
      [...positions, { latitude: position[0], longitude: position[1] }]
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
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: zoom });
    }

    map.on("zoomend", function (e) {
      setZoom(e.target._zoom);
    });
  }, [positions, position, zoom, map]);

  return null;
};

const Alert = ({ onClick }) => {
  const [canClick, setCanClick] = useState(false);

  const handleClick = useCallback(() => {
    if (!canClick) return;
    onClick && onClick();
  }, [canClick, onClick]);

  return ReactDOM.createPortal(
    <div className="w-[100vw] h-[100vh] fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] bg-black flex justify-center items-center z-[1000]">
      <style jsx>
        {`
          @keyframes expandSize {
            0% {
              transform: scale(0);
            }
            100% {
              transform: scale(1);
            }
          }
        `}
      </style>

      <div
        className={`w-full h-full flex flex-col justify-center items-center`}
        style={{ animation: "expandSize 5s" }}
        onAnimationEnd={() => setCanClick(true)}
        onClick={handleClick}
      >
        <div
          className={`${specialElite.className} text-7xl text-red-700 transform scale-y-150`}
        >
          Position
        </div>
        <div
          className={`${specialElite.className} text-7xl text-red-700 transform scale-y-150`}
        >
          envoyée !
        </div>
      </div>
    </div>,
    document.body
  );
};

const Map = ({
  user,
  isAdmin,
  gamerRole,
  roomId,
  roomToken,
  view,
  positions,
  zoom,
  setZoom,
  showAlert,
  setShowAlert,
  gameData,
}) => {
  const [position, setPosition] = useState([48.8566, 2.3522]);
  // const activatedWatch = useRef(false);

  // dev
  // const simulateNewPosition = async () => {
  //   const newPosition = [position[0] + 0.001, position[1] + 0.001];
  //   setPosition(newPosition);
  //   await sendPosition({ roomId, roomToken, user, newPosition });
  // };

  useEffect(() => {
    let lastSentTime = 0;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);

        const now = Date.now();
        if (now - lastSentTime >= 10000) {
          lastSentTime = now;

          const newPosition = coords;
          sendPosition({ roomId, roomToken, user, newPosition }); // no await
        }
      },
      (err) => console.error(err),
      {
        enableHighAccuracy: true,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (showAlert) return <Alert onClick={() => setShowAlert(false)} />;

  return (
    <>
      {showAlert && <Alert onClick={() => setShowAlert(false)} />}

      <div
        className={`w-full h-full flex justify-center items-center relative ${
          showAlert && "hidden"
        }`}
      >
        <MapContainer
          id="map"
          center={position}
          zoom={zoom}
          style={{ height: "70vh", width: "90%" }}
          zoomControl={true}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
        >
          {view === "user" && (
            <UpdateView center={position} zoom={zoom} setZoom={setZoom} />
          )}
          {view === "all" && (
            <FitBounds
              positions={positions}
              position={position}
              zoom={zoom}
              setZoom={setZoom}
            />
          )}

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {positions &&
            positions.map((p, i) => {
              const { name, role, latitude, longitude } = p;
              if (
                (role === "hunter" && gamerRole === "hunted") ||
                typeof latitude !== "number" ||
                typeof longitude !== "number" ||
                isNaN(latitude) ||
                isNaN(longitude)
              )
                return null;
              return (
                <div key={i} className="w-full h-full">
                  <Marker
                    position={[latitude, longitude]}
                    icon={role === "hunter" ? hunterIcon : huntedIcon}
                  >
                    <Popup>
                      {name === user.name
                        ? "Ta dernière position :"
                        : `Dernière position de ${p.name} :`}
                      <br />
                      {latitude}, {longitude}
                    </Popup>
                  </Marker>
                </div>
              );
            })}

          {position && (
            <Marker position={[position[0], position[1]]} icon={hereIcon}>
              <Popup>
                Votre position :<br />
                {position[0]}, {position[1]}
              </Popup>
            </Marker>
          )}

          {/* <button
            onClick={simulateNewPosition}
            style={{ position: "absolute", zIndex: 1000, bottom: 0 }}
          >
            Simuler
          </button> */}
          {isAdmin && (
            <div
              onClick={() => goNewHunting({ gameData, roomId, roomToken })}
              className="absolute flex justify-center bottom-0 z-[1000] left-1/2 translate-x-[–50%]"
            >
              Reset
            </div>
          )}
          {/* <button
            onClick={() => (activatedWatch.current = !activatedWatch.current)}
            style={{ position: "absolute", zIndex: 1000, bottom: 0, right: 0 }}
          >
            {activatedWatch.current
              ? "Désactiver\u00A0watch"
              : "Activer\u00A0watch"}
          </button> */}
        </MapContainer>
      </div>
    </>
  );
};

const HunterGrab = ({
  gameData,
  setShowHunterGrab,
  roomId,
  roomToken,
  userName,
}) => {
  const teams = useMemo(() => {
    return gameData.teams;
  }, [gameData.teams]);
  const hunteds = useMemo(() => {
    return teams.hunteds;
  }, [teams.hunteds]);
  const [aimed, setAimed] = useState();
  const [showConfirm, setShowConfirm] = useState(false);

  const ConfirmButtons = useCallback(
    () => (
      <div className="absolute bottom-0 w-2/3 flex justify-center gap-2">
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowHunterGrab(false);
            sendGrab({ grabber: userName, grabbed: aimed, roomId, roomToken });
          }}
          className="border border-green-700 bg-green-300 text-green-700 p-1 w-full flex justify-center items-center"
        >
          <CheckIcon className="h-10 w-10" />
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowConfirm(false);
            setAimed();
          }}
          className="border border-red-700 bg-red-300 text-red-700 p-1 w-full flex justify-center items-center"
        >
          <XMarkIcon className="h-10 w-10" />
        </div>
      </div>
    ),
    [userName, aimed, roomId, roomToken]
  );

  return (
    <div
      onClick={() => setShowHunterGrab(false)}
      className="w-full h-full relative flex flex-col gap-2 justify-center items-center"
    >
      {hunteds.map((hunted, i) => {
        const isAlive = hunted.alive;
        const isAimed = hunted.name === aimed;

        let color;
        if (!isAlive) {
          color = "slate";
        } else if (isAimed) {
          color = "amber";
        } else {
          color = "sky";
        }

        return (
          <div
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              if (!isAlive) return;
              setAimed(hunted.name);
              setShowConfirm(true);
            }}
            className={`w-2/3 p-2 border border-${color}-700 bg-${color}-300 text-${color}-700 text-lg flex gap-2 justify-center items-center font-semibold`}
          >
            {
              <GiDeathSkull
                className={`h-8 w-8 text-slate-700 ${isAlive && "collapse"}`}
              />
            }
            {hunted.name}
            {
              <GiDeathSkull
                className={`h-8 w-8 text-slate-700 ${isAlive && "collapse"}`}
              />
            }
          </div>
        );
      })}
      {showConfirm && <ConfirmButtons />}
    </div>
  );
};

const ImGrabbedBy = ({ grabbed, grabber, roomId, roomToken }) => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center relative">
      <div className="text-3xl font-semibold">{grabber} vous a attrapé !</div>
      <div className="absolute bottom-0 w-2/3 flex justify-center gap-2">
        <div
          onClick={(e) => {
            e.stopPropagation();
            amIGrabbed({
              isGrabbed: true,
              grabbed,
              grabber,
              roomId,
              roomToken,
            });
          }}
          className="border border-green-700 bg-green-300 text-green-700 p-1 w-full flex justify-center items-center"
        >
          <CheckIcon className="h-10 w-10" />
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
            amIGrabbed({
              isGrabbed: false,
              grabbed,
              grabber,
              roomId,
              roomToken,
            });
          }}
          className="border border-red-700 bg-red-300 text-red-700 p-1 w-full flex justify-center items-center"
        >
          <XMarkIcon className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
};

const PlayingPhase = ({ isAdmin, user, roomId, roomToken, gameData }) => {
  const gamerRole = useMemo(() => {
    if (!gameData.teams) return null;
    const { distribution } = gameData.options;
    if (distribution === "FFA") {
      if (gameData.teams.hunters.some((hunter) => hunter === user.name)) {
        return "hunter";
      } else {
        return "hunted";
      }
    }
  }, [gameData.teams, gameData.options]);
  const [nextLocation, lastLocation] = useMemo(() => {
    return [gameData.nextLocation, gameData.lastLocation];
  }, [gameData.nextLocation, gameData.lastLocation]);
  const geolocation = useMemo(() => {
    return gameData.options.geolocation;
  }, [gameData.options.geolocation]);
  const grabber = useMemo(() => {
    const grabEvents = gameData.grabEvents;
    if (!grabEvents || !grabEvents[user.name]) return null;
    return grabEvents[user.name];
  }, [gameData.grabEvents, user.name]);
  const isAlive = useMemo(() => {
    if (gamerRole === "hunter") return true;
    const gamerStatus = gameData.teams.hunteds.find(
      (hunted) => hunted.name === user.name
    );
    return gamerStatus.alive;
  }, [gamerRole, gameData.teams.hunteds, user.name]);
  const [view, setView] = useState("all");
  const [zoom, setZoom] = useState(17);
  const [positions, setPositions] = useState();
  const [lastSaw, setLastSaw] = useState(0);
  const [isRevealReady, setIsRevealReady] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [showHunterGrab, setShowHunterGrab] = useState(false);
  const [grabEvent, setGrabEvent] = useState();

  const getPositions = useCallback(async () => {
    if (
      isNaN(lastLocation) ||
      isNaN(nextLocation) ||
      !roomId ||
      !roomToken ||
      !gamerRole
    )
      return;

    const serverTime = await getServerTime();

    setIsRevealReady(false);
    setLastSaw(serverTime);

    if (lastSaw > lastLocation && nextLocation - serverTime > 0) return;

    const newPositions = await getLastPositions({
      roomId,
      roomToken,
      gamerRole,
    });
    setPositions(newPositions);
  }, [
    geolocation,
    lastSaw,
    lastLocation,
    nextLocation,
    roomId,
    roomToken,
    gamerRole,
  ]);

  const onHuntersReady = useCallback(async () => {
    if (geolocation === "automatic" && gamerRole === "hunter") {
      getPositions();
    } else {
      setIsRevealReady(true);
    }
  }, [geolocation, gamerRole, roomId, roomToken]);

  useEffect(() => {
    if (geolocation === "automatic") {
      getPositions();
      setView("all");
    } else if (gamerRole === "hunted") {
      geolocation === "manual" && setIsRevealReady(true);
    }
    nextLocation && gamerRole === "hunted" && setShowAlert(true);
  }, [nextLocation, geolocation, gamerRole]);

  useEffect(() => {
    if (gameData.grabEvent) {
      setGrabEvent(gameData.grabEvent);
      setShowHunterGrab(false);
    }
  }, [gameData.grabEvent]);

  if (!isAlive)
    return (
      <div className="w-full h-full flex justify-center items-center">
        Dead mode
      </div>
    );

  if (showHunterGrab)
    return (
      <HunterGrab
        gameData={gameData}
        setShowHunterGrab={setShowHunterGrab}
        roomId={roomId}
        roomToken={roomToken}
        userName={user.name}
      />
    );

  if (grabber) {
    return (
      <ImGrabbedBy
        grabbed={user.name}
        grabber={grabber}
        roomId={roomId}
        roomToken={roomToken}
      />
    );
  }

  if (grabEvent)
    return ReactDOM.createPortal(
      <div
        onClick={async () => {
          await resetGrabEvent({ roomId, roomToken });
          setGrabEvent();
        }}
        className="w-[100vw] h-[100vh] fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] bg-black flex justify-center items-center z-[1000] text-3xl font-semibold text-red-700"
      >
        {grabEvent.grabber} a attrapé {grabEvent.grabbed}&nbsp;!
      </div>,
      document.body
    );

  return (
    <div className="w-full h-full relative">
      <Map
        user={user}
        isAdmin={isAdmin}
        gamerRole={gamerRole}
        roomId={roomId}
        roomToken={roomToken}
        view={view}
        positions={positions}
        zoom={zoom}
        setZoom={setZoom}
        showAlert={showAlert}
        setShowAlert={setShowAlert}
        gameData={gameData}
      />
      <div className="absolute bottom-0 flex w-full justify-center items-center gap-8">
        <div
          onClick={() => {
            setView("all");
            setZoom(17);
            if (geolocation !== "manual") return;
            getPositions();
          }}
          className="w-20 h-20 p-2 flex justify-center items-center"
        >
          <NextLocationCountdown
            nextLocation={nextLocation}
            geolocation={geolocation}
            isRevealReady={isRevealReady}
            onTimeUp={onHuntersReady}
          />
        </div>

        <div
          onClick={async () => {
            setView("user");
          }}
          className="w-20 h-full p-2 flex justify-center items-center"
        >
          <Image src="/hereIcon.png" width={500} height={500} alt="here-icon" />
        </div>

        {gamerRole === "hunter" && (
          <TfiHandDrag
            onClick={() => setShowHunterGrab(true)}
            className="w-20 h-full p-2 flex justify-center items-center text-amber-700 pb-4"
          />
        )}
      </div>
    </div>
  );
};

const EndingPhase = ({ grabEvents }) => {
  const [grabbersVictims, setGrabbersVictims] = useState();
  const [showEndingAlert, setShowEndingAlert] = useState(true);

  useEffect(() => {
    const newGrabbersVictims = Object.entries(grabEvents).reduce(
      (acc, [victim, grabber]) => {
        if (!acc[grabber]) {
          acc[grabber] = [];
        }
        acc[grabber].push(victim);
        return acc;
      },
      {}
    );
    setGrabbersVictims(newGrabbersVictims);
  }, [grabEvents]);

  if (showEndingAlert)
    return ReactDOM.createPortal(
      <div
        onClick={() => setShowEndingAlert(false)}
        className="w-[100vw] h-[100vh] fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] bg-black flex flex-col justify-center items-center z-[1000]"
      >
        <div
          className={`text-white text-3xl font-semibold ${specialElite.className}`}
        >
          Les chassés
        </div>
        <div
          className={`text-white text-3xl font-semibold ${specialElite.className}`}
        >
          ont tous été attrapés !
        </div>
      </div>,
      document.body
    );

  if (!grabbersVictims) return null;

  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-2">
      {Object.entries(grabbersVictims).map(([grabber, victims]) => (
        <div
          key={grabber}
          className="w-full flex flex-col justify-center items-center"
        >
          <div
            className={`w-full flex justify-center items-center text-3xl font-bold ${specialElite.className}`}
          >
            {grabber} a attrapé :
          </div>
          <div className="w-full flex flex-col justify-center items-center">
            {victims.map((victim) => (
              <div
                key={victim}
                className={`text-2xl font-semibold ${specialElite.className}`}
              >
                {victim}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
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
          user={user}
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

      {phase === "ending" && <EndingPhase grabEvents={gameData.grabEvents} />}
    </div>
  );
}
