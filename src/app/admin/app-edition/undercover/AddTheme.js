"use client";

import { useRef } from "react";
import { useFormState } from "react-dom";

import { addTheme } from "./actions";

const initialState = {
  message: null,
  status: 100,
};

export default function AddTheme({ revalidate }) {
  const [state, formAction] = useFormState(addTheme, initialState);
  const refForm = useRef();

  return (
    <div className="m-2">
      <form
        ref={refForm}
        action={(formData) => {
          formAction(formData);
          refForm.current?.reset();
          revalidate();
        }}
        className="flex flex-col justify-center items-center"
      >
        <label htmlFor="theme">Nouveau groupe de cartes</label>
        <input
          required
          type="text"
          name="theme"
          id="theme"
          className="border focus:outline-none focus:border-2"
        />

        <button type="submit" className="border border-blue-300 bg-blue-100">
          Créer
        </button>
      </form>
    </div>
  );
}
