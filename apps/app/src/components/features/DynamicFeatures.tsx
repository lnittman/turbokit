"use client";

import { ChatCircleText, Lightbulb, Star } from "@phosphor-icons/react";
import { Badge } from "@spots/design/components/ui/badge";
import { useEffect, useState } from "react";
import {
  LocationDropdown,
  type LocationItem,
} from "@/components/LocationDropdown";
import { defaultCities, getCityData } from "@/lib/data/cities-data";

// Convert city data to location items
const cityLocations: LocationItem[] = defaultCities.map((city) => ({
  id: city.id,
  title: city.name,
  coordinates: city.coordinates,
  emoji: city.emoji,
  trending: city.trending,
  type: city.type || "city",
}));

// Sample interests for demo
const demoInterests = [
  { id: "coffee", name: "Coffee", emoji: "☕", color: "#4ECDC4" },
  { id: "hiking", name: "Hiking", emoji: "🥾", color: "#AAC789" },
  { id: "art", name: "Art", emoji: "🎨", color: "#FFD166" },
  { id: "food", name: "Food", emoji: "🍜", color: "#FF6B6B" },
  { id: "nature", name: "Nature", emoji: "🌳", color: "#AAC789" },
];

// Interface for DynamicFeatures props
interface DynamicFeaturesProps {
  selectedLocation?: LocationItem;
  onChange?: (location: LocationItem) => void;
}

export function DynamicFeatures({
  selectedLocation,
  onChange,
}: DynamicFeaturesProps) {
  const [localSelectedLocation, setLocalSelectedLocation] = useState(
    cityLocations[0]
  );
  const effectiveLocation = selectedLocation || localSelectedLocation;

  const handleLocationChange = (location: LocationItem) => {
    if (onChange) {
      onChange(location);
    } else {
      setLocalSelectedLocation(location);
    }
  };

  const [personalized, setPersonalized] = useState({
    loading: true,
    content: null as any,
  });
  const [search, setSearch] = useState({ loading: true, content: null as any });
  const [contextual, setContextual] = useState({
    loading: true,
    content: null as any,
  });

  useEffect(() => {
    loadPersonalizedRecommendations();
    loadSearchResults();
    loadContextualSuggestions();
  }, [effectiveLocation]);

  const loadPersonalizedRecommendations = () => {
    setPersonalized({ loading: true, content: null });

    setTimeout(() => {
      const recommendations = generatePersonalizedRecommendations(
        effectiveLocation.title
      );
      setPersonalized({
        loading: false,
        content: (
          <div className="w-full">
            <div className="mb-3 flex flex-wrap gap-2">
              {demoInterests.slice(0, 3).map((interest) => (
                <div
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
                  key={interest.id}
                  style={{
                    backgroundColor: `${interest.color}20`,
                    color: interest.color,
                  }}
                >
                  <span>{interest.emoji}</span> {interest.name}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {recommendations.map((rec: any, index: number) => (
                <div
                  className="flex items-center gap-3 rounded bg-white/5 p-2"
                  key={index}
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[#4ECDC4]/20 text-lg">
                    {rec.emoji}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{rec.name}</div>
                    <div className="text-white/50 text-xs">
                      {rec.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      });
    }, 800);
  };

  const loadSearchResults = () => {
    setSearch({ loading: true, content: null });

    setTimeout(() => {
      const results = generateSearchResults(effectiveLocation.title);
      setSearch({
        loading: false,
        content: (
          <div className="w-full">
            <div className="mb-3 flex rounded-lg bg-white/5 p-2">
              <div className="text-left text-sm text-white/80">
                Find me the best places to visit in {effectiveLocation.title}
              </div>
            </div>
            <div className="space-y-2">
              {results.map((result: any, index: number) => (
                <div
                  className="flex items-center gap-3 rounded bg-white/5 p-2"
                  key={index}
                >
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{result.name}</div>
                    <div className="text-white/50 text-xs">
                      {result.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      });
    }, 1000);
  };

  const loadContextualSuggestions = () => {
    setContextual({ loading: true, content: null });

    setTimeout(() => {
      const suggestions = generateContextualSuggestions(
        effectiveLocation.title
      );
      setContextual({
        loading: false,
        content: (
          <div className="w-full">
            <div className="mb-3 flex items-center justify-between rounded-lg bg-white/5 p-2">
              <div className="text-white/60 text-xs">Saturday, 6:30 PM</div>
              <div className="flex items-center gap-1 text-white/60 text-xs">
                <span>🌤️</span> {getWeatherForLocation(effectiveLocation.title)}
              </div>
            </div>
            <div className="space-y-2">
              {suggestions.map((suggestion: any, index: number) => (
                <div
                  className="flex items-start gap-3 rounded bg-white/5 p-2"
                  key={index}
                >
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[#FF6B6B]/20 text-lg">
                    {suggestion.emoji}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{suggestion.type}</div>
                    <div className="mb-1 text-white/50 text-xs">
                      {suggestion.description}
                    </div>
                    <div className="font-medium text-[#FF6B6B]/80 text-xs">
                      {suggestion.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      });
    }, 1200);
  };

  function generatePersonalizedRecommendations(location: string) {
    const cityRecommendations: Record<string, any[]> = {
      Tokyo: [
        {
          name: "Chatei Hatou",
          description: "Traditional coffee in Shibuya",
          emoji: "☕",
        },
        {
          name: "Mount Takao",
          description: "Popular hiking with temple views",
          emoji: "🥾",
        },
      ],
      "New York": [
        {
          name: "Stumptown Coffee",
          description: "Artisanal coffee roasters",
          emoji: "☕",
        },
        {
          name: "The High Line",
          description: "Elevated linear park",
          emoji: "🌳",
        },
      ],
    };

    return (
      cityRecommendations[location] || [
        {
          name: `${location} Coffee House`,
          description: "Popular local coffee shop",
          emoji: "☕",
        },
        {
          name: `${location} Park Trails`,
          description: "Nature trails nearby",
          emoji: "🥾",
        },
      ]
    );
  }

  function generateSearchResults(location: string) {
    const cityResults: Record<string, any[]> = {
      Tokyo: [
        { name: "Shinjuku Gyoen", description: "Beautiful park with gardens" },
        { name: "Meiji Shrine", description: "Historic shrine in forest" },
      ],
      "New York": [
        { name: "Central Park", description: "Massive urban park" },
        { name: "The Met Museum", description: "World-class art museum" },
      ],
    };

    return (
      cityResults[location] || [
        { name: `${location} Central Park`, description: "Main city park" },
        { name: `${location} Museum`, description: "Main cultural museum" },
      ]
    );
  }

  function generateContextualSuggestions(location: string) {
    const citySuggestions: Record<string, any[]> = {
      Tokyo: [
        {
          type: "Dinner Suggestion",
          emoji: "🍜",
          name: "Ichiran Ramen, Roppongi",
          description: "Perfect for Saturday evening",
        },
      ],
      "New York": [
        {
          type: "Evening Entertainment",
          emoji: "🎭",
          name: "Broadway Shows - Times Square",
          description: "Perfect for evening show",
        },
      ],
    };

    return (
      citySuggestions[location] || [
        {
          type: "Local Experience",
          emoji: "🍽️",
          name: `${location} Downtown`,
          description: "Best for evening dining",
        },
      ]
    );
  }

  function getWeatherForLocation(location: string): string {
    const weatherMap: Record<string, string> = {
      Tokyo: "72°F Clear",
      "New York": "68°F Partly Cloudy",
      London: "64°F Light Rain",
      "San Francisco": "62°F Foggy",
      "Los Angeles": "75°F Sunny",
    };

    return weatherMap[location] || "70°F Clear";
  }

  return (
    <div className="w-full">
      {/* City Selector */}
      <div className="relative z-10 mb-6 flex flex-col items-center justify-center sm:flex-row">
        <div className="mb-2 text-sm text-white/60 sm:mr-3 sm:mb-0">
          Select a city:
        </div>
        <LocationDropdown
          className="w-64"
          locations={cityLocations}
          onChange={handleLocationChange}
          selectedLocation={effectiveLocation}
        />
      </div>

      {/* Feature Cards */}
      <div className="flex w-full flex-col items-stretch justify-center gap-8 py-6 sm:gap-10 sm:py-8 lg:flex-row">
        {/* Personalized Recommendations */}
        <div className="mx-auto flex w-full max-w-sm flex-col items-center rounded-lg border border-white/5 bg-white/3 p-4 text-center transition-all duration-300 hover:bg-white/5 sm:p-6 lg:w-1/3">
          <div className="mb-3 text-[#4ECDC4]/80 sm:mb-4">
            <Star size={48} weight="duotone" />
          </div>
          <h3 className="mb-2 font-bold text-lg sm:text-xl">
            Personalized Recommendations
          </h3>
          <p className="mb-4 text-sm text-white/60 sm:text-base">
            Get place recommendations based on your unique interests and
            preferences.
          </p>

          <div className="mt-2 mb-4 w-full rounded-lg border border-white/10 bg-[#0A121F] p-3">
            {personalized.loading ? (
              <div className="animate-pulse space-y-3">
                <div className="flex gap-2">
                  <div className="h-6 w-16 rounded bg-white/10" />
                  <div className="h-6 w-16 rounded bg-white/10" />
                </div>
                <div className="h-12 rounded bg-white/10" />
                <div className="h-12 rounded bg-white/10" />
              </div>
            ) : (
              personalized.content
            )}
          </div>
        </div>

        {/* Natural Language Search */}
        <div className="mx-auto flex w-full max-w-sm flex-col items-center rounded-lg border border-white/5 bg-white/3 p-4 text-center transition-all duration-300 hover:bg-white/5 sm:p-6 lg:w-1/3">
          <div className="mb-3 text-[#AAC789]/80 sm:mb-4">
            <ChatCircleText size={48} weight="duotone" />
          </div>
          <h3 className="mb-2 font-bold text-lg sm:text-xl">
            Natural Language Search
          </h3>
          <p className="mb-4 text-sm text-white/60 sm:text-base">
            Ask for recommendations in natural language, just like chatting with
            a friend.
          </p>

          <div className="mt-2 mb-4 w-full rounded-lg border border-white/10 bg-[#0A121F] p-3">
            {search.loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-10 rounded bg-white/10" />
                <div className="h-12 rounded bg-white/10" />
                <div className="h-12 rounded bg-white/10" />
              </div>
            ) : (
              search.content
            )}
          </div>
        </div>

        {/* Contextual Awareness */}
        <div className="mx-auto flex w-full max-w-sm flex-col items-center rounded-lg border border-white/5 bg-white/3 p-4 text-center transition-all duration-300 hover:bg-white/5 sm:p-6 lg:w-1/3">
          <div className="mb-3 text-[#FF6B6B]/80 sm:mb-4">
            <Lightbulb size={48} weight="duotone" />
          </div>
          <h3 className="mb-2 font-bold text-lg sm:text-xl">
            Contextual Awareness
          </h3>
          <p className="mb-4 text-sm text-white/60 sm:text-base">
            Get recommendations based on time, weather, and your current
            location.
          </p>

          <div className="mt-2 mb-4 w-full rounded-lg border border-white/10 bg-[#0A121F] p-3">
            {contextual.loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-8 rounded bg-white/10" />
                <div className="h-20 rounded bg-white/10" />
              </div>
            ) : (
              contextual.content
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
