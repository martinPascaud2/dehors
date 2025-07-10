"use client";

import { useEffect, useState, useRef } from "react";

import getServerTime from "@/utils/getServerTime";
import { sendPosition } from "./gameActions";

import { specialElite } from "@/assets/fonts";
import { FaEye } from "react-icons/fa";

export default function HuntingCountdown({
  finishCountdownDate,
  onTimeUp,
  roomId,
  roomToken,
  user,
}) {
  const [offset, setOffset] = useState(0);
  const intervalRef = useRef(null);
  const [leftMilliseconds, setLeftMilliseconds] = useState(null);
  const [hasSent, setHasSent] = useState(false);
  const sentGeolocRef = useRef(false);

  useEffect(() => {
    const syncTime = async () => {
      const t0 = Date.now();
      const serverTime = await getServerTime();
      const t1 = Date.now();

      const estimatedClientTimeAtResponse = (t0 + t1) / 2;

      setOffset(serverTime - estimatedClientTimeAtResponse);
    };

    syncTime();
  }, []);

  useEffect(() => {
    if (!finishCountdownDate || !offset) return;

    function updateTime() {
      const current = Date.now() + offset;

      const remaining = Math.max(finishCountdownDate - current, 0);
      setLeftMilliseconds(remaining);

      if (remaining === 0 && !hasSent) {
        onTimeUp?.();
        setHasSent(true);
        clearInterval(intervalRef.current);
      }
    }

    updateTime();
    intervalRef.current = setInterval(updateTime, 49);

    return () => clearInterval(intervalRef.current);
  }, [finishCountdownDate, hasSent, onTimeUp, offset]);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];

        if (
          leftMilliseconds <= 15000 &&
          leftMilliseconds !== null &&
          !sentGeolocRef.current
        ) {
          sendPosition({
            roomId,
            roomToken,
            user,
            newPosition: coords,
            isHidding: true,
          }); // no await
          sentGeolocRef.current = true;
        }
      },
      (err) => console.error(err),
      {
        enableHighAccuracy: true,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [leftMilliseconds, roomId, roomToken, user]);

  const leftMinutes = Math.floor(leftMilliseconds / 1000 / 60);
  const leftSeconds = Math.floor((leftMilliseconds / 1000) % 60);
  const leftCs = Math.floor((leftMilliseconds % 1000) / 10);

  return (
    <div
      className={`flex justify-center text-red-700 ${
        leftMinutes > 0 ? "text-7xl" : "text-8xl"
      } ${specialElite.className}`}
    >
      {(leftMinutes > 0 || (leftMinutes === 0 && leftSeconds >= 0)) && (
        <>
          {leftMinutes > 0 && (
            <div className="font-bold w-full flex justify-center">
              <div className="font-bold w-[1ch] flex justify-end">
                {leftMinutes}
              </div>
              <span>{leftMinutes ? "\u00A0:\u00A0" : ""}</span>
            </div>
          )}
          {
            <div className="font-bold w-full flex justify-center">
              <div className="font-bold w-[2ch] flex justify-center">
                {leftSeconds < 10 ? "0" : ""}
                {leftSeconds}
              </div>
              <span>{"\u00A0:\u00A0"}</span>
            </div>
          }
          {
            <div className="w-full flex justify-center">
              <div className="font-bold w-[2ch] flex justify-center">
                {leftCs < 10 ? "0" : ""}
                {leftCs}
              </div>
            </div>
          }
        </>
      )}
    </div>
  );
}

export function NextLocationCountdown({
  nextLocation,
  geolocation,
  isRevealReady,
  gamerRole,
  onTimeUp,
}) {
  const [offset, setOffset] = useState();
  const intervalRef = useRef(null);
  const [leftMilliseconds, setLeftMilliseconds] = useState(null);

  useEffect(() => {
    const syncTime = async () => {
      const t0 = Date.now();
      const serverTime = await getServerTime();
      const t1 = Date.now();

      const estimatedClientTimeAtResponse = (t0 + t1) / 2;

      setOffset(serverTime - estimatedClientTimeAtResponse);
    };

    syncTime();
  }, []);

  useEffect(() => {
    if (!nextLocation || Number.isNaN(offset)) return;

    async function updateTime() {
      const current = Date.now() + offset;

      const remaining = Math.max(nextLocation - current, 0);
      setLeftMilliseconds(remaining);

      if (remaining === 0) {
        onTimeUp?.();
        clearInterval(intervalRef.current);
      }
    }

    updateTime();
    intervalRef.current = setInterval(updateTime, 49);

    return () => clearInterval(intervalRef.current);
  }, [nextLocation, onTimeUp, offset]);

  const leftMinutes = Math.floor(leftMilliseconds / 1000 / 60);
  const leftSeconds = Math.floor((leftMilliseconds / 1000) % 60);
  const minDigitNumber = leftMinutes.toString().length;

  if (
    (leftMilliseconds === 0 || isRevealReady) &&
    geolocation === "manual" &&
    gamerRole === "hunter"
  )
    return (
      <div className="w-full h-full flex justify-center items-center">
        <FaEye className="h-full w-full text-amber-700" />
      </div>
    );

  if (leftMilliseconds === 0 && gamerRole === "hunted")
    return (
      <div
        className={`w-full h-full flex justify-center items-center text-red-700 text-5xl ${specialElite.className} mt-4`}
      >
        !!!
      </div>
    );

  return (
    <div
      className={`h-full flex justify-center items-center text-red-700 ${specialElite.className} text-5xl mt-4`}
    >
      {(leftMinutes > 0 || (leftMinutes === 0 && leftSeconds >= 0)) && (
        <>
          {leftMinutes > 0 && (
            <div className="font-bold h-full flex justify-center items-center">
              <div
                className={`font-bold w-[${minDigitNumber}ch] h-full flex justify-end items-center`}
              >
                {leftMinutes}
              </div>
              <span>{leftMinutes ? "\u00A0:\u00A0" : ""}</span>
            </div>
          )}
          {
            <div className="font-bold h-full flex justify-center items-center">
              <div className="font-bold w-[2ch] h-full flex justify-center items-center">
                {leftSeconds < 10 ? "0" : ""}
                {leftSeconds}
              </div>
            </div>
          }
        </>
      )}
    </div>
  );
}
