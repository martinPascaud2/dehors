import { subCategories } from "@/assets/globals";

export const checkGuestAllowed = (href) => {
  const allowedPaths = [];
  for (const subCat in subCategories) {
    subCategories[subCat].map((game) => {
      allowedPaths.push(`categories/${subCat}/${game.path}/`);
    });
  }

  let isGuestAllowed;

  try {
    const url = new URL(href);
    const path = url.pathname.replace(/^\//, ""); // remove leading slash
    const searchParams = url.searchParams;

    const hasToken = searchParams.has("token");
    const hasGuestName = searchParams.has("guestName");

    const isPathAllowed = allowedPaths.includes(path);

    isGuestAllowed = isPathAllowed && hasToken && hasGuestName;
  } catch (err) {
    console.error("Invalid URL in checkGuestAllowed:", href);
    isGuestAllowed = false;
  }

  return isGuestAllowed;
};
