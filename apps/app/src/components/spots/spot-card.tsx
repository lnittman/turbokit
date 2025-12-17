"use client";

import { Bookmark, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { InterestTile } from "@/components/spots/interest-tile";
import { enhanceInterest } from "@/lib/interest-utils";
import type { Spot } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SpotCardProps {
  spot: Spot;
  className?: string;
  variant?: "default" | "compact" | "horizontal";
  onClick?: () => void;
  onSave?: () => void;
  saved?: boolean;
  tooltip?: string;
}

export function SpotCard({
  spot,
  className,
  variant = "default",
  onClick,
  onSave,
  saved = false,
  tooltip,
}: SpotCardProps) {
  // Price range display
  const priceDisplay = Array(spot.priceRange).fill("$").join("");

  // Rating display
  const rating = spot.rating.toFixed(1);

  // Check if the spot has an image
  const hasImage = !!spot.imageUrl;

  // Badge components
  const PopularBadge = () => (
    <div className="absolute top-2 left-2 rounded-full bg-yellow-500 px-2 py-0.5 font-medium text-black text-xs">
      Popular
    </div>
  );

  const VerifiedBadge = () => (
    <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-blue-500 px-2 py-0.5 font-medium text-white text-xs">
      <span className="h-3 w-3">✓</span> Verified
    </div>
  );

  // Render the card based on the variant
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "group relative cursor-pointer overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md",
          className
        )}
        onClick={onClick}
      >
        <div className="relative aspect-square bg-muted">
          {spot.imageUrl ? (
            <img
              alt={spot.name}
              className="h-full w-full object-cover"
              src={spot.imageUrl}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-3xl">
              {spot.emoji || "📍"}
            </div>
          )}

          {spot.popular && <PopularBadge />}
          {spot.verified && <VerifiedBadge />}
        </div>

        <div className="space-y-1 p-3">
          <h3 className="line-clamp-1 font-medium text-sm transition-colors group-hover:text-primary">
            {spot.name}
          </h3>

          {/* Tooltip for recommendation context */}
          {tooltip && (
            <p className="text-muted-foreground text-xs italic">{tooltip}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              <span className="text-xs">{rating}</span>
            </div>
            <span className="text-muted-foreground text-xs">
              {priceDisplay}
            </span>
          </div>
        </div>

        {onSave && (
          <button
            aria-label={saved ? "Unsave spot" : "Save spot"}
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
          >
            <Bookmark
              className={cn(
                "h-4 w-4",
                saved ? "fill-primary text-primary" : "text-muted-foreground"
              )}
            />
          </button>
        )}
      </div>
    );
  }

  if (variant === "horizontal") {
    return (
      <div
        className={cn(
          "group relative flex cursor-pointer overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md",
          className
        )}
        onClick={onClick}
      >
        <div className="relative h-24 w-24 flex-shrink-0 bg-muted sm:h-32 sm:w-32">
          {spot.imageUrl ? (
            <img
              alt={spot.name}
              className="h-full w-full object-cover"
              src={spot.imageUrl}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-3xl">
              {spot.emoji || "📍"}
            </div>
          )}

          {spot.popular && <PopularBadge />}
        </div>

        <div className="flex-1 p-3">
          <h3 className="font-medium text-sm transition-colors group-hover:text-primary sm:text-base">
            {spot.name}
          </h3>

          {/* Tooltip for recommendation context */}
          {tooltip && (
            <p className="mt-1 text-muted-foreground text-xs italic">
              {tooltip}
            </p>
          )}

          <div className="mt-1 flex items-center text-muted-foreground text-xs">
            <MapPin className="mr-1 h-3 w-3" />
            <span className="line-clamp-1">{spot.neighborhood}</span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              <span className="text-xs">{rating}</span>
            </div>
            <span className="text-xs">{priceDisplay}</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {spot.interests.slice(0, 2).map((interest, i) => (
              <span
                className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px]"
                key={i}
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {onSave && (
          <button
            aria-label={saved ? "Unsave spot" : "Save spot"}
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
          >
            <Bookmark
              className={cn(
                "h-4 w-4",
                saved ? "fill-primary text-primary" : "text-muted-foreground"
              )}
            />
          </button>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        "group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      <div className="relative aspect-video bg-muted">
        {spot.imageUrl ? (
          <img
            alt={spot.name}
            className="h-full w-full object-cover"
            src={spot.imageUrl}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-5xl">
            {spot.emoji || "📍"}
          </div>
        )}

        {spot.popular && <PopularBadge />}
        {spot.verified && <VerifiedBadge />}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-medium text-base transition-colors group-hover:text-primary">
          {spot.name}
        </h3>

        {/* Tooltip for recommendation context */}
        {tooltip && (
          <p className="mt-1 text-muted-foreground text-xs italic">{tooltip}</p>
        )}

        <div className="mt-1 flex items-center text-muted-foreground text-sm">
          <MapPin className="mr-1 h-3 w-3" />
          <span className="line-clamp-1">{spot.neighborhood}</span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span className="font-medium">{rating}</span>
            <span className="text-muted-foreground text-xs">
              ({spot.reviewCount})
            </span>
          </div>
          <div>
            <span className="font-medium">{priceDisplay}</span>
            <span className="ml-1 text-muted-foreground text-xs">
              {spot.type}
            </span>
          </div>
        </div>

        <div className="mt-3 mb-1 flex flex-wrap gap-1">
          {spot.interests.map((interest, i) => (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs" key={i}>
              {interest}
            </span>
          ))}
        </div>
      </div>

      {onSave && (
        <button
          aria-label={saved ? "Unsave spot" : "Save spot"}
          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
        >
          <Bookmark
            className={cn(
              "h-5 w-5",
              saved ? "fill-primary text-primary" : "text-muted-foreground"
            )}
          />
        </button>
      )}
    </div>
  );
}
