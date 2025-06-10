"use client";

import { useRouter } from "next/navigation";
import { useUserContext } from "./Room/Room";

import deleteGroup from "@/utils/deleteGroup";
import { deleteRoom } from "./Room/actions";

import { ImExit } from "react-icons/im";

export default function DeleteGroup({ roomToken, roomId }) {
  const router = useRouter();
  const contextValue = useUserContext();
  const userParams = contextValue.userParams;
  const pusher = contextValue.pusher;
  const pusherPresence = contextValue.pusherPresence;

  return (
    <button
      onClick={async () => {
        pusher.unsubscribe(`room-${roomToken}`);
        pusherPresence.unsubscribe(`custom-presence-${roomToken}`);
        await deleteGroup({ groupToken: roomToken });
        await deleteRoom({ roomId });
        window.location.href = "/categories";
      }}
      className="border border-blue-300 bg-blue-100"
      style={{ bottom: `${userParams?.bottomBarSize / 4 || 2}rem` }}
    >
      Quitter
    </button>
  );
}

export function LobbyDeleteGroup({ roomToken, roomId }) {
  const router = useRouter();
  const contextValue = useUserContext();
  const userParams = contextValue.userParams;

  return (
    <button
      onClick={async () => {
        await deleteRoom({ roomId });
        await deleteGroup({ groupToken: roomToken });
      }}
      className="absolute left-full top-1/2 translate-y-[-50%] border border-amber-700 rounded-sm bg-amber-100 text-amber-700 ml-2"
    >
      <ImExit className="ml-1 w-5 h-5 p-0.5" />
    </button>
  );
}
