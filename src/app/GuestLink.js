"use client";

import { useRouter } from "next/navigation";

export default function GuestLink() {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        router.push("/guest");
      }}
      className="border border-blue-300 bg-blue-100"
    >
      J&apos;essaie comme invité
    </button>
  );
}
