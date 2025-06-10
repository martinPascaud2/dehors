"use client";

import { useEffect, useState } from "react";

import getLastParams from "@/utils/getLastParams";

import Spinner from "@/components/spinners/Spinner";

import Countdown from "@/components/Options/Countdown";
import ModeSelector from "@/components/Options/ModeSelector";
import AimPoints from "@/components/Options/AimPoints";
import PtitbacThemeOption from "./PtitbacThemeOption";

export default function PtitbacOptions({
  userId,
  isAdmin,
  options,
  setOptions,
  searchMode,
  lastMode,
  adminChangeSameGameNewMode,
  setServerMessage,
}) {
  const [mode, setMode] = useState(
    searchMode || (isAdmin && lastMode?.mode) || options.mode || "P'tit bac"
  );
  const [lastParams, setLastParams] = useState();
  const [modeList, setModeList] = useState([]);
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

    setModeList([{ mode: "P'tit bac", text: "P'tit bac" }]);
  }, [mode, setOptions, isAdmin, userId]);

  useEffect(() => {
    if (!lastLoaded && isAdmin) return;
    const timer = setTimeout(() => {
      setShow(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [lastLoaded, isAdmin]);

  if (!show) return <Spinner />;

  return (
    <div>
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

      {!isSelectingMode && (
        <>
          <Countdown
            isAdmin={isAdmin}
            options={options}
            setOptions={setOptions}
            min={1}
            max={7}
            last={lastParams?.countDownTime}
          />
          <AimPoints
            isAdmin={isAdmin}
            options={options}
            setOptions={setOptions}
            min={0}
            max={30}
            defaultValue={lastParams?.aimPoints || 0}
          />
          <PtitbacThemeOption
            isAdmin={isAdmin}
            options={options}
            setOptions={setOptions}
            max={6}
            lastParams={lastParams}
            setServerMessage={setServerMessage}
          />
        </>
      )}
    </div>
  );
}
