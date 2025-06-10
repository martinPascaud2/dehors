"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useFormState } from "react-dom";

import { connect } from "@/actions";

const initialState = {
  message: null,
  srMessage: "Rentrez vos identifiants",
  status: 100,
};

export function LoginForm({}) {
  const [state, formAction] = useFormState(connect, initialState);
  const [prevUser, setPrevUser] = useState({ prevMail: "", prevPassword: "" });
  const inputRef = useRef();

  useEffect(() => {
    inputRef?.current?.focus();
  }, [inputRef]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userFromLocalStorage = localStorage.getItem("prevUser");
      if (userFromLocalStorage) {
        setPrevUser(JSON.parse(userFromLocalStorage));
      }
    }
  }, []);

  return (
    <>
      <form
        action={(FormData) => {
          formAction(FormData);
          const prevMail = FormData.get("mail");
          const prevPassword = FormData.get("password");
          localStorage.setItem(
            "prevUser",
            JSON.stringify({ prevMail, prevPassword })
          );
        }}
        className="flex flex-col justify-center items-center"
      >
        <label htmlFor="mail">Ton adresse mail</label>
        <input
          ref={inputRef}
          type="email"
          name="mail"
          id="mail"
          autoComplete="email"
          defaultValue={prevUser.prevMail}
          className="border focus:outline-none focus:border-2"
        />

        <label htmlFor="password">Ton mot de passe</label>
        <input
          type="password"
          name="password"
          id="password"
          autoComplete="current-password"
          defaultValue={prevUser.prevPassword}
          className="border focus:outline-none focus:border-2"
        />

        <div className="text-justify font-bold">{state.message}</div>

        <button
          type="submit"
          className="border border-blue-300 bg-blue-100 mt-4"
        >
          Connexion
        </button>

        <p aria-live="polite" className="sr-only">
          {state?.srMessage}
        </p>
        {/* <Link href="/signin" className="border border-blue-300 bg-blue-100">
          Pas encore de compte ?
        </Link> */}
      </form>
    </>
  );
}
