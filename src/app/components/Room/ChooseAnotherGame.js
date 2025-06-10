import { searchGame } from "./actions";

export default function ChooseAnotherGame({
  setShowPlayers,
  setShowConfig,
  gameData,
  roomId,
  roomToken,
  deleteInvs,
}) {
  return (
    <div
      onClick={async () => {
        await deleteInvs();
        await searchGame({ gameData, roomId, roomToken });

        setShowPlayers(true);
        setShowConfig(false);
      }}
      className="h-[4dvh] w-[4dvh] flex justify-end items-center text-amber-700"
    >
      <p
        className="text-4xl"
        style={{
          color: "#fef3c7", // amber-100
          WebkitTextStroke: "2px #b45309", // amber-700
          textShadow: "2px 2px 4px rgba(74, 4, 78, 0.4)",

          // firefox
          // textShadow: `
          //   -1px -1px 0 #b45309,
          //   1px -1px 0 #b45309,
          //   -1px 1px 0 #b45309,
          //   1px 1px 0 #b45309
          // `,
        }}
      >
        !
      </p>
    </div>
  );
}
