"use client";

import { useUserContext } from "./Room/Room";
import { deleteRoom } from "./Room/actions";
import cancelBack from "@/utils/cancelBack";

import { StaticNextStep } from "./NextStep";

export default function GoPostgame({
  postgameRef,
  isAdmin,
  roomId,
  user,
  roomToken,
}) {
  const contextValue = useUserContext();
  const pusher = contextValue.pusher;
  const pusherPresence = contextValue.pusherPresence;

  if (typeof window === "undefined") return null;

  return (
    <StaticNextStep
      onClick={async () => {
        isAdmin && (await deleteRoom({ roomId }));
        await cancelBack({ userId: user.id });

        pusher.unsubscribe(`room-${roomToken}`);
        pusherPresence &&
          pusherPresence.unsubscribe(`custom-presence-${roomToken}`);

        if (!user.multiGuest) {
          window.location.href = postgameRef;
        } else {
          window.location.href = "/";
        }
      }}
    >
      Quitter
    </StaticNextStep>
  );
}
