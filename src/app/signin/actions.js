"use server";

import { redirect } from "next/navigation";

const bcrypt = require("bcrypt");
const saltRounds = 10;

import prisma from "@/utils/prisma";
import validateEmail from "@/utils/validateEmail";

export async function createAccount(prevState, formData) {
  const mail = formData.get("mail");
  const name = formData.get("name");
  const password = formData.get("password");

  if (!validateEmail(mail)) {
    return {
      status: 400,
      message: "Votre adresse mail semble être incorrecte.",
      srMessage: "Votre adresse mail semble être incorrecte.",
    };
  }

  if (password.length < 5) {
    return {
      status: 400,
      message: "Mot de passe trop court",
      srMessage: "Mot de passe trop court",
    };
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.error("Password error :", error);
    return {
      status: 424,
      message: `Une erreur s'est produite ; veuillez réessayer.`,
      srMessage: `Une erreur s'est produite ; veuillez réessayer.`,
    };
  }

  try {
    await prisma.user.create({
      data: {
        email: mail,
        name,
        password: hashedPassword,
        creationDate: new Date(),
      },
    });
  } catch (error) {
    console.error("Account creation error:", error);
    return {
      status: 424,
      message: "Erreur durant la création du compte ; veuillez réessayer",
      srMessage: "Erreur durant la création du compte ; veuillez réessayer",
    };
  }

  redirect("/");

  return {
    status: 200,
    message: "Création du compte réalisée avec succès",
    srMessage: "Création du compte réalisée avec succès",
  };
}
