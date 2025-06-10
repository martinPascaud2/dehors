"use client";

import { useEffect, useState } from "react";

import getLastParams from "@/utils/getLastParams";

import ModeSelector from "@/components/Options/ModeSelector";

export default function SecretOptions({
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
    searchMode || (isAdmin && lastMode?.mode) || options.mode || "Undercover"
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

    setModeList([{ mode: "Undercover", text: "Undercover" }]);
  }, [mode, setOptions, isAdmin, userId]);

  useEffect(() => {
    if (!lastLoaded && isAdmin) return;
    const timer = setTimeout(() => {
      setShow(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [lastLoaded, isAdmin]);

  useEffect(() => {
    if (isAdmin) return;

    setMode(options.mode);
  }, [isAdmin, options.mode]);

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
    </>
  );
}
