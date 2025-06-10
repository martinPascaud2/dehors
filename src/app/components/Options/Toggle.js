"use client";

import { useEffect, useCallback, useState } from "react";

import ToggleCheckbox from "../ToggleCheckbox";

export default function Toggle({
  isAdmin,
  options,
  setOptions,
  optionName,
  possibleValues,
  defaultValue,
}) {
  const [checked, setChecked] = useState(true);

  const handleToggle = useCallback(
    (checked) => {
      if (!isAdmin) return;

      const newChecked = !checked;
      setChecked(newChecked);

      let newValue;
      if (newChecked) newValue = possibleValues[0];
      else newValue = possibleValues[1];

      setOptions((prevOptions) => {
        const newOptions = { ...prevOptions };
        newOptions[optionName] = newValue;
        return newOptions;
      });
    },
    [isAdmin, optionName, possibleValues, setOptions]
  );

  useEffect(() => {
    if (!options[optionName] && isAdmin) {
      setOptions((prevOptions) => ({
        ...prevOptions,
        [optionName]: defaultValue || possibleValues[0],
      }));
    }
  }, [
    options,
    optionName,
    isAdmin,
    handleToggle,
    checked,
    defaultValue,
    possibleValues,
    setOptions,
  ]);

  useEffect(() => {
    if (!options || !optionName || !possibleValues) return;

    if (options[optionName] === possibleValues[0]) setChecked(true);
    else setChecked(false);
  }, [isAdmin, options, optionName, possibleValues]);

  return (
    <ToggleCheckbox
      checked={checked}
      onChange={handleToggle}
      colors={
        isAdmin
          ? {
              bg: { yes: "#fef3c7", no: "#dcfce7" },
              border: { yes: "#b45309", no: "#15803d" },
            }
          : {
              bg: { yes: "#e0f2fe", no: "#e0f2fe" },
              border: { yes: "#0369a1", no: "#0369a1" },
            }
      }
      size={70}
    />
  );
}
