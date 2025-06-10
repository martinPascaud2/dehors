"use server";

export default async function cancelBack({ userId }) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { roomId: null },
    });
  } catch (error) {
    console.error("Error updating user.roomId:", error);
    throw error;
  }
}
