"use client";

import { useFormState } from "react-dom";
import { useRef } from "react";

import { addCard } from "./actions";

const initialState = {
  message: null,
  status: 100,
};

export default function AddCard() {
  const [state, formAction] = useFormState(addCard, initialState);
  const refForm = useRef();

  return (
    <>
      <form
        ref={refForm}
        action={(formData) => {
          formAction(formData);
          refForm.current?.reset();
        }}
        className="flex flex-col justify-center items-center"
      >
        <label htmlFor="title">Titre de la carte</label>
        <input
          required
          type="text"
          name="title"
          id="title"
          className="border focus:outline-none focus:border-2"
        />

        <label htmlFor="text">Texte de la carte</label>
        <textarea
          required
          type="text"
          name="text"
          id="text"
          className="border focus:outline-none focus:border-2"
        />

        <label htmlFor="type">action</label>
        <input id="type" type="radio" name="type" value="action" required />
        <label htmlFor="type">vérité</label>
        <input id="type" type="radio" name="type" value="vérité" required />
        <div className="text-justify font-bold">{state.message}</div>

        <select name="difficulty" required>
          <option value="">Sélectionner difficulté</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>

        <label htmlFor="adult">+18</label>
        <input type="checkbox" name="adult" />

        <button type="submit">Créer</button>
      </form>
    </>
  );
}
