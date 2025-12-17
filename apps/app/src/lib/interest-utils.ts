/**
 * Utility functions for handling interests in the application
 */

// Map interest names to emoji icons
const interestEmojiMap: Record<string, string> = {
  // Food and Drink
  coffee: "☕",
  food: "🍽️",
  dining: "🍴",
  restaurants: "🍽️",
  brunch: "🥓",
  breakfast: "🍳",
  lunch: "🥪",
  dinner: "🍲",
  sourdough: "🍞",
  tacos: "🌮",
  burritos: "🌯",
  dimsum: "🥟",
  seafood: "🦞",
  bakeries: "🥐",
  icecream: "🍦",
  wine: "🍷",
  beer: "🍺",
  cocktails: "🍸",
  tea: "🍵",

  // Activities
  shopping: "🛍️",
  hiking: "🥾",
  reading: "📚",
  cycling: "🚲",
  biking: "🚴",
  sports: "⚽",
  surfing: "🏄",
  climbing: "🧗",
  yoga: "🧘",
  running: "🏃",
  swimming: "🏊",

  // Arts and Culture
  history: "🏛️",
  art: "🎨",
  music: "🎵",
  photography: "📷",
  museums: "🏛️",
  architecture: "🏛️",
  culture: "🎭",
  theater: "🎭",
  cinema: "🎬",

  // Nature and Outdoors
  nature: "🌿",
  beach: "🏖️",
  parks: "🌳",
  gardens: "🌷",
  picnics: "🧺",

  // Interests and Hobbies
  tech: "💻",
  science: "🔬",
  technology: "💻",
  gaming: "🎮",
  books: "📚",
  crafts: "🧶",
  diy: "🔨",

  // Locations
  goldengatebridge: "🌉",
  goldengate: "🌉",
  coittower: "🗼",
  alcatraz: "🏝️",
  chinatown: "🏮",
  farmersmarkets: "🌽",
  waterfront: "⚓",

  // Other
  lgbtq: "🏳️‍🌈",
  mindfulness: "🧠",
  vintage: "👒",
  fogchasing: "🌫️",
};

// Default colors for interest categories
const categoryColors: Record<string, string> = {
  food: "#FF6B6B",
  drink: "#FF6B6B",
  outdoors: "#AAC789",
  activities: "#4ECDC4",
  arts: "#FFD166",
  culture: "#FFD166",
  shopping: "#FFD166",
  technology: "#4ECDC4",
  entertainment: "#FF6B6B",
  wellness: "#AAC789",
  education: "#4ECDC4",
  nightlife: "#FF6B6B",
  default: "#4ECDC4",
};

/**
 * Get an emoji for an interest name
 * @param interest Interest name
 * @returns Emoji character
 */
export function getEmojiForInterest(interest: string): string {
  // Normalize the interest name (lowercase, remove spaces)
  const normalized = interest.toLowerCase().replace(/\s+/g, "");

  // Return the emoji if found, or a default
  return interestEmojiMap[normalized] || "🔍";
}

/**
 * Get the category for an interest
 * @param interest Interest name
 * @returns Category name
 */
export function getCategoryForInterest(interest: string): string {
  const normalized = interest.toLowerCase();

  if (
    /coffee|food|restaurant|breakfast|lunch|dinner|brunch|taco|burrito|dim sum|bakery|ice cream|seafood/.test(
      normalized
    )
  ) {
    return "food";
  }

  if (/wine|beer|cocktail|bar|pub|drink|tea/.test(normalized)) {
    return "drink";
  }

  if (
    /hiking|biking|cycling|running|swimming|beach|park|garden|outdoor|nature|picnic/.test(
      normalized
    )
  ) {
    return "outdoors";
  }

  if (
    /museum|gallery|art|history|culture|architecture|exhibits/.test(normalized)
  ) {
    return "arts";
  }

  if (/concert|music|theater|cinema|festival|performance/.test(normalized)) {
    return "entertainment";
  }

  if (/yoga|meditation|mindfulness|wellness|fitness|health/.test(normalized)) {
    return "wellness";
  }

  if (/shopping|market|store|boutique|vintage|thrift/.test(normalized)) {
    return "shopping";
  }

  if (/tech|technology|science|innovation|startup/.test(normalized)) {
    return "technology";
  }

  if (
    /education|learning|workshop|class|lecture|book|reading/.test(normalized)
  ) {
    return "education";
  }

  if (/nightlife|club|party|bar/.test(normalized)) {
    return "nightlife";
  }

  return "default";
}

/**
 * Get a color for an interest based on its category
 * @param interest Interest name
 * @returns Hex color code
 */
export function getColorForInterest(interest: string): string {
  const category = getCategoryForInterest(interest);
  return categoryColors[category] || categoryColors.default;
}

/**
 * Enhance an interest with emoji and color if missing
 * @param interest Interest object or name
 * @returns Enhanced interest object
 */
export function enhanceInterest(
  interest:
    | string
    | { id: string; name: string; emoji?: string; color?: string }
) {
  if (typeof interest === "string") {
    return {
      id: interest.toLowerCase().replace(/\s+/g, "-"),
      name: interest,
      emoji: getEmojiForInterest(interest),
      color: getColorForInterest(interest),
    };
  }

  return {
    ...interest,
    emoji: interest.emoji || getEmojiForInterest(interest.name),
    color: interest.color || getColorForInterest(interest.name),
  };
}
