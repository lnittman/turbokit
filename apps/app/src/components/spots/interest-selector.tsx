"use client";

import { Badge } from "@spots/design/components/ui/badge";
import { Button } from "@spots/design/components/ui/button";
import { CheckCircle, MapPin, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Interest } from "@/lib/types";
import { cn } from "@/lib/utils";

const defaultInterests: Interest[] = [
  {
    id: "coffee",
    name: "Coffee",
    emoji: "☕",
    category: "food",
    color: "#4ECDC4",
  },
  { id: "food", name: "Food", emoji: "🍽️", category: "food", color: "#FF6B6B" },
  {
    id: "shopping",
    name: "Shopping",
    emoji: "🛍️",
    category: "shopping",
    color: "#FFD166",
  },
  {
    id: "history",
    name: "History",
    emoji: "🏛️",
    category: "arts",
    color: "#AAC789",
  },
  { id: "art", name: "Art", emoji: "🎨", category: "arts", color: "#FFD166" },
  {
    id: "music",
    name: "Music",
    emoji: "🎵",
    category: "entertainment",
    color: "#FF6B6B",
  },
  {
    id: "gardens",
    name: "Gardens",
    emoji: "🌷",
    category: "outdoors",
    color: "#FF6B6B",
  },
  {
    id: "picnics",
    name: "Picnics",
    emoji: "🧺",
    category: "outdoors",
    color: "#AAC789",
  },
  {
    id: "cycling",
    name: "Cycling",
    emoji: "🚲",
    category: "activities",
    color: "#4ECDC4",
  },
  {
    id: "brunch",
    name: "Brunch",
    emoji: "🥓",
    category: "food",
    color: "#FFD166",
  },
  {
    id: "tech",
    name: "Tech",
    emoji: "💻",
    category: "technology",
    color: "#4ECDC4",
  },
  {
    id: "sourdough",
    name: "Sourdough",
    emoji: "🍞",
    category: "food",
    color: "#FFD166",
  },
  {
    id: "golden_gate",
    name: "Golden Gate",
    emoji: "🌉",
    category: "culture",
    color: "#FF6B6B",
  },
  {
    id: "fog_chasing",
    name: "Fog Chasing",
    emoji: "🌫️",
    category: "outdoors",
    color: "#4ECDC4",
  },
  {
    id: "hiking",
    name: "Hiking",
    emoji: "🥾",
    category: "outdoors",
    color: "#AAC789",
  },
  {
    id: "photography",
    name: "Photography",
    emoji: "📷",
    category: "arts",
    color: "#4ECDC4",
  },
  {
    id: "reading",
    name: "Reading",
    emoji: "📚",
    category: "education",
    color: "#4ECDC4",
  },
  {
    id: "sports",
    name: "Sports",
    emoji: "⚽",
    category: "activities",
    color: "#4ECDC4",
  },
  {
    id: "nature",
    name: "Nature",
    emoji: "🌿",
    category: "outdoors",
    color: "#AAC789",
  },
  {
    id: "farmers_markets",
    name: "Farmers Markets",
    emoji: "🌽",
    category: "food",
    color: "#AAC789",
  },
  {
    id: "wine_tasting",
    name: "Wine Tasting",
    emoji: "🍷",
    category: "drink",
    color: "#FF6B6B",
  },
  {
    id: "craft_beer",
    name: "Craft Beer",
    emoji: "🍺",
    category: "drink",
    color: "#FFD166",
  },
  {
    id: "tacos",
    name: "Tacos",
    emoji: "🌮",
    category: "food",
    color: "#FF6B6B",
  },
  {
    id: "dim_sum",
    name: "Dim Sum",
    emoji: "🥟",
    category: "food",
    color: "#FF6B6B",
  },
  {
    id: "burritos",
    name: "Burritos",
    emoji: "🌯",
    category: "food",
    color: "#FF6B6B",
  },
  {
    id: "beach",
    name: "Beach",
    emoji: "🏖️",
    category: "outdoors",
    color: "#4ECDC4",
  },
  {
    id: "architecture",
    name: "Architecture",
    emoji: "🏛️",
    category: "arts",
    color: "#AAC789",
  },
  {
    id: "surfing",
    name: "Surfing",
    emoji: "🏄",
    category: "activities",
    color: "#4ECDC4",
  },
  {
    id: "climbing",
    name: "Climbing",
    emoji: "🧗",
    category: "activities",
    color: "#AAC789",
  },
  {
    id: "yoga",
    name: "Yoga",
    emoji: "🧘",
    category: "wellness",
    color: "#AAC789",
  },
  {
    id: "mindfulness",
    name: "Mindfulness",
    emoji: "🧠",
    category: "wellness",
    color: "#4ECDC4",
  },
  {
    id: "bookstores",
    name: "Bookstores",
    emoji: "📚",
    category: "education",
    color: "#FFD166",
  },
  {
    id: "vintage",
    name: "Vintage",
    emoji: "👒",
    category: "shopping",
    color: "#FFD166",
  },
  {
    id: "biking",
    name: "Biking",
    emoji: "🚴",
    category: "activities",
    color: "#4ECDC4",
  },
  {
    id: "cocktails",
    name: "Cocktails",
    emoji: "🍸",
    category: "drink",
    color: "#FF6B6B",
  },
  {
    id: "museums",
    name: "Museums",
    emoji: "🏛️",
    category: "arts",
    color: "#AAC789",
  },
  {
    id: "parks",
    name: "Parks",
    emoji: "🌳",
    category: "outdoors",
    color: "#AAC789",
  },
  { id: "tea", name: "Tea", emoji: "🍵", category: "drink", color: "#4ECDC4" },
  {
    id: "seafood",
    name: "Seafood",
    emoji: "🦞",
    category: "food",
    color: "#FF6B6B",
  },
  {
    id: "bakeries",
    name: "Bakeries",
    emoji: "🥐",
    category: "food",
    color: "#FFD166",
  },
  {
    id: "ice_cream",
    name: "Ice Cream",
    emoji: "🍦",
    category: "food",
    color: "#FFD166",
  },
  {
    id: "coit_tower",
    name: "Coit Tower",
    emoji: "🗼",
    category: "culture",
    color: "#AAC789",
  },
  {
    id: "alcatraz",
    name: "Alcatraz",
    emoji: "🏝️",
    category: "culture",
    color: "#AAC789",
  },
  {
    id: "chinatown",
    name: "Chinatown",
    emoji: "🏮",
    category: "culture",
    color: "#FF6B6B",
  },
  {
    id: "lgbtq",
    name: "LGBTQ",
    emoji: "🏳️‍🌈",
    category: "culture",
    color: "#FF6B6B",
  },
  {
    id: "street_art",
    name: "Street Art",
    emoji: "🎨",
    category: "arts",
    color: "#FFD166",
  },
  {
    id: "napa",
    name: "Napa",
    emoji: "🍇",
    category: "drink",
    color: "#AAC789",
  },
  {
    id: "running",
    name: "Running",
    emoji: "🏃",
    category: "activities",
    color: "#4ECDC4",
  },
  {
    id: "waterfront",
    name: "Waterfront",
    emoji: "⚓",
    category: "outdoors",
    color: "#4ECDC4",
  },
];

export interface InterestSelectorProps {
  interests?: Interest[];
  selectedInterests?: string[];
  onInterestChange?: (selectedIds: string[]) => void;
  maxSelections?: number;
  disabled?: boolean;
  className?: string;
  showCategories?: boolean;
  location?: string;
}

export function InterestSelector({
  interests: initialInterests = defaultInterests,
  selectedInterests = [],
  onInterestChange,
  maxSelections = 5,
  disabled = false,
  className,
  showCategories = false,
  location = "San Francisco",
}: InterestSelectorProps) {
  const [selected, setSelected] = useState<string[]>(selectedInterests);
  const [animatingItems, setAnimatingItems] = useState<{
    [key: string]: boolean;
  }>({});
  const [interests, setInterests] = useState<Interest[]>(initialInterests);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const interestsContainerRef = useRef<HTMLDivElement>(null);

  // On mount, fetch personalized interests based on location (TODO: use Convex)
  useEffect(() => {
    // For now, just shuffle the default interests
    const shuffled = [...initialInterests].sort(() => Math.random() - 0.5);
    setInterests(shuffled);
  }, [location, initialInterests]);

  useEffect(() => {
    // Update if selectedInterests prop changes
    if (
      selectedInterests.length !== selected.length ||
      !selectedInterests.every((id) => selected.includes(id))
    ) {
      setSelected(selectedInterests);
    }
  }, [selectedInterests]);

  const toggleInterest = (id: string) => {
    if (disabled) return;

    const isSelected = selected.includes(id);

    // Start animation
    setAnimatingItems({ ...animatingItems, [id]: true });

    // Reset animation state after animation completes
    setTimeout(() => {
      setAnimatingItems((prev) => ({ ...prev, [id]: false }));
    }, 300);

    if (isSelected) {
      // Remove interest if already selected
      const newSelected = selected.filter((interestId) => interestId !== id);
      setSelected(newSelected);
      onInterestChange?.(newSelected);
    } else {
      // Add interest if not at max selections
      if (selected.length < maxSelections) {
        const newSelected = [...selected, id];
        setSelected(newSelected);
        onInterestChange?.(newSelected);
      }
    }
  };

  // Refresh the interests with a new set (TODO: use Convex action for LLM generation)
  const refreshInterests = async () => {
    setIsLoading(true);
    // For now, just shuffle
    const shuffled = [...interests].sort(() => Math.random() - 0.5);
    setInterests(shuffled);
    setIsLoading(false);
  };

  // Render a flowing grid of interests with uniform height
  const renderFlowGrid = () => {
    // Show loading skeleton
    if (isLoading && interests.length === 0) {
      return (
        <div className="flex max-h-[400px] flex-wrap gap-2 overflow-y-auto p-1 sm:gap-3">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              className="h-14 w-32 animate-pulse rounded-lg bg-muted/40"
              key={index}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent flex max-h-[400px] flex-wrap gap-2 overflow-y-auto p-1 pr-2 sm:gap-3">
        {interests.map((interest) => {
          const isSelected = selected.includes(interest.id);
          const isAnimating = animatingItems[interest.id];

          return (
            <button
              className={cn(
                "group relative flex select-none items-center rounded-full px-3 py-2 transition-colors",
                "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                selected.includes(interest.id)
                  ? "border-primary bg-primary/10"
                  : "border-transparent bg-accent/30",
                "animate-fade-in border font-medium text-sm",
                className
              )}
              disabled={disabled || isLoading}
              key={interest.id}
              onClick={() => toggleInterest(interest.id)}
              style={{
                backgroundColor: selected.includes(interest.id)
                  ? `${interest.color}20`
                  : undefined,
                borderColor: selected.includes(interest.id)
                  ? interest.color
                  : undefined,
                transitionProperty: "border-color, background-color",
                transitionDuration: "300ms",
                minHeight: "36px", // Ensure consistent height
                minWidth: "fit-content", // Ensure width is based on content
                width: "auto", // Allow natural width
              }}
            >
              <div className="flex min-w-0 items-center">
                {interest.emoji && (
                  <span
                    className="mr-1.5 text-base"
                    style={{ minWidth: "1.25rem" }}
                  >
                    {interest.emoji}
                  </span>
                )}
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {interest.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground text-sm">
            Select up to {maxSelections} interests
          </p>

          <Badge className="text-xs" variant="outline">
            {selected.length}/{maxSelections}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {location && (
            <div className="flex items-center text-muted-foreground text-xs">
              <MapPin className="mr-1 h-3 w-3" />
              {location}
            </div>
          )}

          <Button
            className="h-8 w-8 p-0"
            disabled={isLoading}
            onClick={refreshInterests}
            size="sm"
            variant="ghost"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            <span className="sr-only">Refresh interests</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-amber-500 text-sm dark:text-amber-400">
          {error}
        </div>
      )}

      {renderFlowGrid()}

      {selected.length === maxSelections && (
        <p className="mt-2 text-amber-500 text-sm dark:text-amber-400">
          Maximum selections reached. Remove some to select others.
        </p>
      )}
    </div>
  );
}
