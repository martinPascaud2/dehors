"use client";

import { useEffect, useState } from "react";

import getLastParams from "@/utils/getLastParams";

import ModeSelector from "@/components/Options/ModeSelector";
import MakeTeams from "@/components/Options/MakeTeams";
import Countdown from "@/components/Options/Countdown";
import AimPoints from "@/components/Options/AimPoints";

export default function DrawingOptions({
  userId,
  isAdmin,
  options,
  searchMode,
  lastMode,
  adminChangeSameGameNewMode,
  setOptions,
}) {
  const [mode, setMode] = useState(
    searchMode || (isAdmin && lastMode?.mode) || options.mode || "Pictionary"
  );
  const [lastParams, setLastParams] = useState();
  const [modeList, setModeList] = useState([]);
  const [isSelectingMode, setIsSelectingMode] = useState(false);

  useEffect(() => {
    if (!mode) return;
    const loadLasts = async () => {
      const params = await getLastParams({ userId, mode });
      setLastParams(params);
      setOptions({ ...params, mode });
    };
    isAdmin && loadLasts();

    setModeList([
      { mode: "Pictionary", text: "Pictionary" },
      { mode: "Esquissé", text: "Esquissé" },
    ]);
  }, [mode, setOptions, isAdmin, userId]);

  useEffect(() => {
    if (isAdmin) return;
    setMode(options.mode);
  }, [isAdmin, options.mode]);

  // const same = lastMode.mode === mode; //can be used

  return (
    <div className="h-full">
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

      {mode === "Pictionary" && !isSelectingMode && (
        <div className="flex flex-wrap justify-center">
          <div>
            <MakeTeams
              isAdmin={isAdmin}
              options={options}
              setOptions={setOptions}
              last={lastParams}
            />
          </div>
          <div className="w-full grid grid-cols-2">
            <Countdown
              isAdmin={isAdmin}
              options={options}
              setOptions={setOptions}
              min={1}
              max={5}
              last={lastParams?.countDownTime}
            />
            <AimPoints
              isAdmin={isAdmin}
              options={options}
              setOptions={setOptions}
              min={3}
              max={10}
              defaultValue={lastParams?.aimPoints || 5}
            />
          </div>
        </div>
      )}

      {mode === "Esquissé" && !isSelectingMode && (
        <>
          <Countdown
            isAdmin={isAdmin}
            options={options}
            setOptions={setOptions}
            min={1}
            max={5}
            last={lastParams?.countDownTime}
          />
        </>
      )}
    </div>
  );
}
