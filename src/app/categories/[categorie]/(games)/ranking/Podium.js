"use client";

import ReactDOM from "react-dom";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";

import usePreventScroll from "@/utils/usePreventScroll";
import {
  toggleTarget,
  toggleTop,
  addTheme,
  addObject,
  goPreTurnFast,
  adminEditing,
  editValues,
  addValue,
  deletePlayer,
  goTurnPhase,
  sendTops,
  showResults,
} from "./gameActions";

import ToggleCheckbox from "@/components/ToggleCheckbox";
import AnimatedDots from "@/components/AnimatedDots";
import NextStep, { ValidateButton } from "@/components/NextStep";
import Keyboard from "@/components/keyboard/Keyboard";
import Input from "@/components/keyboard/Input";
import ControlButton from "@/components/ControlButton";

import { IoPeople } from "react-icons/io5";
import { BsThreeDots } from "react-icons/bs";
import { SlBubble } from "react-icons/sl";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdArrowDropright } from "react-icons/io";
import { TfiWrite } from "react-icons/tfi";
import { GiPodium } from "react-icons/gi";
import { FaPlus } from "react-icons/fa6";
import { TiDelete } from "react-icons/ti";

import Infinity from "@/components/icons/Infinity";
import Gold from "/public/gold.png";
import Silver from "/public/silver.png";
import Bronze from "/public/bronze.png";

import { TouchBackend } from "react-dnd-touch-backend";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5toTouch } from "@/components/DND/HTML5toTouch";
import { usePreview } from "react-dnd-preview";
const ItemType = "Item";

const PreparingPhase = ({
  gameData,
  roomId,
  roomToken,
  isAdmin,
  setShowNext,
}) => {
  const [showedToggle, setShowedToggle] = useState(false);
  const [showedInfo, setShowedInfo] = useState(false);
  const [input, setInput] = useState("");
  const [showedKeyboard, setShowedKeyboard] = useState(true);

  const { options, theme, objects } = gameData;
  const { target, top } = options;
  const [checkedTarget, setCheckedTarget] = useState(target === "players");
  const [checkedTop, setCheckedTop] = useState(top === "3");

  const objectNumber = objects ? Object.keys(objects).length + 1 : 1;

  const handleToggleTarget = useCallback(async () => {
    await toggleTarget({ gameData, roomId, roomToken });
  }, [gameData, roomId, roomToken]);
  const handleToggleTop = useCallback(async () => {
    await toggleTop({ gameData, roomId, roomToken });
  }, [gameData, roomId, roomToken]);
  useEffect(() => {
    setCheckedTarget(target === "players");
    setCheckedTop(top === "3");
  }, [target, top]);

  useEffect(() => {
    if (gameData.ended) setShowedKeyboard(false);
  }, [gameData.ended]);

  return (
    <div className="h-full w-full flex flex-col justify-center items-center relative">
      {isAdmin ? (
        <>
          {!theme && (
            <div
              onClick={() =>
                !gameData.ended && (setShowNext(false), setShowedKeyboard(true))
              }
              className={`w-full h-full flex justify-center absolute top-[5%]`}
            >
              <div
                onClick={() => {
                  setShowedToggle(false);
                  setShowedInfo(false);
                }}
                className="w-full flex justify-around"
              >
                <ControlButton
                  layout="!"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowedInfo(false);
                    setShowedToggle(!showedToggle);
                  }}
                />
                <ControlButton
                  layout="?"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowedInfo(!showedInfo);
                    setShowedToggle(false);
                  }}
                />
              </div>
            </div>
          )}

          {!theme && (
            <>
              <div className="absolute top-[12%] flex w-full justify-center items-center h-20">
                {showedToggle && (
                  <div className="w-full flex flex-col items-center gap-4">
                    <div className="w-full flex justify-center items-center">
                      <div className="mr-2 text-stone-100">
                        <IoPeople className="h-8 w-8" />
                      </div>
                      <ToggleCheckbox
                        checked={checkedTarget}
                        onChange={handleToggleTarget}
                        colors={{
                          bg: { yes: "#fef3c7", no: "#f5f5f4" },
                          border: { yes: "#b45309", no: "#44403c" },
                        }}
                        size={70}
                      />
                      <div className="ml-2 text-stone-100">
                        <BsThreeDots className="h-8 w-8" />
                      </div>
                    </div>

                    <div className="w-full flex justify-center items-center">
                      <div className="mr-2 text-stone-100">
                        <GiPodium className="h-8 w-8 mb-2" />
                      </div>
                      <ToggleCheckbox
                        checked={checkedTop}
                        onChange={handleToggleTop}
                        colors={{
                          bg: { yes: "#fef3c7", no: "#f5f5f4" },
                          border: { yes: "#b45309", no: "#44403c" },
                        }}
                        size={70}
                      />
                      <div className="ml-2 text-stone-100">
                        <Infinity size={32} />
                      </div>
                    </div>
                  </div>
                )}
                {showedInfo && (
                  <div className="w-fit border rounded-md border-stone-700 bg-stone-100 text-stone-700 p-2 flex flex-col">
                    <div className="text-stone-700 text-sm w-full flex items-center">
                      <IoPeople className="h-8 w-8" />
                      <span>
                        &nbsp;Classez les autres joueurs en fonction du critère
                      </span>
                    </div>
                    <div className="text-stone-700 text-sm w-full flex items-center">
                      <BsThreeDots className="h-8 w-8" />
                      <span>
                        &nbsp;Classez les objets en fonction du critère
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {ReactDOM.createPortal(
                <div
                  className="w-[100vw] fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] flex items-center justify-center"
                  style={{
                    height: `${window.screen.height}px`,
                    zIndex: 100,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    className="flex justify-center items-center h-8 w-48"
                    style={{
                      pointerEvents: "auto",
                    }}
                  >
                    <Input
                      input={input}
                      openKeyboard={() => {
                        setShowedKeyboard(true);
                        setShowedInfo(false);
                        setShowedToggle(false);
                        setShowNext(false);
                      }}
                      active={showedKeyboard}
                      placeholder="Critère"
                    />
                  </div>
                </div>,
                document.body
              )}

              {showedKeyboard && (
                <Keyboard
                  input={input}
                  setInput={(func) => {
                    setInput((prev) => capitalizeFirstLetter(func(prev)));
                  }}
                  onClose={() => {}}
                  onValidate={async () => {
                    if (input.length < 4) return;
                    else if (input.length > 15) return;
                    await addTheme({
                      gameData,
                      roomId,
                      roomToken,
                      theme: input,
                    });
                    setInput("");
                  }}
                  onLongPress={
                    isAdmin &&
                    (() => {
                      setShowedKeyboard(false);
                      setShowNext(true);
                    })
                  }
                  ready={input.length >= 4 && input.length <= 15}
                />
              )}
            </>
          )}

          {theme && !gameData.ended && (
            <div
              onClick={() => {
                setShowNext(false);
                setShowedKeyboard(true);
              }}
              className="relative w-full h-full flex items-center"
            >
              {ReactDOM.createPortal(
                <div
                  className="w-[100vw] fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] flex items-center justify-center"
                  style={{
                    height: `${window.screen.height}px`,
                    zIndex: 100,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    className="flex justify-center items-center h-8 w-48 relative"
                    style={{
                      pointerEvents: "auto",
                    }}
                  >
                    <div
                      className={`w-full flex justify-center absolute bottom-full mb-12 ${
                        objectNumber < 4 && "hidden"
                      }`}
                    >
                      <ValidateButton
                        onClick={() =>
                          goPreTurnFast({ gameData, roomId, roomToken })
                        }
                        iconName="next"
                      >
                        Suite
                      </ValidateButton>
                    </div>

                    <Input
                      input={input}
                      openKeyboard={() => {
                        setShowedKeyboard(true);
                        setShowedInfo(false);
                        setShowedToggle(false);
                        setShowNext(false);
                      }}
                      active={showedKeyboard}
                      placeholder={`Objet ${objectNumber}`}
                    />
                  </div>
                </div>,
                document.body
              )}

              {showedKeyboard && (
                <Keyboard
                  input={input}
                  setInput={(func) => {
                    setInput((prev) => capitalizeFirstLetter(func(prev)));
                  }}
                  onClose={() => {}}
                  onValidate={async () => {
                    if (input.length < 4 && target === "others") return;
                    else if (input.length < 2 && target === "players") return;
                    else if (input.length > 15) return;

                    await addObject({
                      objectNumber,
                      gameData,
                      roomId,
                      roomToken,
                      object: input,
                    });
                    setInput("");
                  }}
                  onLongPress={(() => {
                    if (!isAdmin) return;
                    else
                      return () => {
                        setShowedKeyboard(false);
                        setShowNext(true);
                      };
                  })()}
                  ready={
                    ((input.length >= 4 && target === "others") ||
                      (input.length >= 2 && target === "players")) &&
                    input.length <= 15
                  }
                />
              )}
            </div>
          )}
        </>
      ) : (
        <div className="h-32 w-full relative pl-28">
          <div className="relative h-full w-full">
            <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">
              <SlBubble className="w-16 h-16" />
            </div>
            <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-60%]">
              <IoSettingsSharp
                className="w-8 h-8"
                style={{
                  animation: "spin360 2s linear infinite",
                }}
              />
              <style jsx>{`
                @keyframes spin360 {
                  0% {
                    transform: rotate(0deg);
                  }
                  100% {
                    transform: rotate(360deg);
                  }
                }
              `}</style>
            </div>
            <div
              className="absolute bottom-0 text-2xl font-bold"
              style={{ right: "calc(50% + 2rem)" }}
            >
              {gameData.admin}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PreturnPhase = ({
  gameData,
  roomId,
  roomToken,
  isAdmin,
  setShowNext,
}) => {
  const [input, setInput] = useState("");
  const [showedKeyboard, setShowedKeyboard] = useState(false);

  const { theme, objects, adminEdition, options } = gameData;
  const { target } = options;
  const [isChanging, setIsChanging] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [isAdding, setIsAdding] = useState(null);
  const [addingPlace, setAddingPlace] = useState(null);
  const [editedObjects, setEditedObjects] = useState(null);

  const [type, setType] = useState("");
  const [objectKey, setObjectKey] = useState("");

  let ready;
  if (input.length < 4 && target === "others") ready = false;
  else if (input.length < 2 && target === "players") ready = false;
  else if (input.length < 4 && type === "theme") ready = false;
  else if (input.length > 15) ready = false;
  else ready = true;

  useEffect(() => {
    if (!isAdding) {
      setEditedObjects(null);
      return;
    }

    if (editedObjects) {
      setEditedObjects((prevEditedObjects) => {
        return { ...prevEditedObjects, [addingPlace]: input };
      });
    } else {
      const newEditedObjects = { ...objects };
      const maxKey = Object.keys(newEditedObjects).length;
      for (let i = maxKey; i >= addingPlace; i--) {
        newEditedObjects[i + 1] = newEditedObjects[i];
      }
      newEditedObjects[addingPlace] = input;
      setEditedObjects(newEditedObjects);
    }
  }, [isAdding, setEditedObjects, objects, addingPlace, input]);

  return (
    <div
      onClick={() => !gameData.ended && setShowNext(false)}
      className="h-full w-full flex flex-col justify-center items-center relative"
    >
      <div className="w-full flex flex-col items-center">
        <div className="flex justify-center mb-2.5">
          <div className="flex items-center relative">
            {isAdmin ? (
              <div
                onClick={() => {
                  if (!isChanging || !isAdmin) return;
                  setType("theme");
                  setIsEditing("theme");
                  setInput(theme);
                  setShowedKeyboard(true);
                  setShowNext(false);
                  adminEditing({
                    type: "theme",
                    objectKey: null,
                    roomId,
                    roomToken,
                  });
                }}
                className={`font-bold text-3xl border border-2 ${
                  !isChanging
                    ? "text-stone-700 bg-stone-100"
                    : isEditing === null
                    ? "text-amber-700 bg-amber-100"
                    : isEditing !== "theme"
                    ? "text-stone-700 bg-stone-100"
                    : "text-sky-700 bg-sky-100"
                } px-2 py-0.5`}
                style={{
                  borderColor: !isChanging
                    ? "#44403c" // stone-700
                    : isEditing === null
                    ? "#b45309" // amber-700
                    : isEditing !== "theme"
                    ? "#44403c" // stone-700
                    : "#0369a1", // sky-700
                }}
              >
                <div className="whitespace-nowrap">
                  {adminEdition?.type === "theme" && isEditing === "theme"
                    ? input
                    : theme}
                </div>
              </div>
            ) : (
              <div className="flex items-center relative">
                <div
                  className={`font-bold text-3xl border border-2 ${
                    adminEdition?.type === "theme"
                      ? "text-sky-700 bg-sky-100"
                      : "text-stone-700 bg-stone-100"
                  } px-2 py-0.5`}
                  style={{
                    borderColor:
                      adminEdition?.type === "theme" ? "#0369a1" : "#44403c", // sky-700 stone-700
                  }}
                >
                  <div className="whitespace-nowrap">
                    {adminEdition?.type === "theme" && isEditing === "theme"
                      ? input
                      : theme}
                  </div>
                </div>
                {adminEdition?.type === "theme" && (
                  <div className="flex items-center absolute left-full">
                    <TfiWrite className="w-5 h-5 ml-1 text-sky-700" />
                    <AnimatedDots color="#0369a1" />
                  </div>
                )}
              </div>
            )}
            {target === "players" && isAdmin && (
              <div
                onClick={() => {
                  if (gameData.ended) return;
                  setType("theme");
                  setIsChanging(!isChanging);
                  setIsEditing("theme");
                  setInput(theme);
                  setShowedKeyboard(true);
                  setShowNext(false);
                  adminEditing({
                    type: "theme",
                    objectKey: null,
                    roomId,
                    roomToken,
                  });
                }}
                className="absolute left-full ml-2 text-amber-700"
              >
                <TfiWrite className="w-8 h-8" />
              </div>
            )}
          </div>
        </div>

        {Object.entries(editedObjects || objects).map(([key, value]) => {
          let dynamicValue;
          if (isAdmin && isEditing === key) dynamicValue = input;
          else dynamicValue = value;
          return (
            <div key={key} className="flex justify-center mb-1.5">
              {isAdmin ? (
                target === "others" ? (
                  <div
                    onClick={() => {
                      if (!isChanging || !isAdmin) return;
                      setType("objects");
                      setObjectKey(key);
                      setInput(value);
                      setIsEditing(key);
                      setShowedKeyboard(true);
                      setShowNext(false);
                      adminEditing({
                        type: "objects",
                        objectKey: key,
                        roomId,
                        roomToken,
                      });
                    }}
                    className={`flex items-center py-0.5 border pr-2 mr-3 ${
                      !isChanging && !isAdding
                        ? "text-stone-700 bg-stone-100"
                        : isEditing === null && addingPlace === null
                        ? "text-amber-700 bg-amber-100"
                        : isEditing !== key && addingPlace !== parseInt(key)
                        ? "text-stone-700 bg-stone-100"
                        : "text-sky-700 bg-sky-100"
                    } rounded-sm`}
                    style={{
                      borderColor: !isChanging
                        ? "#44403c" // stone-700
                        : isEditing === null
                        ? "#b45309" // amber-700
                        : isEditing !== key
                        ? "#44403c" // stone-700
                        : "#0369a1", // sky-700
                    }}
                  >
                    <IoMdArrowDropright className="w-5 h-5 mt-0.5" />
                    <div className="whitespace-nowrap text-2xl">
                      {(dynamicValue.length && dynamicValue) || "..."}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`flex items-center justify-center py-0.5 border pr-2 mr-3 relative ${
                      addingPlace !== parseInt(key)
                        ? "text-stone-700 bg-stone-100"
                        : "text-sky-700 bg-sky-100"
                    }`}
                    style={{
                      borderColor:
                        addingPlace !== parseInt(key) ? "#44403c" : "#0369a1", // stone-700 sky-700
                    }}
                  >
                    <IoMdArrowDropright className="w-5 h-5 mt-0.5" />
                    <div className="whitespace-nowrap text-2xl">
                      {(value.length && value) || "..."}
                    </div>
                    <div className="absolute left-full ml-2">
                      <TiDelete
                        onClick={async () => {
                          if (gameData.ended) return;
                          await deletePlayer({
                            key,
                            gameData,
                            roomId,
                            roomToken,
                          });
                        }}
                        className="w-8 h-8 text-amber-700"
                      />
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center relative">
                  <div
                    className={`flex items-center border ${
                      adminEdition?.type === "objects" &&
                      adminEdition.objectKey === key
                        ? "text-sky-700 bg-sky-100"
                        : "text-stone-700 bg-stone-100"
                    } pr-2 py-0.5`}
                    style={{
                      borderColor:
                        adminEdition?.type === "objects" &&
                        adminEdition.objectKey === key
                          ? "#0369a1"
                          : "#f5f5f4", // sky-700 stone-100
                    }}
                  >
                    <IoMdArrowDropright className="w-5 h-5 mt-0.5" />
                    <div className="whitespace-nowrap text-2xl">{value}</div>
                  </div>
                  {adminEdition?.type === "objects" &&
                    adminEdition.objectKey === key && (
                      <div className="flex items-center absolute left-full">
                        <TfiWrite className="w-5 h-5 ml-1 text-sky-700" />
                        <AnimatedDots color="#0369a1" />
                      </div>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isAdmin && (
        <>
          {target === "others" && (
            <div
              className={`mt-4 border ${
                !isChanging
                  ? "border-amber-700 bg-amber-100 text-amber-700"
                  : "border-sky-700 bg-sky-100 text-sky-700"
              } p-2`}
            >
              <TfiWrite
                onClick={() => !gameData.ended && setIsChanging(!isChanging)}
                className="w-8 h-8"
              />
            </div>
          )}

          <div
            className={`mt-4 border ${
              !isAdding
                ? "border-amber-700 bg-amber-100 text-amber-700"
                : "border-sky-700 bg-sky-100 text-sky-700"
            } p-2`}
          >
            <FaPlus
              onClick={() => {
                if (gameData.ended) return;
                setIsAdding(!isAdding);
                setType("objects");
                setShowedKeyboard(true);
                setShowNext(false);

                let newAddingPlace;
                if (target === "others")
                  newAddingPlace = Object.keys(objects).length + 1;
                else
                  newAddingPlace =
                    Math.floor(
                      Math.random() * (Object.keys(objects).length + 1)
                    ) + 1;
                setAddingPlace(newAddingPlace);
              }}
              className="w-8 h-8"
            />
          </div>

          {showedKeyboard && (
            <Keyboard
              input={input}
              setInput={(func) => {
                setInput((prev) => capitalizeFirstLetter(func(prev)));
              }}
              onClose={() => {
                adminEditing({
                  type: "",
                  objectKey: {},
                  roomId,
                  roomToken,
                });
                setIsChanging(false);
                setIsEditing(null);
                setIsAdding(null);
                setAddingPlace(null);
                setShowedKeyboard(false);
                setInput("");
                setShowNext(true);
              }}
              onValidate={async () => {
                if (!ready) return;

                if (isAdding) {
                  await addValue({
                    gameData,
                    roomId,
                    roomToken,
                    value: input,
                    addingPlace,
                  });
                } else if (isEditing) {
                  await editValues({
                    gameData,
                    roomId,
                    roomToken,
                    type,
                    newValue: input,
                    objectKey,
                  });
                }

                setInput("");
                setIsChanging(false);
                setIsEditing(null);
                setIsAdding(null);
                setAddingPlace(null);
                setShowedKeyboard(false);
              }}
              ready={ready}
            />
          )}
        </>
      )}

      {isAdmin && !gameData.ended && (
        <div className={`mt-8 ${showedKeyboard && "collapse"}`}>
          <NextStep
            onClick={() => goTurnPhase({ gameData, roomId, roomToken })}
            onLongPress={isAdmin && (() => setShowNext(true))}
            iconName="next"
            ready={Object.keys(objects).length >= 3}
          >
            Suite
          </NextStep>
        </div>
      )}
    </div>
  );
};

const DraggableItem = ({
  type,
  index,
  value,
  moveItem,
  setDraggedTop,
  draggedTop,
}) => {
  const [{ isDragging }, ref] = useDrag({
    type: ItemType,
    item: { type, index, value },
    canDrag: !!value,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    // hover: (draggedItem) => {
    drop: (draggedItem) => {
      if (draggedItem.index === index) return;
      moveItem({ draggedItem, to: { type, index, value } });
    },
  });

  useEffect(() => {
    if (isDragging && type === "top") {
      setDraggedTop(index);
    }
    if (!isDragging && type === "top" && draggedTop === index) {
      setDraggedTop(null);
    }
  }, [isDragging, type, setDraggedTop, draggedTop, index]);

  return (
    <div
      ref={(node) => ref(drop(node))}
      className={`text-center text-${
        type === "item" ? "base" : "2xl"
      } border p-2 my-1 border ${
        type !== "top"
          ? !isDragging
            ? "border-amber-700 bg-amber-100 text-amber-700"
            : "border-sky-700 bg-sky-100 text-sky-700"
          : !value
          ? "border-sky-700 bg-sky-100 text-sky-700 border-dashed"
          : !isDragging
          ? "border-amber-700 bg-amber-100 text-amber-700"
          : "border-sky-700 bg-sky-100 text-sky-700 border-dashed"
      }`}
      style={{
        width: type === "item" ? "30%" : "50%",
      }}
    >
      {value || "..."}
    </div>
  );
};

const OutsideItem = ({ moveItem }) => {
  const [, globalDropRef] = useDrop({
    accept: ItemType,
    drop: (draggedItem) => {
      moveItem({ draggedItem });
    },
  });
  return <div ref={globalDropRef} className="w-full h-full" />;
};

const Preview = ({}) => {
  const preview = usePreview();

  if (!preview.display) {
    return null;
  }

  const { item, style } = preview;
  const { value } = item;

  return (
    <div
      className={`p-2 z-40 border border-amber-700 bg-amber-100 text-center text-amber-700 text-${
        item.type === "item" ? "base" : "2xl"
      }`}
      style={{ ...style, width: item.type === "item" ? "30%" : "50%" }}
    >
      {value}
    </div>
  );
};

const Validate = ({
  tops,
  user,
  gameData,
  roomId,
  roomToken,
  setHasValidated,
  moveItem,
  children,
}) => {
  const threeTops = Object.keys(tops).length === 3;
  const allTopsDefined = Object.values(tops).every((top) => top !== undefined);

  const [, dropRef] = useDrop({
    accept: ItemType,
    drop: (draggedItem) => {
      moveItem({ draggedItem });
    },
  });

  return (
    <div
      ref={dropRef}
      onClick={async () => {
        if (!threeTops || !allTopsDefined) return;
        await sendTops({ user, tops, gameData, roomId, roomToken });
        setHasValidated(true);
      }}
    >
      {children}
    </div>
  );
};

const ThemeTitle = ({ theme, moveItem }) => {
  const [, dropRef] = useDrop({
    accept: ItemType,
    drop: (draggedItem) => {
      moveItem({ draggedItem });
    },
  });
  return (
    <div
      ref={dropRef}
      className="absolute bottom-full w-full text-center text-3xl font-bold mb-4"
    >
      {theme}
    </div>
  );
};

const TurnPhase = ({
  gameData,
  roomId,
  roomToken,
  user,
  isAdmin,
  setShowNext,
}) => {
  const [items, setItems] = useState();
  const [tops, setTops] = useState({});
  const [draggedTop, setDraggedTop] = useState(null);
  const [hasValidated, setHasValidated] = useState(false);

  const threeTops = Object.keys(tops).length === 3;
  const allTopsDefined = Object.values(tops).every((top) => top !== undefined);
  const ready = threeTops && allTopsDefined;

  useEffect(() => {
    if (!gameData.objects) {
      setItems(() => {
        const { gamers } = gameData;
        const filteredGamers = gamers.filter(
          (gamer) => gamer.name !== user.name
        );
        const filteredNames = filteredGamers.map((filtered) => filtered.name);
        return filteredNames;
      });
    } else {
      setItems(Object.values(gameData.objects));
    }
  }, []);

  const moveItem = ({ draggedItem, to }) => {
    if (to?.type === "item") return;

    if (!to) {
      if (draggedItem.type === "top") {
        setTops((prevTops) => {
          const newTops = { ...prevTops };
          delete newTops[draggedItem.index];
          return newTops;
        });
        setItems((prevItems) => {
          const newItems = [...prevItems];
          newItems.push(draggedItem.value);
          return newItems;
        });
      }
      return;
    }

    if (draggedItem.type === "item") {
      setTops((prevTops) => {
        const newTops = { ...prevTops };
        newTops[to.index] = draggedItem.value;
        return newTops;
      });

      setItems((prevItems) => {
        const newItems = [...prevItems];
        if (to.value !== undefined) {
          newItems[draggedItem.index] = to.value;
        } else {
          newItems.splice(draggedItem.index, 1);
        }
        return newItems;
      });
    } else if (draggedItem.type === "top") {
      setTops((prevTops) => {
        const newTops = { ...prevTops };
        newTops[to.index] = draggedItem.value;
        newTops[draggedItem.index] = to.value;
        return newTops;
      });
    }
  };

  if (!items) return null;

  return (
    <div
      onClick={() => !gameData.ended && setShowNext(false)}
      className="h-full w-full flex flex-col justify-center items-center relative"
    >
      <DndProvider backend={TouchBackend} options={{ HTML5toTouch }}>
        <>
          <div className="absolute w-full h-full">
            <OutsideItem moveItem={moveItem} />
          </div>

          <div className="relative w-full h-fit">
            <ThemeTitle theme={gameData.theme} moveItem={moveItem} />

            {["1", "2", "3"].map((top) => {
              return (
                <div key={top} className="flex w-full justify-center">
                  <div className="flex justify-center items-center py-1 w-[10%]">
                    <div
                      className={`border h-full w-full flex justify-center items-center ${
                        !tops[top]
                          ? "border-sky-700 bg-sky-100 border-dashed"
                          : "border-amber-700 bg-amber-100"
                      }`}
                    >
                      {(() => {
                        let imgSrc;
                        switch (top) {
                          case "1":
                            imgSrc = Gold;
                            break;
                          case "2":
                            imgSrc = Silver;
                            break;
                          case "3":
                            imgSrc = Bronze;
                            break;
                        }
                        return (
                          <div className="w-8 h-8">
                            <Image
                              alt="place"
                              src={imgSrc}
                              width={500}
                              height={500}
                            />
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <DraggableItem
                    type="top"
                    index={top}
                    value={tops[top]}
                    moveItem={moveItem}
                    setDraggedTop={setDraggedTop}
                    draggedTop={draggedTop}
                  />
                </div>
              );
            })}

            <div className="mt-8 flex flex-wrap justify-around w-full">
              {items.map((item, index) => {
                return (
                  <DraggableItem
                    key={index}
                    type="item"
                    index={index}
                    value={item}
                    moveItem={moveItem}
                  />
                );
              })}
            </div>
          </div>

          <Preview />

          {!gameData.ended && (
            <Validate
              tops={tops}
              user={user}
              gameData={gameData}
              roomId={roomId}
              roomToken={roomToken}
              setHasValidated={setHasValidated}
              moveItem={moveItem}
            >
              <NextStep
                onClick={() => {}}
                onLongPress={
                  isAdmin &&
                  (() => {
                    setShowNext(true);
                  })
                }
                iconName="validate"
                ready={ready}
                hasValidated={hasValidated}
              >
                Valider
              </NextStep>
            </Validate>
          )}
        </>
      </DndProvider>
    </div>
  );
};

const ResultPhase = ({ gameData, roomId, roomToken, isAdmin, setShowNext }) => {
  const { podium } = gameData;
  const { firsts, seconds, thirds } = podium;

  const [showFirsts, setShowFirsts] = useState(false);
  const [showSeconds, setShowSeconds] = useState(false);
  const [showThirds, setShowThirds] = useState(false);

  useEffect(() => {
    const show = gameData?.show;
    if (!show) return;

    if (show.firsts) setShowFirsts(true);
    if (show.seconds) setShowSeconds(true);
    if (show.thirds) setShowThirds(true);
  }, [gameData]);

  const getPlaceColors = ({ place }) => {
    let lightColor;
    let darkColor;
    switch (place) {
      case "third":
        lightColor = "#ff9936";
        darkColor = "#cd7430";
        break;
      case "second":
        lightColor = "#e0e0e0";
        darkColor = "#9e9e9e";
        break;
      case "first":
        lightColor = "#fee27a";
        darkColor = "#ffbb58";
        break;
    }
    return { lightColor, darkColor };
  };

  const GamerName = useCallback(({ place, isRevelated, name, index }) => {
    const { lightColor: intTextColor, darkColor: extTextcolor } =
      getPlaceColors({ place });

    return (
      <>
        <div
          className={`absolute bottom-full font-bold ${
            place === "third"
              ? "text-xl"
              : place === "second"
              ? "text-2xl"
              : "text-3xl"
          }`}
          style={{
            marginBottom: `${index * 1.5}rem`,
            display: "inline-block",
            clipPath: isRevelated ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
            opacity: isRevelated ? 1 : 0,
            transition: "opacity 3s ease-in",
            animation: isRevelated ? "opac 3s ease-in forwards" : "",

            color: intTextColor,
            textShadow: `1px 0px 1px ${extTextcolor}, -1px 0px 1px ${extTextcolor}, 0px 1px 1px ${extTextcolor}, 0px -1px 1px ${extTextcolor}`,
          }}
        >
          {name}
        </div>

        <style jsx>{`
          @keyframes opac {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
        `}</style>
      </>
    );
  }, []);

  return (
    <div
      onClick={() => !gameData.ended && setShowNext(false)}
      className="h-full w-full flex flex-col justify-center items-center relative"
    >
      <div className="flex justify-center items-end w-full p-4">
        <div className="w-1/3 h-32 flex justify-center items-center bg-gray-600 relative">
          {seconds.map((second, index) => (
            <GamerName
              key={index}
              place="second"
              isRevelated={showSeconds}
              name={second}
              index={index}
            />
          ))}
          <div className="w-10 h-10">
            <Image alt="place" src={Silver} width={500} height={500} />
          </div>
        </div>
        <div className="w-1/3 h-48 flex justify-center items-center bg-gray-600 relative">
          {firsts.map((first, index) => (
            <GamerName
              key={index}
              place="first"
              isRevelated={showFirsts}
              name={first}
              index={index}
            />
          ))}
          <div className="w-10 h-10">
            <Image alt="place" src={Gold} width={500} height={500} />
          </div>
        </div>
        <div className="w-1/3 h-20 flex justify-center items-center bg-gray-600 relative">
          {thirds.map((third, index) => (
            <GamerName
              key={index}
              place="third"
              isRevelated={showThirds}
              name={third}
              index={index}
            />
          ))}
          <div className="w-10 h-10">
            <Image alt="place" src={Bronze} width={500} height={500} />
          </div>
        </div>
      </div>

      {isAdmin && !gameData.ended && (
        <NextStep
          onClick={() => showResults({ gameData, roomId, roomToken })}
          onLongPress={() => setShowNext(true)}
        >
          <div className="w-12 h-12">
            <Image
              alt="place"
              src={(() => {
                if (showSeconds) {
                  return Gold;
                } else if (showThirds) {
                  return Silver;
                } else {
                  return Bronze;
                }
              })()}
              width={500}
              height={500}
            />
          </div>
        </NextStep>
      )}
    </div>
  );
};

export default function Podium({
  roomId,
  roomToken,
  user,
  gameData,
  setShowNext,
}) {
  usePreventScroll();
  const isAdmin = gameData.admin === user.name;
  const { phase } = gameData;

  return (
    <div className="relative h-full w-full animate-[fadeIn_1.5s_ease-in-out]">
      {phase === "preparing" && (
        <PreparingPhase
          gameData={gameData}
          roomId={roomId}
          roomToken={roomToken}
          isAdmin={isAdmin}
          setShowNext={setShowNext}
        />
      )}

      {phase === "preturn" && (
        <PreturnPhase
          gameData={gameData}
          roomId={roomId}
          roomToken={roomToken}
          isAdmin={isAdmin}
          setShowNext={setShowNext}
        />
      )}

      {phase === "turn" && (
        <TurnPhase
          gameData={gameData}
          roomId={roomId}
          roomToken={roomToken}
          user={user}
          isAdmin={isAdmin}
          setShowNext={setShowNext}
        />
      )}

      {phase === "result" && (
        <ResultPhase
          gameData={gameData}
          roomId={roomId}
          roomToken={roomToken}
          isAdmin={isAdmin}
          setShowNext={setShowNext}
        />
      )}
    </div>
  );
}
