import { finishGame } from "./Room/actions";

export default function FinishGame({ gameData, roomToken }) {
  return (
    <div
      onClick={() => finishGame({ gameData, roomToken })}
      className="border border-blue-300 bg-blue-100 m-auto"
    >
      Terminer le jeu
    </div>
  );
}
