"use client";

import { useEffect, useState } from "react";

export default function AimPoints({
  isAdmin,
  options,
  setOptions,
  min,
  max,
  defaultValue,
}) {
  const [aimPoints, setAimPoints] = useState(
    defaultValue !== undefined ? defaultValue : Math.floor((min + max) / 2)
  );

  useEffect(() => {
    setAimPoints(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (!isAdmin) return;
    if (aimPoints < min) setAimPoints(min);
    if (aimPoints > max) setAimPoints(max);

    setOptions((options) => ({
      ...options,
      aimPoints,
    }));
  }, [aimPoints, isAdmin, min, max, setOptions]);

  useEffect(() => {
    if (isAdmin) return;
    setAimPoints(options.aimPoints);
  }, [options, isAdmin]);

  return (
    <div className="my-2 mx-1 flex flex-col items-center justify-center">
      <div>Objectif</div>
      <div className="w-full flex">
        <button
          onClick={() => setAimPoints((points) => points - 1)}
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
          {aimPoints === 0
            ? "Illimité"
            : `${aimPoints} point${aimPoints >= 2 ? "s" : ""}`}
        </div>
        <button
          onClick={() => setAimPoints((points) => points + 1)}
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
