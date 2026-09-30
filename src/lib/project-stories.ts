export type ProjectStory = {
  role: string;
  introduction: string;
  statement: string;
  titleArtwork?: string;
  previewArtwork?: { src: string; alt: string; fit?: "cover" | "contain" }[];
  pillars: { title: string; text: string }[];
  roadmap: { title: string; text: string; image: string; alt: string; position: string }[];
};

export const projectStories: Record<string, ProjectStory> = {
  pusaka: {
    role: "Our first proof",
    introduction: "Heritage in every movement.",
    statement: "A meeting of instinct, intention, and the art of Silat.",
    titleArtwork: "/images/projects/pusaka-wordmark.png",
    previewArtwork: [
      { src: "/images/projects/pusaka-icon.png", alt: "PUSAKA game emblem", fit: "contain" },
      { src: "/images/projects/pusaka-environment.png", alt: "A sunlit Malay waterfront settlement with timber homes and a central gathering pavilion" },
    ],
    pillars: [
      { title: "Silat at its heart", text: "Malaysian martial heritage shapes the movement, rhythm, and identity of the game." },
      { title: "Deliberate combat", text: "A combat direction built around tactical footwork, precise timing, and meaningful player choices." },
      { title: "Players together", text: "Designed as an online multiplayer fighting game, where each encounter is a contest between players." },
      { title: "A living heritage", text: "An invitation to discover the culture carried through movement, setting, and visual storytelling." },
    ],
    roadmap: [
      { title: "Define the movement", text: "Explore the rhythm of Silat and shape the game’s combat identity, movement language, and visual direction.", image: "/night-walk/assets/projects/pusaka-wallpaper.png", alt: "PUSAKA concept art detail of a Silat fighter in red", position: "25% 55%" },
      { title: "Build the encounter", text: "Develop and iterate on the combat prototype, then explore how the experience comes together between online players.", image: "/images/projects/pusaka-environment.png", alt: "A sunlit Malay waterfront settlement with timber homes and a central gathering pavilion", position: "50% 48%" },
      { title: "Refine through play", text: "Use future playtesting to refine the experience and prepare more of the game to share with the public.", image: "/night-walk/assets/projects/pusaka-wallpaper.png", alt: "Traditional timber pavilion and banners in PUSAKA concept artwork", position: "51% 12%" },
    ],
  },
  "myth-tanah": {
    role: "Our flagship world",
    introduction: "The land remembers.",
    statement: "A world of myth. A journey into the imagination of home.",
    pillars: [
      { title: "Myth & imagination", text: "Malaysian-inspired mythology becomes a starting point for an original fantasy world." },
      { title: "A world to discover", text: "Mysterious landscapes and places with a sense of history invite curiosity through exploration." },
      { title: "Characters with roots", text: "Early character work includes Aras, part of the developing identity of MYTH: TANAH." },
      { title: "Stories in the land", text: "Environmental storytelling connects the world’s landscapes, encounters, and imagination." },
    ],
    roadmap: [
      { title: "Imagine the world", text: "Explore the mythology, landscapes, and visual language that give MYTH: TANAH its own identity.", image: "/night-walk/assets/projects/myth-tanah-wallpaper.png", alt: "Mythical tiger and flooded settlement in MYTH: TANAH concept artwork", position: "50% 37%" },
      { title: "Shape the journey", text: "Develop characters such as Aras and explore how worldbuilding, encounters, and environmental stories connect through play.", image: "/night-walk/assets/myth-tanah.webp", alt: "Early character concept for MYTH: TANAH", position: "72% center" },
      { title: "Bring the world to life", text: "Build and refine playable experiences, sharing future glimpses of the world as development progresses.", image: "/night-walk/assets/projects/myth-tanah-wallpaper.png", alt: "Aras facing a mythical tiger in the mist", position: "50% 65%" },
    ],
  },
};
