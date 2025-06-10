"use client";

import { useState } from "react";

import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

import { deleteWord, deleteTheme } from "./actions";

import AddWord from "./AddWord";

export default function Theme({ theme, revalidate }) {
  const [show, setShow] = useState(false);
  return (
    <div className="m-2">
      <button
        onClick={async () => {
          await deleteTheme({ theme });
          await revalidate();
        }}
        className="border border-red-300 bg-red-100 p-1 font-bold"
      >
        X
      </button>

      <button onClick={() => setShow(!show)}>
        <div className="flex font-bold">
          <div className="flex items-center m-2">
            <div className="m-2">{theme.theme}</div>
            {!show ? (
              <ChevronRightIcon className="h-6 w-5" />
            ) : (
              <ChevronDownIcon className="h-6 w-5" />
            )}
          </div>
        </div>
      </button>
      {show && (
        <>
          {theme.words.map((word, i) => {
            return (
              <div key={i} className="flex items-center">
                <button
                  onClick={async () => {
                    await deleteWord({ word });
                    await revalidate();
                  }}
                  className="border border-red-300 bg-red-100 p-1"
                >
                  X
                </button>
                <div className="m-2">{word.word}</div>
              </div>
            );
          })}

          <AddWord themeId={theme.id} revalidate={revalidate} />
        </>
      )}
    </div>
  );
}
