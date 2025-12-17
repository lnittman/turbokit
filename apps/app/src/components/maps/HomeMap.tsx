"use client";

import { Badge } from "@spots/design/components/ui/badge";
import { Button } from "@spots/design/components/ui/button";
import { Card, CardContent } from "@spots/design/components/ui/card";
import React, { useEffect, useRef, useState } from "react";
import {
  LocationDropdown,
  type LocationItem,
} from "@/components/LocationDropdown";
import { MapView } from "@/components/maps/EnhancedMapView";
import { defaultCities } from "@/lib/data/cities-data";

// Convert city data to location items
const sampleLocations: LocationItem[] = defaultCities.map((city) => ({
  id: city.id,
  title: city.name,
  coordinates: city.coordinates,
  emoji: city.emoji,
  trending: city.trending,
  type: city.type,
}));

// Sample interests for demo
const sampleInterests = [
  { id: "1", name: "Coffee", emoji: "☕", color: "#4ECDC4", trending: true },
  { id: "2", name: "Hiking", emoji: "🥾", color: "#AAC789", trending: true },
  { id: "3", name: "Art", emoji: "🎨", color: "#FFD166", trending: false },
  { id: "4", name: "Food", emoji: "🍜", color: "#FF6B6B", trending: true },
  { id: "5", name: "Music", emoji: "🎵", color: "#4ECDC4", trending: false },
  { id: "6", name: "Books", emoji: "📚", color: "#AAC789", trending: false },
  { id: "7", name: "Shopping", emoji: "🛍️", color: "#FFD166", trending: true },
  { id: "8", name: "Nature", emoji: "🌳", color: "#AAC789", trending: false },
];

// Sample recommendations data
const sampleRecommendations: Record<string, any[]> = {
  "coffee-la": [
    {
      id: "cl1",
      name: "Intelligentsia Coffee",
      description:
        "Upscale coffeehouse chain known for direct-trade beans & creative drinks.",
      type: "cafe",
      address: "3922 Sunset Blvd, Los Angeles",
      tags: ["Coffee", "Hip", "Pour Over"],
      checkIns: 152,
    },
    {
      id: "cl2",
      name: "Blue Bottle Coffee",
      description:
        "Trendy cafe serving specialty coffee in a minimalist space.",
      type: "cafe",
      address: "8301 Beverly Blvd, Los Angeles",
      tags: ["Coffee", "Pastries", "Minimalist"],
      checkIns: 86,
    },
  ],
  "coffee-sf": [
    {
      id: "c1",
      name: "Ritual Coffee Roasters",
      description:
        "Specialty coffee shop with single-origin beans and minimalist decor.",
      type: "cafe",
      address: "1026 Valencia St, San Francisco",
      tags: ["Coffee", "Wifi", "Pastries"],
      checkIns: 128,
    },
    {
      id: "c2",
      name: "Sightglass Coffee",
      description:
        "Industrial-chic coffee bar with house-roasted beans and light bites.",
      type: "cafe",
      address: "270 7th St, San Francisco",
      tags: ["Coffee", "Roastery", "Avocado Toast"],
      checkIns: 97,
    },
  ],
};

// Interface for HomeMap props
interface HomeMapProps {
  selectedLocation?: LocationItem;
  onChange?: (location: LocationItem) => void;
}

export function HomeMap({ selectedLocation, onChange }: HomeMapProps) {
  const [localSelectedLocation, setLocalSelectedLocation] = useState(
    sampleLocations[0]
  );
  const effectiveLocation = selectedLocation || localSelectedLocation;

  const handleLocationChange = (location: LocationItem) => {
    if (onChange) {
      onChange(location);
    } else {
      setLocalSelectedLocation(location);
    }
    console.log(
      "HomeMap: Location changed to:",
      location.title,
      location.emoji
    );
  };

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredInterest, setHoveredInterest] = useState<string | null>(null);
  const interestsContainerRef = useRef<HTMLDivElement>(null);

  // Function to toggle interest selection
  const toggleInterest = (interestId: string) => {
    setIsLoading(true);

    if (selectedInterests.includes(interestId)) {
      setSelectedInterests(selectedInterests.filter((id) => id !== interestId));
    } else {
      setSelectedInterests([...selectedInterests, interestId]);
    }

    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  // Update recommendations based on selected location and interests
  useEffect(() => {
    if (effectiveLocation && selectedInterests.length > 0) {
      setIsLoading(true);

      setTimeout(() => {
        const spots = discoverSpots(selectedInterests, effectiveLocation.title);
        setRecommendations(spots);
        setIsLoading(false);
      }, 600);
    } else {
      setRecommendations([]);
    }
  }, [effectiveLocation, selectedInterests]);

  // Simple discovery function
  const discoverSpots = (interests: string[], location: string) => {
    const locationKey = location.toLowerCase().replace(" ", "");
    const results: any[] = [];

    interests.forEach((interestId) => {
      const interest = sampleInterests.find((i) => i.id === interestId);
      if (!interest) return;

      const interestKey = interest.name.toLowerCase();
      const lookupKey = `${interestKey}-${locationKey}`;

      if (sampleRecommendations[lookupKey]) {
        results.push(...sampleRecommendations[lookupKey]);
      }
    });

    return results.sort((a, b) => b.checkIns - a.checkIns);
  };

  const getInterestButtonStyle = (
    interest: (typeof sampleInterests)[0],
    isSelected: boolean,
    isHovered: boolean
  ) => {
    const color = interest.color;

    if (isSelected) {
      return {
        variant: "default" as const,
        className: `border-[${color}]/30 text-white shadow-md`,
      };
    }
    if (isHovered) {
      return {
        variant: "outline" as const,
        className: `border-[${color}]/30 bg-white/5 hover:bg-white/10 text-white/90 shadow-sm`,
      };
    }
    return {
      variant: "outline" as const,
      className:
        "border-white/10 hover:bg-white/5 text-white/80 transition-all duration-300",
    };
  };

  const getTagStyle = (tag: string) => {
    const tagColors: { [key: string]: string } = {
      Coffee: "bg-[#4ECDC4]/10 text-[#4ECDC4]/80 border-[#4ECDC4]/20",
      Hiking: "bg-[#AAC789]/10 text-[#AAC789]/80 border-[#AAC789]/20",
      Art: "bg-[#FFD166]/10 text-[#FFD166]/80 border-[#FFD166]/20",
      Food: "bg-[#FF6B6B]/10 text-[#FF6B6B]/80 border-[#FF6B6B]/20",
      Nature: "bg-[#AAC789]/10 text-[#AAC789]/80 border-[#AAC789]/20",
      Views: "bg-[#4ECDC4]/10 text-[#4ECDC4]/80 border-[#4ECDC4]/20",
    };

    const colorKey =
      Object.keys(tagColors).find((key) =>
        tag.toLowerCase().includes(key.toLowerCase())
      ) || "Coffee";

    return tagColors[colorKey] || "bg-white/5 text-white/70 border-white/10";
  };

  return (
    <div className="flex flex-col">
      {/* Horizontal Interest Picker with Scroll */}
      <div className="mb-4 w-full">
        <h3 className="mb-2 font-medium text-sm text-white/50">
          Select your interests
        </h3>
        <div className="relative px-4">
          <div
            className="hide-scrollbar mx-[-1rem] flex gap-2 overflow-x-auto px-[1rem] pb-2"
            ref={interestsContainerRef}
          >
            {sampleInterests.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
              const isHovered = hoveredInterest === interest.id;
              const buttonStyle = getInterestButtonStyle(
                interest,
                isSelected,
                isHovered
              );

              return (
                <Button
                  className={`flex min-w-fit flex-shrink-0 items-center gap-1.5 ${buttonStyle.className}transition-all duration-300 ease-in-out`}
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  onMouseEnter={() => setHoveredInterest(interest.id)}
                  onMouseLeave={() => setHoveredInterest(null)}
                  size="sm"
                  style={{
                    borderColor:
                      isSelected || isHovered
                        ? interest.color + "40"
                        : undefined,
                    backgroundColor: isSelected
                      ? interest.color + "40"
                      : isHovered
                        ? "rgba(255,255,255,0.05)"
                        : undefined,
                  }}
                  variant={buttonStyle.variant}
                >
                  <span className="text-lg">{interest.emoji}</span>
                  <span>{interest.name}</span>
                  {interest.trending && (
                    <span className="ml-1 rounded-full bg-white/10 px-1 py-0.5 text-xs">
                      ↑
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
          <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-[#050A14] to-transparent" />
          <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-[#050A14] to-transparent" />
        </div>
      </div>

      {/* Map with Location Dropdown */}
      <div className="relative">
        <LocationDropdown
          className="absolute top-12 left-3 z-10 w-64 shadow-lg"
          locations={sampleLocations}
          onChange={handleLocationChange}
          selectedLocation={effectiveLocation}
        />

        <MapView
          center={effectiveLocation.coordinates}
          className="h-[350px] w-full rounded-md border border-white/5 shadow-md md:h-[400px]"
          markers={sampleLocations.map((loc) => ({
            id: loc.id,
            name: loc.title,
            coordinates: loc.coordinates,
            description: loc.type,
            category: loc.type,
          }))}
          onMarkerClick={(id) => {
            const location = sampleLocations.find((loc) => loc.id === id);
            if (location) {
              handleLocationChange(location);
            }
          }}
          zoom={11}
        />
      </div>

      {/* Recommendations Section */}
      {!isLoading && recommendations.length > 0 && (
        <div className="mt-6">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-semibold text-lg">
              Recommended in {effectiveLocation.title}
            </h3>
            <Badge className="bg-[#4ECDC4]/20 text-[#4ECDC4]/90 hover:bg-[#4ECDC4]/30">
              {sampleInterests.find((i) => i.id === selectedInterests[0])?.name}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {recommendations.map((rec) => (
              <Card
                className="border border-white/5 bg-white/3 backdrop-blur-sm transition-all duration-200 hover:bg-white/5"
                key={rec.id}
              >
                <CardContent className="p-4">
                  <div className="mb-1 flex items-start justify-between">
                    <h3 className="font-bold text-lg">{rec.name}</h3>
                    <Badge
                      className="bg-white/10 text-white/80"
                      variant="outline"
                    >
                      {rec.checkIns} visits
                    </Badge>
                  </div>
                  <p className="mb-2 text-sm text-white/60">{rec.address}</p>
                  <p className="mb-3 text-sm">{rec.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {rec.tags.map((tag: string) => (
                      <Badge
                        className={`${getTagStyle(tag)} transition-all duration-200 hover:opacity-90`}
                        key={tag}
                        variant="outline"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
