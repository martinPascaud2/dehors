"use client";

import { deleteTheme } from "./actions";

import { XMarkIcon } from "@heroicons/react/24/outline";

export default function Theme({ theme, revalidate }) {
  return (
    <div className="m-2">
      <div>
        <div className="flex items-center justify-center relative w-full">
          <div>{theme.theme}</div>

          <XMarkIcon
            className="absolute right-[25%] w-4 h-4 border border-blue-300 bg-blue-100"
            onClick={() => {
              deleteTheme({ id: theme.id });
              revalidate();
            }}
          />
        </div>
      </div>
    </div>
  );
}
