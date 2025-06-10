"use client";

import { deleteWord } from "./actions";

import { XMarkIcon } from "@heroicons/react/24/outline";

export default function Word({ word, revalidate }) {
  return (
    <div className="m-2">
      <div>
        <div className="flex items-center justify-center relative w-full">
          <div>{word.word}</div>

          <XMarkIcon
            className="absolute right-[25%] w-4 h-4 border border-blue-300 bg-blue-100"
            onClick={() => {
              deleteWord({ id: word.id });
              revalidate();
            }}
          />
        </div>
      </div>
    </div>
  );
}
