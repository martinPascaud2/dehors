"use client";

import { useEffect, useState } from "react";

export default function IGCountdownOption({ setCD, min, max, last }) {
  const [countDownTime, setCountDownTime] = useState(last / 60 / 1000);
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
    if (countDownTime < min) {
      setCountDownTime(min);
      return;
    }
    if (countDownTime > max) {
      setCountDownTime(max);
      return;
    }

    const handler = setTimeout(() => {
      setCD(countDownTime * 60 * 1000);
    }, 1000);

    return () => clearTimeout(handler);
  }, [countDownTime, max, min]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="my-2 mx-1 flex flex-col items-center justify-center w-44"
    >
      <div className="w-full flex h-8">
        <button
          onMouseDown={() => handleHold("down")}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => handleHold("down")}
          onTouchEnd={stopHold}
          onTouchCancel={stopHold}
          className={`mr-auto border border-amber-700 bg-amber-100 text-amber-700 w-[20%] flex justify-center items-center`}
        >
          -
        </button>
        <div
          className={`flex items-center w-[60%] border border-sky-700 justify-center font-semibold whitespace-nowrap`}
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
          className={`ml-auto border border-amber-700 bg-amber-100 text-amber-700 w-[20%] flex justify-center items-center`}
        >
          +
        </button>
      </div>
    </div>
  );
}
