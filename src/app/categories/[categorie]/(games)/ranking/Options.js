"use client";

import { useEffect, useState } from "react";

import getLastParams from "@/utils/getLastParams";

import ModeSelector from "@/components/Options/ModeSelector";
import Toggle from "@/components/Options/Toggle";

import { IoPeople } from "react-icons/io5";
import { BsThreeDots } from "react-icons/bs";
import { GiPodium } from "react-icons/gi";
import Infinity from "@/components/icons/Infinity";

export default function RankingOptions({
  userId,
  isAdmin,
  options,
  searchMode,
  lastMode,
  adminChangeSameGameNewMode,
  setOptions,
}) {
  const [mode, setMode] = useState(
    searchMode || (isAdmin && lastMode?.mode) || options.mode || "Podium"
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

    setModeList([{ mode: "Podium", text: "Podium" }]);
  }, [mode, setOptions, isAdmin, userId]);

  useEffect(() => {
    if (isAdmin) return;

    setMode(options.mode);
  }, [isAdmin, options.mode]);

  // const same = lastMode.mode === mode; //can be used

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

      {mode === "Podium" && !isSelectingMode && (
        <div className="flex flex-col items-center">
          <div className="w-full flex justify-center my-2">
            <div
              className={`mr-2 text-sky-700
              ${!isAdmin && options?.target !== "players" && "opacity-50"}
              `}
            >
              <IoPeople className="h-8 w-8" />
            </div>
            {isAdmin ? (
              <Toggle
                isAdmin={isAdmin}
                options={options}
                setOptions={setOptions}
                optionName="target"
                possibleValues={["players", "others"]}
                defaultValue={lastParams?.target || "players"}
              />
            ) : (
              <div className="text-2xl">|</div>
            )}
            <div
              className={`ml-2 text-sky-700 ${
                !isAdmin && options?.target !== "others" && "opacity-50"
              }`}
            >
              <BsThreeDots className="h-8 w-8" />
            </div>
          </div>

          <div className="w-full flex justify-center items-center my-2">
            <div
              className={`mr-2 text-sky-700 ${
                !isAdmin && options?.top !== "3" && "opacity-50"
              }`}
            >
              <GiPodium className="h-8 w-8 mb-1" />
            </div>
            {isAdmin ? (
              <Toggle
                isAdmin={isAdmin}
                options={options}
                setOptions={setOptions}
                optionName="top"
                possibleValues={["3", "infinite"]}
                defaultValue={lastParams?.top || "3"}
              />
            ) : (
              <div className="text-2xl">|</div>
            )}
            <div
              className={`ml-2 text-sky-700 ${
                !isAdmin && options?.top !== "infinite" && "opacity-50"
              }`}
            >
              <Infinity size={32} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
