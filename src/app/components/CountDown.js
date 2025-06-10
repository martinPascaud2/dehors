"use client";

import { useEffect, useState } from "react";

export default function CountDown({
  finishCountdownDate,
  setHasValidated,
  onTimeUp,
  label,
}) {
  const [leftSeconds, setLeftSeconds] = useState();
  const [leftMinutes, setLeftMinutes] = useState();
  const [leftHours, setLeftHours] = useState();
  const [leftDays, setLeftDays] = useState();

  useEffect(() => {
    if (!finishCountdownDate) return;
    let interval = setInterval(() => {
      const currentTime = Date.now();
      const leftMilliseconds = finishCountdownDate - currentTime;
      setLeftSeconds(Math.floor((leftMilliseconds / 1000) % 60));
      setLeftMinutes(Math.floor((leftMilliseconds / 1000 / 60) % 60));
      setLeftHours(Math.floor((leftMilliseconds / 1000 / 60 / 60) % 24));
      setLeftDays(Math.floor(leftMilliseconds / 1000 / 60 / 60 / 24));
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [finishCountdownDate]);

  useEffect(() => {
    if (leftMinutes && leftSeconds && leftMinutes <= 0 && leftSeconds <= 0) {
      setHasValidated && setHasValidated(true);
      onTimeUp && onTimeUp();
      return;
    }
  }, [leftMinutes, leftSeconds, onTimeUp, setHasValidated]);

  return (
    <div className="flex justify-center">
      {(leftMinutes > 0 || (leftMinutes === 0 && leftSeconds >= 0)) && (
        <>
          {label ? <span>{label}</span> : <span>Il vous reste</span>}
          &nbsp;
          {leftDays > 0 && (
            <span>
              <span className="font-bold">{leftDays}</span>&nbsp;jour
              {leftDays >= 2 ? "s" : ""}&nbsp;
            </span>
          )}
          {(leftDays || leftHours > 0) && (
            <span>
              <span>{leftDays ? " et " : ""}</span>
              <span className="font-bold">{leftHours}</span>
              &nbsp;heure{leftHours >= 2 ? "s" : ""}
              <span>{leftDays ? "" : "\u00A0"}</span>
            </span>
          )}
          {leftDays === 0 && (leftHours || leftMinutes > 0) && (
            <span>
              <span>{leftHours ? " et " : ""}</span>
              <span className="font-bold">{leftMinutes}</span>
              &nbsp;minute{leftMinutes >= 2 ? "s" : ""}
            </span>
          )}
          {leftDays === 0 && leftHours === 0 && (
            <span>
              <span>{leftMinutes ? "\u00A0et\u00A0" : ""}</span>
              <span className="font-bold">{leftSeconds}</span>
              &nbsp;seconde
              {leftSeconds >= 2 ? "s" : ""}
            </span>
          )}
          <span>.</span>
        </>
      )}
    </div>
  );
}
