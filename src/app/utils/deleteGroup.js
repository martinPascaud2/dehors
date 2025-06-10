"use server";

export default async function deleteGroup({ groupToken }) {
  await pusher.trigger(`room-${groupToken}`, "room-event", {
    gameData: {
      nextGame: "deleted group",
    },
  });
}
