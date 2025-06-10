"use client";

import { useEffect, useState } from "react";

export default function PresetCountdown({
  isAdmin,
  options,
  setOptions,
  times,
  last,
}) {
  const [countDownTime, setCountDownTime] = useState(
    typeof last === "number" ? last / 60 / 1000 : times.default
  );
  const [timeIndex, setTimeIndex] = useState(
    times.values.findIndex((value) => value === countDownTime)
  );

  useEffect(() => {
    if (!typeof last === "number" || !isAdmin) return;

    setCountDownTime(last / 60 / 1000);
  }, [last, isAdmin]);

  useEffect(() => {
    if (!isAdmin || !times || Number.isNaN(timeIndex) || !setOptions) return;

    if (timeIndex < 0) {
      setTimeIndex(0);
      return;
    }
    if (timeIndex >= times.values.length) {
      setTimeIndex(times.values.length - 1);
      return;
    }

    const newCountDownTime = times.values[timeIndex];
    setCountDownTime(newCountDownTime);

    setOptions((options) => ({
      ...options,
      countDownTime: newCountDownTime * 60 * 1000,
    }));
  }, [timeIndex, setOptions]);

  useEffect(() => {
    if (isAdmin || Number.isNaN(options.countDownTime)) return;

    setCountDownTime(options.countDownTime / 60 / 1000);
  }, [options, isAdmin]);

  // setOptions concurrence
  useEffect(() => {
    if (!times || !isAdmin) return;
    if (Number.isNaN(options.countDownTime) && !options.countDownTime) {
      setOptions((options) => ({
        ...options,
        countDownTime: times.default * 60 * 1000,
      }));
    }
  }, [options.countDownTime, times, isAdmin, setOptions]);

  return (
    <div className="m-1 flex flex-col items-center justify-center">
      <div>Temps des tours</div>
      <div className="w-full flex">
        <button
          onClick={() => setTimeIndex((index) => index - 1)}
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
          {countDownTime !== 0 ? (
            <span>
              {countDownTime} minute{countDownTime >= 2 ? "s" : ""}
            </span>
          ) : (
            <span>Illimité</span>
          )}
        </div>
        <button
          onClick={() => setTimeIndex((index) => index + 1)}
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
