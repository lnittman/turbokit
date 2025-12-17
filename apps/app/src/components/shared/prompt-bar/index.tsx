"use client";

import { ArrowUp, CircleNotch } from "@phosphor-icons/react";
import { Button } from "@spots/design/components/ui/button";
import { Textarea } from "@spots/design/components/ui/textarea";
import { cn } from "@spots/design/lib/utils";
import { api } from "@spots/backend/api";
import type { Id } from "@spots/backend/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import type React from "react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { SpotCard } from "@/components/spots/spot-card";
import type { Spot } from "@/lib/types";

interface SpotResult {
  _id: string;
  name: string;
  description?: string;
  city: string;
  rating?: number;
  imageUrl?: string;
  relevanceScore: number;
  matchReason: string;
}

interface SearchResponse {
  spots: SpotResult[];
  intent: {
    intent: string;
    location?: string;
    interests: string[];
    keywords: string[];
    reasoning: string;
  };
  totalResults: number;
  searchDuration: number;
}

interface PromptBarProps {
  onResults?: (results: SearchResponse) => void;
}

/**
 * Convert API SpotResult to UI Spot type
 */
function spotResultToSpot(result: SpotResult): Spot {
  return {
    id: result._id,
    name: result.name,
    description: result.description || "",
    type: "location",
    address: "",
    neighborhood: result.city,
    city: result.city,
    coordinates: [0, 0],
    interests: [],
    priceRange: 2,
    rating: result.rating ?? 0,
    reviewCount: 0,
    imageUrl: result.imageUrl,
    tags: [],
    emoji: "📍",
  };
}

export function PromptBar({ onResults }: PromptBarProps): React.ReactElement {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [rows, setRows] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSpots, setSavedSpots] = useState<Set<string>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const search = useAction(api.app.recommendations.actions.searchByNaturalLanguage);
  const toggleFavorite = useMutation(api.app.spots.mutations.toggleFavorite);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Calculate rows based on scroll height
      const lineHeight = 24; // Approximate line height in pixels
      const maxRows = 16;
      const scrollHeight = textareaRef.current.scrollHeight;
      const calculatedRows = Math.min(
        Math.max(1, Math.ceil(scrollHeight / lineHeight)),
        maxRows
      );
      setRows(calculatedRows);
    }
  }, [input]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await search({ query: input.trim() });
      setResults(response);
      onResults?.(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl+Enter or Shift+Enter to submit
    if ((e.metaKey || e.ctrlKey || e.shiftKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSave = async (spotId: string) => {
    try {
      const result = await toggleFavorite({
        spotId: spotId as Id<"spots">,
      });
      setSavedSpots((prev) => {
        const next = new Set(prev);
        if (result.favorited) {
          next.add(spotId);
        } else {
          next.delete(spotId);
        }
        return next;
      });
    } catch (err) {
      console.error("[SAVE] Failed to toggle favorite:", err);
    }
  };

  const canSubmit = input.trim().length > 0 && !isLoading;

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Input Area */}
      <div
        className={cn(
          "relative z-50 flex w-full flex-col justify-between rounded-sm border bg-muted/40 transition-colors",
          isFocused ? "border-primary/10" : "border-border/50 hover:border-border"
        )}
      >
        <div className="flex items-center gap-2 p-3">
          <Textarea
            className={cn(
              "!border-0 !ring-0 !shadow-none bg-transparent px-0 py-0",
              "max-h-[384px] min-h-[24px] resize-none",
              "placeholder:text-muted-foreground/60",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "leading-6"
            )}
            disabled={isLoading}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="What would you like to find? Try 'coffee shops in Austin' or 'best hiking trails'"
            ref={textareaRef}
            rows={rows}
            style={{
              height: "auto",
              overflow: rows >= 16 ? "auto" : "hidden",
            }}
            value={input}
          />

          <Button
            className={cn(
              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm transition-colors",
              canSubmit
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "cursor-not-allowed bg-muted text-muted-foreground opacity-50"
            )}
            disabled={!canSubmit}
            onClick={handleSubmit}
            size="icon"
          >
            {isLoading ? (
              <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
            ) : (
              <ArrowUp className="h-4 w-4" weight="bold" />
            )}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-sm border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Results */}
      {results && results.spots.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Found {results.totalResults} spots in {results.searchDuration}ms
            </span>
            <button
              className="text-primary hover:underline"
              onClick={() => setResults(null)}
              type="button"
            >
              Clear results
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {results.spots.map((spotResult) => (
              <SpotCard
                key={spotResult._id}
                spot={spotResultToSpot(spotResult)}
                variant="horizontal"
                tooltip={spotResult.matchReason}
                saved={savedSpots.has(spotResult._id)}
                onSave={() => handleSave(spotResult._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {results && results.spots.length === 0 && (
        <div className="rounded-sm border border-dashed p-6 text-center text-sm text-muted-foreground">
          No spots found matching your query. Try different keywords or location.
        </div>
      )}
    </div>
  );
}
