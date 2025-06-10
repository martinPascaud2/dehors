export const categories = [
  {
    name: "SOCIAL",
    href: "/categories/categorie5",
    src: "/categoriesIcons/social.png",
    subCats: "categorie5",
  },
];

export const categoriesLabels = {
  categorie5: "Social",
};

export const categoriesIcons = {
  categorie5: "/categoriesIcons/social.png",
};

export const subCategories = {
  grouping: [{ name: "grouping", path: "grouping" }],

  categorie5: [
    {
      name: "Recherche",
      path: "research",
      // img: "/undercover.png",
      description: "Description de la recherche",
    },
  ],
};

// to be done : limits in modes
// important: modes.path must be === mode.mode(modeList) in game_Options
export const gamesRefs = {
  grouping: { name: "un nouveau groupe", categorie: "grouping" },

  research: {
    name: "Recherche",
    categorie: "categorie5",
    modes: [{ label: "Hunted", path: "Hunted" }],
    limits: { min: 1, max: 12, opti: 6 },
  },
};

export const modesRules = {
  Hunted: {
    name: "Hunted",
    limits: { min: 1, max: 12, opti: 6 },
  },
};

export const toolsList = [
  { tool: "buzzer", layout: "Buzzer" },
  { tool: "map", layout: "Carte" },
];

export const postGamesList = [{ game: "osef", layout: "Rien" }];
