"use server";

export async function validateTri_Action({ gamer, postGame, data }) {
  const { actions } = postGame.gameData;
  const newGamerActions = { ...actions[gamer] };
  const { type: actionType } = data;

  const gamerAction = newGamerActions[actionType];
  const newGamerAction = {
    ...gamerAction,
    done: gamerAction.done ? false : true,
  };
  newGamerActions[actionType] = newGamerAction;

  const newActions = { ...actions, [gamer]: newGamerActions };
  const { gameData } = postGame;
  const newGameData = { ...gameData, actions: newActions };

  const { id: postGameId } = postGame;

  try {
    await prisma.postGame.update({
      where: { id: postGameId },
      data: { gameData: newGameData },
    });
  } catch (error) {
    console.error(error);
  }
}
