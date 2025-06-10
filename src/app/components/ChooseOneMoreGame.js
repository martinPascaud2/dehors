"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import getRoomPrivacy from "@/utils/getRoomPrivacy";
import { finishGame } from "./Room/actions";
import { useUserContext } from "./Room/Room";

import DeleteGroup from "./DeleteGroup";

// isFirst when lobby
export default function ChooseOneMoreGame({
  gameData,
  roomToken,
  roomId,
  isFirst = false,
  storedLocation,
}) {
  const contextValue = useUserContext();
  const userParams = contextValue.userParams;
  const pusher = contextValue.pusher;
  const pusherPresence = contextValue.pusherPresence;
  const router = useRouter();
  const [privacy, setPrivacy] = useState(null);
  const path = usePathname();
  const gameName = path.split("/")[3];

  const goChooseGame = useCallback(
    async (priv) => {
      const gamers = gameData.gamers.filter(
        (gamer) => !gamer.guest && !gamer.multiGuest
      );
      const multiGuests = gameData.gamers.filter((gamer) => gamer.multiGuest);
      const guests = gameData.gamers.filter((gamer) => gamer.guest);

      const group = {
        roomToken,
        gamers,
        multiGuests,
        guests,
        privacy: priv,
        lastGame: gameName,
        lastMode: { mode: gameData.options?.mode, options: gameData.options }, // options to remove ?
        lastPosition: storedLocation,
        viceAdmin: gameData.viceAdmin,
        arrivalsOrder: gameData.arrivalsOrder,
      };
      localStorage.setItem("group", JSON.stringify(group));

      const { game, categorie } = await finishGame({
        gameData,
        roomToken,
        roomId,
      });

      pusher.unsubscribe(`room-${roomToken}`);
      pusherPresence.unsubscribe(`custom-presence-${roomToken}`);

      router.push(
        isFirst
          ? `/categories?group=true`
          : `/categories/back/backToLobby/?categorie=${categorie}&game=${game}`
      );
    },
    [gameData, roomToken, router, isFirst, roomId]
  );

  useEffect(() => {
    const getPrivacy = async () => {
      const priv = (await getRoomPrivacy({ roomToken })) ? "private" : "public";
      setPrivacy(priv);
    };
    getPrivacy();

    isFirst && privacy !== null && goChooseGame(privacy);
  }, [roomToken, isFirst, privacy, goChooseGame]);

  if (isFirst) return null;

  return (
    <>
      <div>
        {privacy && (
          <div className={`absolute right-0`}>
            <button
              onClick={() => goChooseGame(privacy)}
              className="border border-blue-300 bg-blue-100"
            >
              Retour au lobby
            </button>
          </div>
        )}

        <div className={`absolute left-0`}>
          <DeleteGroup roomToken={roomToken} roomId={roomId} />
        </div>
      </div>
    </>
  );
}
