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

  useEffect(() => {
    if (!last || !isAdmin) return;

    setCountDownTime(last / 60 / 1000);
  }, [last, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    if (countDownTime < min) setCountDownTime(min);
    if (countDownTime > max) setCountDownTime(max);
    setOptions((options) => ({
      ...options,
      countDownTime: countDownTime * 60 * 1000,
    }));
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
          onClick={() => setCountDownTime((time) => time - 1)}
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
          onClick={() => setCountDownTime((time) => time + 1)}
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
