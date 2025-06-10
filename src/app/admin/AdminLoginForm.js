"use client";

import { useRef, useEffect } from "react";
import { useFormState } from "react-dom";

import { adminConnect } from "./actions";

const initialState = {
  message: null,
  status: 100,
};

export default function AdminLoginForm() {
  const [state, formAction] = useFormState(adminConnect, initialState);
  const inputRef = useRef();

  useEffect(() => {
    inputRef?.current?.focus();
  }, [inputRef]);

  return (
    <>
      <form
        action={formAction}
        className="flex flex-col justify-center items-center"
      >
        <label htmlFor="mail">Adresse mail</label>
        <input
          ref={inputRef}
          type="mail"
          name="mail"
          id="mail"
          className="border focus:outline-none focus:border-2"
        />

        <label htmlFor="password">Mot de passe</label>
        <input
          type="password"
          name="password"
          id="password"
          className="border focus:outline-none focus:border-2"
        />

        <div className="text-justify font-bold">{state.message}</div>

        <button type="submit" className="border border-blue-300 bg-blue-100">
          Se connecter
        </button>
      </form>
    </>
  );
}
