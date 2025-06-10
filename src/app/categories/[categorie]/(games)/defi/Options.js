"use client";

import { useEffect, useState } from "react";

import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { AiOutlineAim } from "react-icons/ai";

import getLastParams from "@/utils/getLastParams";

import ModeSelector from "@/components/Options/ModeSelector";
import Toggle from "@/components/Options/Toggle";

export default function DéfiOptions({
  userId,
  isAdmin,
  options,
  setOptions,
  searchMode,
  adminChangeSameGameNewMode,
  lastMode,
}) {
  const [mode, setMode] = useState(
    searchMode || (isAdmin && lastMode?.mode) || options.mode || "Triaction"
  );
  const [modeList, setModeList] = useState([]);
  const [isSelectingMode, setIsSelectingMode] = useState(false);
  const [lastParams, setLastParams] = useState();

  useEffect(() => {
    if (!mode) return;
    const loadLasts = async () => {
      const params = await getLastParams({ userId, mode });
      setLastParams(params);
      setOptions({ ...params, mode });
    };
    isAdmin && loadLasts();

    setModeList([{ mode: "Triaction", text: "Triaction" }]);
  }, [mode, setOptions, isAdmin, userId]);

  useEffect(() => {
    if (isAdmin) return;

    setMode(options.mode);
  }, [isAdmin, options.mode]);

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
            !isAdmin && options?.aimSelection !== "random" && "opacity-50"
          }`}
        >
          <GiPerspectiveDiceSixFacesRandom className="h-8 w-8 mb-1" />
        </div>
        {isAdmin ? (
          <Toggle
            isAdmin={isAdmin}
            options={options}
            setOptions={setOptions}
            optionName="aimSelection"
            possibleValues={["random", "peek"]}
            defaultValue={lastParams?.aimSelection || "random"}
          />
        ) : (
          <div className="text-2xl">|</div>
        )}
        <div
          className={`ml-2 text-sky-700 ${
            !isAdmin && options?.aimSelection !== "peek" && "opacity-50"
          }`}
        >
          <AiOutlineAim className="h-8 w-8 mb-1" />
        </div>
      </div>
    </>
  );
}
