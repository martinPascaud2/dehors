export const categories = [
  {
    name: "CEREBRAL",
    href: "/categories/categorie1",
    src: "/categoriesIcons/cerebral.png",
    subCats: "categorie1",
  },
  {
    name: "CULTURE",
    href: "/categories/categorie2",
    src: "/categoriesIcons/knowledge2.png",
    subCats: "categorie2",
  },
  {
    name: "FAMILLE",
    href: "/categories/categorie3",
    src: "/categoriesIcons/family1.png",
    subCats: "categorie3",
  },
  {
    name: "CARTES",
    href: "/categories/categorie4",
    src: "/categoriesIcons/cards2.png",
    subCats: "categorie4",
  },
  {
    name: "SOCIAL",
    href: "/categories/categorie5",
    src: "/categoriesIcons/social.png",
    subCats: "categorie5",
  },
  {
    name: "DEUX",
    href: "/categories/categorie6",
    src: "/categoriesIcons/duo1.png",
    subCats: "categorie6",
  },
  {
    name: "APPLI",
    href: "/",
    src: "/categoriesIcons/appli.png",
  },
];

export const categoriesLabels = {
  categorie1: "Réflexion",
  categorie2: "Culture",
  categorie3: "Tout public",
  categorie4: "Cartes",
  categorie5: "Social",
  categorie6: "Pour deux",
};

export const categoriesIcons = {
  categorie1: "/categoriesIcons/cerebral.webp",
  categorie2: "/categoriesIcons/knowledge2.png",
  categorie3: "/categoriesIcons/family1.png",
  categorie4: "/categoriesIcons/cards2.png",
  categorie5: "/categoriesIcons/social.png",
  categorie6: "/categoriesIcons/duo1.png",
};

export const subCategories = {
  grouping: [{ name: "grouping", path: "grouping" }],
  categorie1: [
    {
      name: "Identiques",
      path: "dobble",
      img: "/dobble.jpg",
      description:
        "Découvrez l’unique symbole identique entre deux cartes... avant les autres !",
    },
  ],
  categorie2: [
    {
      name: "Placement",
      path: "sort",
      img: "/timeline.png",
      description: "Description du jeu de tri",
    },
  ],
  categorie3: [
    {
      name: "Dessin",
      path: "drawing",
      img: "/esquisse.jpg",
      description: "Dessin dessin dessin",
    },
    {
      name: "Quel mot ?",
      path: "ptitbac",
      img: "/ptitbac.jpg",
      description:
        "Le but est de trouver, par écrit et en un temps limité, une série de mots appartenant à une catégorie prédéfinie et commençant par la même lettre.",
    },
  ],
  categorie4: [
    {
      name: "Classico",
      path: "uno",
      img: "/uno.jpeg",
      description:
        "Pour gagner une manche de Uno, il faut être le premier joueur à se défausser de la dernière carte de sa main. La manche s'arrête alors (après les pioches de cartes éventuelles), et l'on compte les points. Le jeu continue, manche par manche, jusqu'à ce qu'un joueur atteigne 500 points.",
    },
  ],
  categorie5: [
    {
      name: "Classement",
      path: "ranking",
      img: "/ranking.jpg",
      description: "La description de ranking",
    },
    {
      name: "Mentalisme",
      path: "socialknowledge",
      img: "/socialknowledge.png",
      description: "La description de connaissance des autres",
    },
    {
      name: "Défi",
      path: "defi",
      img: "/triathlon.jpeg",
      description: "Blablabla eojrnvenrvlejrv ervedv dfvdvf",
    },
    // {
    //   name: "Action ou vérité",
    //   path: "actionouverite",
    //   img: "/actionouverite.png",
    //   description:
    //     "A tour de rôle, chaque joueur choisit entre une Action à réaliser, ou une Vérité à révéler... surprise !",
    // },
    {
      name: "Secret",
      path: "secret",
      img: "/undercover.png",
      description: "Description de secret",
    },
    {
      name: "Recherche",
      path: "research",
      // img: "/undercover.png",
      description: "Description de la recherche",
    },
  ],
  categorie6: [
    {
      name: "Mémoire",
      path: "memory",
      img: "/memory.jpeg",
      description:
        "À son tour, chaque joueur retourne deux cartes de son choix. S'il découvre deux cartes identiques, il les ramasse et les conserve, ce qui lui permet de rejouer. Si les cartes ne sont pas identiques, il les retourne faces cachées à leur emplacement de départ. Le jeu se termine quand toutes les paires de cartes ont été découvertes et ramassées. Le gagnant est le joueur qui possède le plus de paires.",
    },
  ],
};

// to be done : limits in modes
// important: modes.path must be === mode.mode(modeList) in game_Options
export const gamesRefs = {
  grouping: { name: "un nouveau groupe", categorie: "grouping" },
  // actionouverite: {
  //   name: "Action ou Vérité",
  //   categorie: "categorie1",
  //   limits: { min: 2, max: 15 },
  //   isGuestsAllowed: true,
  // },
  secret: {
    name: "Secret",
    categorie: "categorie5",
    modes: [{ label: "Undercover", path: "Undercover" }],
    limits: { min: 3, max: 15, opti: 8 },
  },
  dobble: {
    // name: "Identiques",
    name: "Dobble",
    categorie: "categorie1",
    // modes: [{ label: "Dobble (classique)", path: "Dobble" }],
    modes: [{ label: "Dobble", path: "Dobble" }],
    limits: { min: 2, max: 15, opti: 4 },
  },
  memory: {
    // name: "Mémoire",
    name: "Mémory",
    categorie: "categorie6",
    // modes: [{ label: "Memory (classique)", path: "Memory" }],
    modes: [{ label: "Memory", path: "Memory" }],
    limits: { min: 2, max: 2, opti: 2 },
  },
  ptitbac: {
    // name: "Quel mot ?",
    name: "P'tit bac",
    categorie: "categorie3",
    // modes: [{ label: "P'tit bac (classique)", path: "P%27tit%20bac" }],
    modes: [{ label: "P'tit bac", path: "P%27tit%20bac" }],
    limits: { min: 2, max: 15, opti: 7 },
  },
  drawing: {
    name: "Dessin",
    categorie: "categorie3",
    modes: [
      { label: "Pictionary", path: "Pictionary" },
      { label: "Esquissé", path: "Esquiss%C3%A9" },
    ],
    limits: { min: 4, max: 10, opti: 7 },
  },
  uno: {
    // name: "Classico",
    name: "Uno",
    categorie: "categorie4",
    // modes: [{ label: "Uno (classique)", path: "Uno" }],
    modes: [{ label: "Uno", path: "Uno" }],
    limits: { min: 2, max: 10, opti: 6 },
  },
  defi: {
    name: "Défi",
    categorie: "categorie5",
    modes: [{ label: "Triaction", path: "Triaction" }],
    limits: { min: 3, max: 8, opti: 5 },
  },
  ranking: {
    name: "Classement",
    categorie: "categorie5",
    modes: [{ label: "Podium", path: "Podium" }],
    limits: { min: 2, max: 10, opti: 6 },
  },
  sort: {
    name: "Placement",
    categorie: "categorie2",
    // modes: [{ label: "Placement (classique)", path: "Sort" }],
    modes: [{ label: "Placement", path: "Placement" }],
    limits: { min: 2, max: 8, opti: 5 },
  },
  socialknowledge: {
    name: "Mentalisme",
    categorie: "categorie5",
    modes: [{ label: "Tableau", path: "Tableau" }],
    limits: { min: 2, max: 10, opti: 6 },
  },
  research: {
    name: "Recherche",
    categorie: "categorie5",
    modes: [{ label: "Chasse", path: "Chasse" }],
    limits: { min: 1, max: 10, opti: 6 },
  },
};

export const modesRules = {
  "P'tit bac": {
    name: "Quel mot ?",
    limits: { min: 2, max: 15, opti: 7 },
  },

  dobble: {
    name: "Identiques",
    limits: { min: 2, max: 15, opti: 4 },
  },
  Dobble: {
    name: "Identiques",
    limits: { min: 2, max: 15, opti: 4 },
  },

  Pictionary: {
    name: "Pictionary",
    limits: { min: 4, max: 10, opti: 7 },
  },
  Esquissé: {
    name: "Esquissé",
    limits: { min: 4, max: 10, opti: 7 },
  },

  Podium: {
    name: "Podium",
    limits: { min: 1, max: 10, opti: 6 },
  },

  memory: {
    name: "Mémoire",
    limits: { min: 2, max: 2, opti: 2 },
  },
  Memory: {
    name: "Mémoire",
    limits: { min: 2, max: 2, opti: 2 },
  },

  Triaction: {
    // put mode in disconnected
    name: "Triaction",
    limits: { min: 3, max: 8, opti: 5 },
  },

  undercover: {
    name: "Undercover",
    limits: { min: 3, max: 15, opti: 8 },
  },
  Undercover: {
    name: "Undercover",
    limits: { min: 3, max: 15, opti: 8 },
  },

  uno: {
    name: "Classico",
    limits: { min: 2, max: 10, opti: 6 },
  },
  Uno: {
    name: "Classico",
    limits: { min: 2, max: 10, opti: 6 },
  },

  sort: {
    name: "Placement",
    limits: { min: 2, max: 8, opti: 5 },
  },
  Sort: {
    name: "Placement",
    limits: { min: 2, max: 8, opti: 5 },
  },
  Placement: {
    name: "Placement",
    limits: { min: 2, max: 8, opti: 5 },
  },

  tableau: {
    name: "Tableau",
    limits: { min: 2, max: 10, opti: 6 },
  },
  Tableau: {
    name: "Tableau",
    limits: { min: 2, max: 10, opti: 6 },
  },

  Chasse: {
    name: "Chasse",
    limits: { min: 1, max: 10, opti: 6 },
  },
};

export const toolsList = [
  { tool: "buzzer", layout: "Buzzer" },
  { tool: "map", layout: "Carte" },
];

export const postGamesList = [
  { game: "triaction", layout: "Triaction" },
  { game: "osef", layout: "Rien" },
];
