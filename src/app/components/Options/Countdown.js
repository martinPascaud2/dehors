"use client";

import { useEffect, useState } from "react";

export default function Countdown({
  isAdmin,
  options,
  setOptions,
  min,
  max,
  last,
}) {
  const [countDownTime, setCountDownTime] = useState(
    (last && last / 60 / 1000) || Math.floor((min + max) / 2)
  );

  const [timeoutId, setTimeoutId] = useState(null);
  const minSpeed = 20;

  const handleHold = (direction = "up") => {
    let currentSpeed = 400;

    const update = () => {
      setCountDownTime((time) =>
        direction === "up" ? Math.min(max, time + 1) : Math.max(min, time - 1)
      );

      currentSpeed = Math.max(minSpeed, currentSpeed * 0.9);

      const newTimeout = setTimeout(update, currentSpeed);
      setTimeoutId(newTimeout);
    };

    update();
  };

  const stopHold = () => {
    clearTimeout(timeoutId);
    setTimeoutId(null);
  };

  useEffect(() => {
    if (!last || !isAdmin) return;

    setCountDownTime(last / 60 / 1000);
  }, [last, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    if (countDownTime < min) {
      setCountDownTime(min);
      return;
    }
    if (countDownTime > max) {
      setCountDownTime(max);
      return;
    }

    const handler = setTimeout(() => {
      setOptions((options) => ({
        ...options,
        countDownTime: countDownTime * 60 * 1000,
      }));
    }, 1000);

    return () => clearTimeout(handler);
  }, [countDownTime, isAdmin, max, min, setOptions]);

  useEffect(() => {
    if (isAdmin) return;
    setCountDownTime(options.countDownTime / 60 / 1000);
  }, [options, isAdmin]);

  return (
    <div className="my-2 mx-1 flex flex-col items-center justify-center">
      <div>Temps / tour</div>
      <div className="w-full flex">
        <button
          onMouseDown={() => handleHold("down")}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => handleHold("down")}
          onTouchEnd={stopHold}
          onTouchCancel={stopHold}
          className={`mr-auto border border-amber-700 bg-amber-100 text-amber-700 w-[20%] flex justify-center ${
            !isAdmin ? "collapse" : ""
          }`}
        >
          -
        </button>
        <div
          className={`flex items-center w-[60%] border border-sky-700 ${
            isAdmin ? "border-x-0 w-[60%]" : "p-1 w-full"
          } justify-center font-semibold`}
        >
          {countDownTime} minutes
        </div>
        <button
          onMouseDown={() => handleHold("up")}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => handleHold("up")}
          onTouchEnd={stopHold}
          onTouchCancel={stopHold}
          className={`ml-auto border border-amber-700 bg-amber-100 text-amber-700 w-[20%] flex justify-center ${
            !isAdmin ? "collapse" : ""
          }`}
        >
          +
        </button>
      </div>
    </div>
  );
}
