"use client";

import { useEffect, useState, useRef } from "react";

import getServerTime from "@/utils/getServerTime";

import { specialElite } from "@/assets/fonts";

export default function HuntingCountdown({ finishCountdownDate, onTimeUp }) {
  const [offset, setOffset] = useState(0);
  const intervalRef = useRef(null);
  const [leftMilliseconds, setLeftMilliseconds] = useState(null);
  const [hasSent, setHasSent] = useState(false);

  useEffect(() => {
    const syncTime = async () => {
      const t0 = Date.now();
      const serverTime = await getServerTime();
      const t1 = Date.now();

      const estimatedClientTimeAtResponse = (t0 + t1) / 2;
      console.log(
        "serverTime - estimatedClientTimeAtResponse",
        serverTime - estimatedClientTimeAtResponse
      );

      setOffset(serverTime - estimatedClientTimeAtResponse);
    };

    syncTime();
  }, []);

  useEffect(() => {
    if (!finishCountdownDate || !offset) return;

    console.log("offset 2nd effect", offset);

    function updateTime() {
      //   const current = Date.now();
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
