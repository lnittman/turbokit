export interface CityData {
  id: string;
  name: string;
  coordinates: [number, number];
  emoji: string;
  trending: boolean;
  type: string;
  lastUpdated?: Date;
  rank?: number;
  trendingReason?: string;
}

// Default city data with manually assigned emojis
export const defaultCities: CityData[] = [
  {
    id: "la",
    name: "Los Angeles",
    coordinates: [-118.2437, 34.0522],
    emoji: "🌴",
    trending: true,
    type: "city",
  },
  {
    id: "sf",
    name: "San Francisco",
    coordinates: [-122.4194, 37.7749],
    emoji: "🌉",
    trending: true,
    type: "city",
  },
  {
    id: "nyc",
    name: "New York",
    coordinates: [-74.006, 40.7128],
    emoji: "🗽",
    trending: true,
    type: "city",
  },
  {
    id: "chicago",
    name: "Chicago",
    coordinates: [-87.6298, 41.8781],
    emoji: "🌆",
    trending: true,
    type: "city",
  },
  {
    id: "miami",
    name: "Miami",
    coordinates: [-80.1918, 25.7617],
    emoji: "🏖️",
    trending: true,
    type: "city",
  },
  {
    id: "austin",
    name: "Austin",
    coordinates: [-97.7431, 30.2672],
    emoji: "🎸",
    trending: true,
    type: "city",
  },
  {
    id: "detroit",
    name: "Detroit",
    coordinates: [-83.0458, 42.3314],
    emoji: "🚗",
    trending: false,
    type: "city",
  },
  {
    id: "seattle",
    name: "Seattle",
    coordinates: [-122.3321, 47.6062],
    emoji: "☕",
    trending: false,
    type: "city",
  },
  {
    id: "london",
    name: "London",
    coordinates: [-0.1278, 51.5074],
    emoji: "🏛️",
    trending: false,
    type: "city",
  },
  {
    id: "paris",
    name: "Paris",
    coordinates: [2.3522, 48.8566],
    emoji: "🗼",
    trending: false,
    type: "city",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    coordinates: [139.6917, 35.6895],
    emoji: "🏯",
    trending: false,
    type: "city",
  },
  {
    id: "berlin",
    name: "Berlin",
    coordinates: [13.405, 52.52],
    emoji: "🧸",
    trending: false,
    type: "city",
  },
  {
    id: "sydney",
    name: "Sydney",
    coordinates: [151.2093, -33.8688],
    emoji: "🏄",
    trending: false,
    type: "city",
  },
  {
    id: "toronto",
    name: "Toronto",
    coordinates: [-79.3832, 43.6532],
    emoji: "🍁",
    trending: false,
    type: "city",
  },
  {
    id: "barcelona",
    name: "Barcelona",
    coordinates: [2.1734, 41.3851],
    emoji: "⛪",
    trending: false,
    type: "city",
  },
  {
    id: "amsterdam",
    name: "Amsterdam",
    coordinates: [4.9041, 52.3676],
    emoji: "🚲",
    trending: false,
    type: "city",
  },
  {
    id: "rome",
    name: "Rome",
    coordinates: [12.4964, 41.9028],
    emoji: "🏛️",
    trending: false,
    type: "city",
  },
];

// City emoji map
const cityEmojiMap: Record<string, string> = {
  "San Francisco": "🌉",
  "New York": "🗽",
  "Los Angeles": "🌴",
  Chicago: "🌆",
  Seattle: "☕",
  London: "🏛️",
  Paris: "🗼",
  Tokyo: "🏯",
  Berlin: "🧸",
  Sydney: "🏄",
  Toronto: "🍁",
  Barcelona: "⛪",
  Amsterdam: "🚲",
  Rome: "🏛️",
  Miami: "🏖️",
  Austin: "🎸",
  Detroit: "🚗",
  Portland: "🌧️",
  Nashville: "🎵",
  Boston: "🏛️",
  "New Orleans": "🎺",
  Vancouver: "🏔️",
  Dubai: "🏙️",
  Singapore: "🦁",
  "Hong Kong": "🏯",
  "Mexico City": "🌮",
  Montreal: "❄️",
  Madrid: "🥘",
  Copenhagen: "🧜‍♀️",
  Vienna: "🎭",
  Stockholm: "🛥️",
  Dublin: "🍀",
};

// Coordinates for cities
const cityCoordinatesMap: Record<string, [number, number]> = {
  "San Francisco": [-122.4194, 37.7749],
  "New York": [-74.006, 40.7128],
  "Los Angeles": [-118.2437, 34.0522],
  Chicago: [-87.6298, 41.8781],
  Seattle: [-122.3321, 47.6062],
  London: [-0.1278, 51.5074],
  Paris: [2.3522, 48.8566],
  Tokyo: [139.6917, 35.6895],
  Berlin: [13.405, 52.52],
  Sydney: [151.2093, -33.8688],
  Toronto: [-79.3832, 43.6532],
  Barcelona: [2.1734, 41.3851],
  Amsterdam: [4.9041, 52.3676],
  Rome: [12.4964, 41.9028],
  Miami: [-80.1918, 25.7617],
  Austin: [-97.7431, 30.2672],
  Detroit: [-83.0458, 42.3314],
};

/**
 * Get city data with emoji and coordinates
 */
export function getCityData(cityName: string): CityData {
  const id = cityName.toLowerCase().replace(/[^a-z0-9]/g, "-");

  return {
    id,
    name: cityName,
    coordinates: cityCoordinatesMap[cityName] || [0, 0],
    emoji: cityEmojiMap[cityName] || "🏙️",
    trending: false,
    type: "city",
  };
}
