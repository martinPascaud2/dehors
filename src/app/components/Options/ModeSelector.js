"use client";

import { useCallback, useEffect, useState } from "react";
import compareState from "@/utils/compareState";

//modeList [{mode: "mode1", text: "text1"}, ...]
export default function ModeSelector({
  isAdmin,
  options,
  defaultValue,
  adminChangeSameGameNewMode,
  modeList,
  setMode,
  setOptions,
  isSelectingMode,
  setIsSelectingMode,
}) {
  const [value, setValue] = useState();

  useEffect(() => {
    if (!defaultValue) return;
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (!adminChangeSameGameNewMode || !isAdmin) return;

    setValue(adminChangeSameGameNewMode);
    setMode(adminChangeSameGameNewMode);
    setOptions((prevOptions) => {
      const newOptions = { ...options, mode: adminChangeSameGameNewMode };
      return compareState(prevOptions, newOptions);
    });
  }, [adminChangeSameGameNewMode, isAdmin, options, setOptions, setMode]);

  const Select = useCallback(() => {
    if (!value) return;

    if (!isAdmin)
      return <div className="font-semibold text-xl">{options.mode}</div>;

    if (!isSelectingMode)
      return (
        <div
          onClick={() => setIsSelectingMode(true)}
          className="w-2/3 text-2xl text-amber-700 font-semibold border border-amber-700 bg-amber-100 p-2 text-center rounded"
        >
          {value}
        </div>
      );
    else
      return (
        <div className="w-2/3 flex flex-col gap-4 h-full justify-around">
          {modeList.map((mode) => (
            <div
              key={mode.mode}
              onClick={() => {
                setMode(mode.mode);
                setOptions((prevOptions) => {
                  const newOptions = { ...options, mode: mode.mode };
                  return compareState(prevOptions, newOptions);
                });
                setIsSelectingMode(false);
              }}
              className="w-full text-2xl text-amber-700 border border-amber-700 p-2 text-center border-dotted rounded"
            >
              {mode.text}
            </div>
          ))}
        </div>
      );
  }, [
    value,
    modeList,
    setMode,
    setOptions,
    isAdmin,
    options,
    setIsSelectingMode,
    isSelectingMode,
  ]);

  if (modeList.length === 1) return null;

  return (
    <div
      className="w-full flex justify-center"
      style={{
        ...(isSelectingMode
          ? { height: "100%" }
          : { marginTop: "0.5rem", marginBottom: "1rem" }),
      }}
    >
      {Select()}
    </div>
  );
}
