"use client";

import { Badge } from "@spots/design/components/ui/badge";
import { Button } from "@spots/design/components/ui/button";
import { MapPin, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@spots/backend/api";
import type { Interest } from "@/lib/types";
import { enhanceInterest } from "@/lib/interest-utils";
import { cn } from "@/lib/utils";

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
  interests: initialInterests,
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
  const [interests, setInterests] = useState<Interest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const interestsContainerRef = useRef<HTMLDivElement>(null);

  // Fetch interests from Convex
  const dbInterests = useQuery(api.app.interests.queries.list, {});
  const getSuggestions = useAction(api.app.interests.actions.getSuggestions);

  // Initialize interests from database or props
  useEffect(() => {
    if (initialInterests && initialInterests.length > 0) {
      // Use provided interests if available
      setInterests(initialInterests);
    } else if (dbInterests) {
      // Otherwise use database interests, enhanced with emoji/color
      const enhanced = dbInterests.map((i) =>
        enhanceInterest({
          id: i._id,
          name: i.name,
          emoji: i.iconName ?? undefined,
        })
      ) as Interest[];
      setInterests(enhanced);
    }
  }, [dbInterests, initialInterests]);

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

  // Refresh the interests with LLM-generated suggestions
  const refreshInterests = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getSuggestions({
        location,
        currentInterests: selected,
        limit: 30,
      });

      const enhanced = result.interests.map((i) =>
        enhanceInterest({
          id: i.id,
          name: i.name,
        })
      ) as Interest[];

      setInterests(enhanced);
    } catch (err) {
      console.error("[INTERESTS] Failed to refresh:", err);
      setError("Failed to refresh interests. Please try again.");
      // Fall back to shuffling current interests
      const shuffled = [...interests].sort(() => Math.random() - 0.5);
      setInterests(shuffled);
    } finally {
      setIsLoading(false);
    }
  };

  // Render a flowing grid of interests with uniform height
  const renderFlowGrid = () => {
    // Show loading skeleton when fetching initial data or refreshing
    const isLoadingInitial = !dbInterests && !initialInterests;
    if ((isLoading || isLoadingInitial) && interests.length === 0) {
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
