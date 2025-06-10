"use client";

import { useEffect, useState } from "react";

import compareState from "@/utils/compareState";
import getLastParams from "@/utils/getLastParams";

import ModeSelector from "@/components/Options/ModeSelector";
import MemoryThemeOption from "./MemoryThemeOption";
import Spinner from "@/components/spinners/Spinner";

export default function MemoryOptions({
  isAdmin,
  options,
  setOptions,
  searchMode,
  lastMode,
  adminChangeSameGameNewMode,
  userId,
  setServerMessage,
  //for new games
  modeSelector = true,
}) {
  const [mode, setMode] = useState(
    searchMode || (isAdmin && lastMode?.mode) || options?.mode || "Memory"
  );
  const [lastParams, setLastParams] = useState();
  const [modeList, setModeList] = useState([]);
  const [pairsNumber, setPairsNumber] = useState(12);
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [isFetched, setIsFetched] = useState(false);
  const [isSelectingMode, setIsSelectingMode] = useState(false);

  useEffect(() => {
    if (isFetched || !mode) return;

    const loadLasts = async () => {
      const params = await getLastParams({ userId, mode });
      setLastParams((prevParams) => compareState(prevParams, params));

      setOptions((prevOptions) => {
        const newOptions = { ...params, mode };
        return compareState(prevOptions, newOptions);
      });

      setIsFetched(true);
    };
    isAdmin && setOptions && loadLasts();
    !isAdmin && setIsFetched(true);

    setModeList((prevModeList) => {
      const newModeList = [{ mode: "Memory", text: "Memory" }];
      return compareState(prevModeList, newModeList);
    });
  }, [mode, setOptions, isAdmin, userId, isFetched]);

  useEffect(() => {
    if (pairsNumber < 8) setPairsNumber(8);
    if (pairsNumber > 12) setPairsNumber(12);

    isAdmin &&
      setOptions &&
      setOptions((options) => {
        const newOptions = { ...options, pairsNumber };
        return compareState(options, newOptions);
      });
  }, [pairsNumber, isAdmin, setOptions]);

  useEffect(() => {
    if (!lastParams || !isAdmin) return;

    lastParams.pairsNumber !== pairsNumber &&
      setPairsNumber(lastParams.pairsNumber);
  }, [lastParams, isAdmin]);

  useEffect(() => {
    if (isAdmin || !options) return;

    setMode(options.mode);
    setPairsNumber(options.pairsNumber);
    setSelectedThemes((prevThemes) => compareState(prevThemes, options.themes));
  }, [isAdmin, options]);

  return (
    <div>
      {!isFetched ? (
        <Spinner />
      ) : (
        <>
          {modeSelector && (
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
          )}

          {!isSelectingMode && (
            <>
              <div className="mb-4 flex flex-col items-center">
                <div>Nombre de paires</div>
                <div className="w-[60%] flex">
                  <button
                    onClick={() => {
                      const newPairsNumber = pairsNumber - 2;
                      if (newPairsNumber < selectedThemes.length) {
                        setServerMessage("coucou"); // can be used
                        return;
                      }
                      setPairsNumber((pairs) => pairs - 2);
                    }}
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
                    {pairsNumber}
                  </div>
                  <button
                    onClick={() => setPairsNumber((pairs) => pairs + 2)}
                    className={`ml-auto border border-amber-700 bg-amber-100 text-amber-700 w-[20%] flex justify-center ${
                      !isAdmin ? "collapse" : ""
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>

              <MemoryThemeOption
                isAdmin={isAdmin}
                setOptions={setOptions}
                selectedThemes={selectedThemes}
                setSelectedThemes={setSelectedThemes}
                max={pairsNumber}
                setServerMessage={setServerMessage}
                lastParams={lastParams}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
