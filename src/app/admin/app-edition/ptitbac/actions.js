"use server";

import prisma from "@/utils/prisma";

export async function addTheme(prevState, formData) {
  const theme = formData.get("theme");

  try {
    await prisma.ptitbactheme.create({
      data: {
        theme,
      },
    });
    return {
      status: 200,
      message: "Thème créé avec succès",
    };
  } catch (error) {
    console.error("addTheme error:", error);
    return {
      status: 500,
      message: "Erreur interne du serveur",
    };
  }
}

export async function deleteTheme({ id }) {
  try {
    await prisma.ptitbacthemesOnUsers.deleteMany({
      where: { ptitbacthemeId: id },
    });
    await prisma.ptitbactheme.delete({ where: { id: id } });
  } catch (error) {
    console.error("deleteTheme error:", error);
  }
}
