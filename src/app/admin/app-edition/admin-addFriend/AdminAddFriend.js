"use client";

import { useState } from "react";

export default function AdminAddFriend({ adminAddFriend }) {
  const [firstMail, setFirstMail] = useState("");
  const [secondMail, setSecondMail] = useState("");
  const [serverMessage, setServerMessage] = useState("");

  return (
    <div className="h-full w-full flex flex-col items-center">
      <div className="font-bold my-6">Ajout d&apos;amis</div>
      <div>Premier mail</div>
      <input
        type="email"
        onChange={(e) => setFirstMail(e.target.value)}
        className="border"
      />

      <div className="mt-2">Second mail</div>
      <input
        type="email"
        onChange={(e) => setSecondMail(e.target.value)}
        className="border"
      />

      <button
        onClick={async () => {
          const response = await adminAddFriend({ firstMail, secondMail });
          if (response.error) setServerMessage(response.error);
          else if (response.message) setServerMessage(response.message);
        }}
        className="mt-6 border border-blue-400 bg-blue-100 text-blue-400 p-2"
      >
        Ajouter les deux
      </button>
      <div>{serverMessage}</div>
    </div>
  );
}
