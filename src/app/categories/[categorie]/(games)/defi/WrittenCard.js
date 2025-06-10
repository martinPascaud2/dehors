"use client";

import { useRouter } from "next/navigation";

import { vampiro } from "@/assets/fonts";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";

import { validateTri_Action } from "@/post-game/actions";

export default function WrittenCard({
  data,
  done,
  postGame,
  gamer,
  canModify,
}) {
  const router = useRouter();

  return (
    <div className="w-[90%] rounded-md border border-lime-800 my-3 py-2 px-4 flex flex-col items-center shadow-lg shadow-slate-800 bg-lime-700">
      <label className="font-bold text-slate-100 tracking-wide">
        {data.label}
      </label>
      <div
        className={`${vampiro.className} w-full p-2 m-2 text-center text-red-900 text-lg bg-lime-100 border-4 border-double border-lime-800 relative`}
      >
        {data.action}
        {done !== undefined ? (
          done ? (
            <CheckIcon className="absolute right-2 top-1/4 h-6 w-6 stroke-[4px] text-lime-700" />
          ) : (
            <XMarkIcon className="absolute right-2 top-1/4 h-6 w-6 stroke-[4px]" />
          )
        ) : null}
      </div>
      {postGame && canModify && (
        <div className="flex w-full justify-end">
          <button
            onClick={async () => {
              await validateTri_Action({ gamer, postGame, data });
              router.refresh();
            }}
            className={`border ${
              done ? "border-red-300 bg-red-100" : "border-blue-300 bg-blue-100"
            } p-0.5 mr-0.5`}
          >
            {done ? "Invalider" : "Valider"}
          </button>
        </div>
      )}
    </div>
  );
}
