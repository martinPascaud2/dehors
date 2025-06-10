"use server";

import prisma from "@/utils/prisma";

export async function addCard(prevState, formData) {
  const title = formData.get("title");
  const text = formData.get("text");
  const type = formData.get("type");
  const difficulty = parseInt(formData.get("difficulty"));
  const adult = !!formData.get("adult");

  try {
    await prisma.actionouverite.create({
      data: {
        title,
        text,
        type,
        difficulty,
        adult,
      },
    });
    return {
      status: 200,
      message: "Carte créée avec succès",
    };
  } catch (error) {
    console.error("addCard error:", error);
    return {
      status: 500,
      message: "Erreur interne du serveur",
    };
  }
}
