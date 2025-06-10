"use client";

import { useCallback, useEffect, useState } from "react";

import { vampiro } from "@/assets/fonts";

export default function ActionsList({ takeNext, firstTen, deleteAction }) {
  const [list, setList] = useState(firstTen);
  const [skip, setSkip] = useState(0);
  const [deleted, setDeleted] = useState(0);

  const take = async () => {
    const nextTaken = await takeNext({ skip: skip - deleted });
    setList((prevList) => [...prevList, ...nextTaken]);
  };

  useEffect(() => {
    skip !== 0 && take();
  }, [skip]);

  const del = async ({ id }) => {
    await deleteAction({ id });
    const newList = list.filter((action) => action.id !== id);
    setList(newList);
    setDeleted((prev) => prev + 1);
  };

  const List = useCallback(() => {
    return (
      <>
        {list?.map((action) => (
          <div
            key={action.id}
            className="w-[90%] rounded-md border border-slate-300 my-2 p-2 flex flex-col items-center bg-white"
          >
            <div className={`${vampiro.className} w-full p-2 m-2 text-center`}>
              {action.action}
            </div>
            <button
              onClick={() => del({ id: action.id })}
              className="border border-red-300 bg-red-100"
            >
              Supprimer
            </button>
          </div>
        ))}
      </>
    );
  }, [list]);

  return (
    <div className="flex flex-col items-center">
      <h1 className="font-bold">Dernières actions créées</h1>
      <List />

      <button
        onClick={() => setSkip((prevSkip) => prevSkip + 10)}
        className="border border-blue-300 bg-blue-100 m-2"
      >
        Actions suivantes
      </button>
    </div>
  );
}
