"use client";

import { useEffect, useState } from "react";

import compareState from "@/utils/compareState";

export default function OptionsLabel({
  isAdmin,
  options,
  setOptions,
  param,
  values,
  last,
}) {
  const [value, setValue] = useState(
    last || options[param.value] || values.default
  );

  useEffect(() => {
    if (!isAdmin || !value) return;
    setOptions((prevOptions) => {
      const newOptions = {
        ...options,
        [param.value]: value,
      };
      return compareState(prevOptions, newOptions);
    });
  }, [value, isAdmin]);

  return (
    <div className="flex flex-col items-center mb-2">
      <div>{param.label}</div>

      <div className="flex justify-center">
        {isAdmin ? (
          <select
            defaultValue={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            className="border border-amber-700 bg-amber-100 text-amber-700 p-1 text-center"
          >
            {values.possibles.map((possible) => (
              <option key={possible.value} value={possible.value}>
                {possible.label}
              </option>
            ))}
          </select>
        ) : (
          <div className="border p-1 border-sky-700 text-sky-700 bg-sky-100 font-semibold">
            {(() =>
              values.possibles.find(
                (possible) => possible.value === options[param.value]
              )?.label)()}
          </div>
        )}
      </div>
    </div>
  );
}
