"use client";

import { useRouter } from "next/navigation";

export default function GuestDisconnector({ signOut }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await signOut();
        router.push("/");
        // window.location.reload(); // check
      }}
      className="w-1/2 self-center border border-blue-300 bg-blue-100 mt-20"
    >
      Retour à l&apos;écran de connexion
    </button>
  );
}
