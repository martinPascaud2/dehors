"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { useLongPress, LongPressEventType } from "use-long-press";

import "./ripple.css";
import { modesRules } from "@/assets/globals";

import convertNameListToString from "@/utils/convertNameListToString";
import updateRoomLeavers from "./updateRoomLeavers";
import { sendPresenceSign } from "../Room/actions";

import { DiscoModal } from "@/components/Modal";
import CountDown from "@/components/CountDown";

const DisconnectionRipplingButton = ({
  label,
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

  const callback = useCallback(async () => {
    if (longPressed) return;
    setLongPressed(true);
    setIsValidated(true);
    await onLongPress();
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
      className={`hold-button rounded-md border-0 w-full px-6 py-4 ${
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
      <span className="content relative z-2 select-none">{label}</span>
    </button>
  );
};

const getDiscoWarningMessage = ({ modeName, gameData, onlineGamers }) => {
  if (modesRules[modeName]?.limits.min > onlineGamers.length)
    return <span>Attention, ceci mettra fin à la partie.</span>;

  switch (modeName) {
    case "Esquissé":
      return <span>La position de certains joueurs pourra être décalée.</span>;
    case "Pictionary":
    case "Triaction":
      return <span>Attention, ceci mettra fin à la partie.</span>;

    case "Undercover":
      return (
        <div className="flex flex-col">
          <span>La partie continuera avec les joueurs restants.</span>
          <span>Attention, ceci pourra mettre fin à la partie.</span>
        </div>
      );

    default:
      return <span>La partie continuera avec les joueurs restants.</span>;
  }
};

const checkAdmins_gameData = ({ gameData, onlineGamers }) => {
  const { admin, viceAdmin, gamers, arrivalsOrder } = gameData;
  const onlineGamersList = onlineGamers.map((gamer) => gamer.userName);
  const onlineGamersSet = new Set(onlineGamersList);
  const remainingGamers = gamers.filter((gamer) =>
    onlineGamersSet.has(gamer.name)
  );
  const newArrivalsOrder = arrivalsOrder.filter((arrival) =>
    onlineGamersSet.has(arrival.userName)
  );
  const adminIndex = remainingGamers.findIndex((gamer) => gamer.name === admin);
  const viceAdminIndex = remainingGamers.findIndex(
    (gamer) => gamer.name === viceAdmin
  );

  let newAdmin;
  let newViceAdmin;
  if (adminIndex >= 0) {
    newAdmin = remainingGamers[adminIndex].name;
    if (viceAdminIndex >= 0) {
      newViceAdmin = viceAdmin;
    } else {
      newViceAdmin = newArrivalsOrder.find(
        (gamer) => gamer.userName !== admin
      )?.userName;
    }
  } else {
    if (viceAdminIndex >= 0) {
      newAdmin = viceAdmin;
      newViceAdmin = newArrivalsOrder.find(
        (gamer) => gamer.userName !== newAdmin
      )?.userName;
    } else {
      newAdmin = newArrivalsOrder[0].userName;
      newViceAdmin = newArrivalsOrder[1]?.userName;
    }
  }

  return { newAdmin, newViceAdmin, newArrivalsOrder };
};

export default function Disconnected({
  roomId,
  roomToken,
  onlineGamers,
  gamers,
  isAdmin,
  onGameBye,
  modeName,
  gameData,
  user,
}) {
  const [showDiscoModal, setShowDiscoModal] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [disconnectedList, setDisconnectedList] = useState([]);
  const [isValidated, setIsValidated] = useState(false);
  const [withoutLabel, setWithoutLabel] = useState("");
  const [finishCountdownDate, setFinishCountdownDate] = useState(null);

  useEffect(() => {
    if (!onlineGamers?.length || !gamers || !roomToken || !user) return;

    if (onlineGamers.length !== gamers.length) {
      const onlineGamersSet = new Set(
        onlineGamers.map((online) => online.userName)
      );
      const disconnected = gamers
        .map((gamer) => gamer.name)
        .filter((gamerName) => !onlineGamersSet.has(gamerName));

      setDisconnectedList(disconnected);
      setShowDiscoModal(true);
      setIsValidated(false);
    } else {
      setDisconnectedList([]);
      setShowDiscoModal(false);
      setIsValidated(false);
    }
  }, [onlineGamers, gamers, roomToken, user]);

  useEffect(() => {
    if (!disconnectedList.length) setFinishCountdownDate(null);
    else if (!finishCountdownDate) {
      const isLeaverAdmin = disconnectedList.some(
        (disco) => disco === gameData.admin
      );
      const newFinishCountdownDate =
        Date.now() + (isLeaverAdmin ? 120000 : 30000);
      setFinishCountdownDate(newFinishCountdownDate);
    }
  }, [disconnectedList]);

  useEffect(() => {
    if (!isValidated) setWithoutLabel("Reprendre sans");
    else setWithoutLabel("Le jeu reprend");
  }, [isValidated]);

  const onBye = useCallback(async () => {
    setTimeout(async () => {
      const { newAdmin, newViceAdmin, newArrivalsOrder } = checkAdmins_gameData(
        {
          gameData,
          onlineGamers,
        }
      );

      const isNewAdmin = newAdmin === user.name;
      if (isNewAdmin) {
        await updateRoomLeavers({ roomId, gamers, disconnectedList });
        await onGameBye({
          admins: { newAdmin, newViceAdmin },
          arrivalsOrder: newArrivalsOrder,
        });
      }

      setFinishCountdownDate(null);
      setIsValidated(true);
      setShowButton(false);
    }, 0); //rendering cycle
  }, [
    roomId,
    onGameBye,
    gamers,
    disconnectedList,
    user,
    gameData,
    onlineGamers,
  ]);

  const Message = useMemo(() => {
    if (!disconnectedList?.length) return null;
    const discoList = convertNameListToString(disconnectedList);
    const isSeveral = disconnectedList.length >= 2;
    const statusMessage = (
      <span>{!isSeveral ? "est " : "sont "}hors ligne.</span>
    );
    const WaitingMessage = (
      <div className="flex justify-center w-full p-2">
        En attente de {!isSeveral ? "sa " : "leur "}reconnexion.
      </div>
    );
    const WarningMessage = (
      <div className="m-2 flex justify-center italic text-center">
        {getDiscoWarningMessage({
          modeName,
          gameData,
          onlineGamers,
          isSeveral,
        })}
      </div>
    );
    return (
      <div className="flex flex-col">
        <div className="flex justify-center w-full">
          {discoList}
          {statusMessage}
        </div>
        {WaitingMessage}
        {showButton && (
          <>
            <div className="m-2">
              <DisconnectionRipplingButton
                label={withoutLabel}
                onLongPress={onBye}
                isValidated={isValidated}
                setIsValidated={setIsValidated}
                isActive={!!disconnectedList?.length && !isValidated && isAdmin}
              />
            </div>
            <div>{WarningMessage}</div>
          </>
        )}

        {finishCountdownDate && (
          <div>
            <CountDown
              finishCountdownDate={finishCountdownDate}
              onTimeUp={() => setShowButton(true)}
              label="Patientons"
            />
          </div>
        )}
      </div>
    );
  }, [
    onlineGamers,
    disconnectedList,
    withoutLabel,
    showButton,
    onBye,
    isValidated,
    setIsValidated,
    finishCountdownDate,
    gameData,
    isAdmin,
    modeName,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (finishCountdownDate < Date.now() && !isAdmin) onBye();
    }, 1000);
    if (!onlineGamers?.length || !gamers?.length || !disconnectedList?.length)
      clearInterval(interval);
    return () => {
      clearInterval(interval);
    };
  }, [
    finishCountdownDate,
    onBye,
    isAdmin,
    disconnectedList,
    gamers,
    onlineGamers,
  ]);
  useEffect(() => {
    if (!onlineGamers?.length || !gamers?.length || !disconnectedList?.length)
      setShowButton(false);
  }, [disconnectedList, gamers, onlineGamers]);

  if (
    !onlineGamers?.length ||
    !gamers?.length ||
    !disconnectedList?.length ||
    gameData.ended
  )
    return null;

  return ReactDOM.createPortal(
    <div
      className="w-[100vw] fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] flex items-center justify-center"
      style={{
        height: `${window.screen.height}px`,
        zIndex: 1000,
      }}
    >
      <DiscoModal isOpen={showDiscoModal}>{Message}</DiscoModal>
    </div>,
    document.body
  );
}
