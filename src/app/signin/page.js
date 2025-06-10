"use client";

import { useFormState } from "react-dom";

import { createAccount } from "./actions";

const initialState = {
  srMessage: "Création de compte : entrez vos identifiants.",
  message: null,
  status: 100,
};

export default function Signin() {
  const [state, formAction] = useFormState(createAccount, initialState);

  return (
    <div className="absolute top-[20%] left-[50%] translate-x-[-50%]">
      <form
        action={formAction}
        className="flex flex-col justify-center items-center"
      >
        <label htmlFor="mail">Adresse mail</label>
        <input
          type="mail"
          name="mail"
          id="mail"
          required
          className="border focus:outline-none focus:border-2"
        />
        <label htmlFor="password">Pseudonyme</label>
        <input
          type="name"
          name="name"
          id="name"
          required
          className="border focus:outline-none focus:border-2"
        />
        <label htmlFor="password">Mot de passe</label>
        <input
          type="password"
          name="password"
          id="password"
          required
          className="border focus:outline-none focus:border-2"
        />
        <button
          type="submit"
          className="border border-blue-300 bg-blue-100 m-2"
        >
          Création du compte
        </button>
        <div className="text-justify font-bold">{state.message}</div>

        <p aria-live="polite" className="sr-only">
          {state?.message}
        </p>
      </form>
    </div>
  );
}
