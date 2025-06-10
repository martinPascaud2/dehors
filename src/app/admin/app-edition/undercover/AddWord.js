"use client";

import { useRef } from "react";
import { useFormState } from "react-dom";

import { addWord } from "./actions";

const initialState = {
  message: null,
  status: 100,
};

export default function AddWord({ themeId, revalidate }) {
  const addWordWithId = addWord.bind(null, themeId);
  const [state, formAction] = useFormState(addWordWithId, initialState);
  const refForm = useRef();

  return (
    <form
      ref={refForm}
      action={(formData) => {
        formAction(formData);
        refForm.current?.reset();
        revalidate();
      }}
      className="flex flex-col justify-center items-center"
    >
      <label htmlFor="word">Nouveau mot</label>
      <input
        required
        type="text"
        name="word"
        id="word"
        className="border focus:outline-none focus:border-2"
      />

      <button type="submit" className="border border-blue-300 bg-blue-100">
        Ajouter
      </button>

      <div className="text-justify font-semibold">{state.message}</div>
    </form>
  );
}
