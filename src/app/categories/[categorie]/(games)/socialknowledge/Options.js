"use client";

import { useEffect, useState } from "react";

import getLastParams from "@/utils/getLastParams";

import Spinner from "@/components/spinners/Spinner";
import ModeSelector from "@/components/Options/ModeSelector";
import PresetCountdown from "@/components/Options/PresetCountdown";
import OptionsLabel from "@/components/Options/OptionsLabel";
import TableauThemeOption from "./TableauThemeOption";

export default function SocialKnowledgeOptions({
  userId,
  isAdmin,
  options,
  setOptions,
  searchMode,
  lastMode,
  adminChangeSameGameNewMode,
  serverMessage,
  setServerMessage,
  gamersNumber,
}) {
  const [mode, setMode] = useState(
    searchMode || (isAdmin && lastMode?.mode) || options.mode || "Tableau"
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

    setModeList([{ mode: "Tableau", text: "Tableau" }]);
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

      {mode === "Tableau" && !isSelectingMode && (
        <>
          <PresetCountdown
            isAdmin={isAdmin}
            options={options}
            setOptions={setOptions}
            times={{ values: [1, 2, 5, 10, 20, 30, 0], default: 5 }}
            last={lastParams?.countDownTime}
          />

          <OptionsLabel
            isAdmin={isAdmin}
            options={options}
            setOptions={setOptions}
            param={{ value: "secondChance", label: "Seconde chance" }}
            values={{
              possibles: [
                { value: "no", label: "Non" },
                { value: "without correction", label: "Sans correction" },
                { value: "with correction", label: "Avec correction" },
              ],
              default: "no",
            }}
            last={lastParams?.["secondChance"]}
          />

          <OptionsLabel
            isAdmin={isAdmin}
            options={options}
            setOptions={setOptions}
            param={{ value: "difficulty", label: "Difficulté" }}
            values={{
              possibles: [
                { value: "easy", label: "Facile" },
                { value: "expert", label: "Expert" },
              ],
              default: "easy",
            }}
            last={lastParams?.["difficulty"]}
          />

          <TableauThemeOption
            lastParams={lastParams}
            options={options}
            setOptions={setOptions}
            isAdmin={isAdmin}
            max={gamersNumber >= 6 ? 3 : 4}
            serverMessage={serverMessage}
            setServerMessage={setServerMessage}
          />
        </>
      )}
    </>
  );
}
