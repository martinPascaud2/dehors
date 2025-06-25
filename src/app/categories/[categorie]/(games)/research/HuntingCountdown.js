"use client";

import { useEffect, useState, useRef } from "react";

import { specialElite } from "@/assets/fonts";

export default function HuntingCountdown({ finishCountdownDate, onTimeUp }) {
  const [leftMilliseconds, setLeftMilliseconds] = useState(null);
  const intervalRef = useRef(null);
  const [hasSent, setHasSent] = useState(false);

  useEffect(() => {
    if (!finishCountdownDate) return;

    function updateTime() {
      const current = Date.now();
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
  }, [finishCountdownDate, hasSent, onTimeUp]);

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
