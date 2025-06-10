"use server";

import prisma from "@/utils/prisma";

export async function addWord(prevState, formData) {
  const word = formData.get("word");

  try {
    await prisma.drawingWord.create({
      data: {
        word,
      },
    });
    return {
      status: 200,
      message: "Mot créé avec succès",
    };
  } catch (error) {
    console.error("addWord error:", error);
    return {
      status: 500,
      message: "Erreur interne du serveur",
    };
  }
}

export async function deleteWord({ id }) {
  try {
    await prisma.drawingWord.delete({ where: { id: id } });
  } catch (error) {
    console.error("deleteWord error:", error);
  }
}
