"use client";

import { useEffect, useState } from "react";

import getLastParams from "@/utils/getLastParams";

import ModeSelector from "@/components/Options/ModeSelector";
import Toggle from "@/components/Options/Toggle";
import Countdown from "@/components/Options/Countdown";

import { FaBullseye } from "react-icons/fa6";
import {
  GiCrossedSwords,
  GiAutomaticSas,
  GiAngelOutfit,
  GiDeathSkull,
} from "react-icons/gi";
import { FaHandPointUp } from "react-icons/fa";

export default function ResearchOptions({
  userId,
  isAdmin,
  options,
  setOptions,
  searchMode,
  lastMode,
  adminChangeSameGameNewMode,
  //   serverMessage,
  //   setServerMessage,
  //   gamersNumber,
}) {
  const [mode, setMode] = useState(
    searchMode || (isAdmin && lastMode?.mode) || options.mode || "Hunted"
  );
  const [modeList, setModeList] = useState([]);
  const [lastParams, setLastParams] = useState();
  const [lastLoaded, setLastLoaded] = useState(false);
  const [show, setShow] = useState(false);
  const [isSelectingMode, setIsSelectingMode] = useState(false);

  useEffect(() => {
    if (!mode) return;
    const loadLasts = async () => {
      const params = await getLastParams({ userId, mode });
      setLastParams(params);
      setOptions({ ...params, mode });
      setLastLoaded(true);
    };
    isAdmin && loadLasts();

    setModeList([{ mode: "Hunted", text: "Hunted" }]);
  }, [mode, setOptions, isAdmin, userId]);

  useEffect(() => {
    if (!lastLoaded && isAdmin) return;
    const timer = setTimeout(() => {
      setShow(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [lastLoaded, isAdmin]);

  if (!show) return null;

  return (
    <>
      <ModeSelector
        isAdmin={isAdmin}
        options={options}
        defaultValue={mode}
        adminChangeSameGameNewMode={adminChangeSameGameNewMode}
        modeList={modeList}
        setMode={setMode}
        setOptions={setOptions}
        isSelectingMode={isSelectingMode}
        setIsSelectingMode={setIsSelectingMode}
      />

      <div className="w-full flex justify-center items-center my-2">
        <div
          className={`mr-2 text-sky-700 ${
            !isAdmin && options?.distribution !== "FFA" && "opacity-50"
          }`}
        >
          <FaBullseye className="h-8 w-8 mb-1" />
        </div>
        {isAdmin ? (
          <Toggle
            isAdmin={isAdmin}
            options={options}
            setOptions={setOptions}
            optionName="distribution"
            possibleValues={["FFA", "VS"]}
            defaultValue={lastParams?.distribution || "FFA"}
          />
        ) : (
          <div className="text-2xl">|</div>
        )}
        <div
          className={`ml-2 text-sky-700 ${
            !isAdmin && options?.distribution !== "VS" && "opacity-50"
          }`}
        >
          <GiCrossedSwords className="h-8 w-8 mb-1" />
        </div>
      </div>

      <Countdown
        isAdmin={isAdmin}
        options={options}
        setOptions={setOptions}
        min={1}
        max={360}
        last={lastParams?.countDownTime}
        def={15}
      />

      <div className="w-full flex justify-center items-center my-2">
        <div
          className={`mr-2 text-sky-700 ${
            !isAdmin && options?.geolocation !== "automatic" && "opacity-50"
          }`}
        >
          <GiAutomaticSas className="h-8 w-8 mb-1" />
        </div>
        {isAdmin ? (
          <Toggle
            isAdmin={isAdmin}
            options={options}
            setOptions={setOptions}
            optionName="geolocation"
            possibleValues={["automatic", "manual"]}
            defaultValue={lastParams?.geolocation || "automatic"}
          />
        ) : (
          <div className="text-2xl">|</div>
        )}
        <div
          className={`ml-2 text-sky-700 ${
            !isAdmin && options?.geolocation !== "manual" && "opacity-50"
          }`}
        >
          <FaHandPointUp className="h-8 w-8 mb-1" />
        </div>
      </div>

      <div className="w-full flex justify-center items-center my-2">
        <div
          className={`mr-2 text-sky-700 ${
            !isAdmin && options?.destiny !== "resurrection" && "opacity-50"
          }`}
        >
          <GiAngelOutfit className="h-8 w-8 mb-1" />
        </div>
        {isAdmin ? (
          <Toggle
            isAdmin={isAdmin}
            options={options}
            setOptions={setOptions}
            optionName="destiny"
            possibleValues={["resurrection", "death"]}
            defaultValue={lastParams?.destiny || "resurrection"}
          />
        ) : (
          <div className="text-2xl">|</div>
        )}
        <div
          className={`ml-2 text-sky-700 ${
            !isAdmin && options?.destiny !== "death" && "opacity-50"
          }`}
        >
          <GiDeathSkull className="h-8 w-8 mb-1" />
        </div>
      </div>
    </>
  );
}
