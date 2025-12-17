"use client";

import { Badge } from "@spots/design/components/ui/badge";
import { Button } from "@spots/design/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@spots/design/components/ui/dialog";
import { Input } from "@spots/design/components/ui/input";
import { Label } from "@spots/design/components/ui/label";
import { MapPin, PlusCircle, RefreshCw, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { InterestTile } from "@/components/spots/interest-tile";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { enhanceInterest } from "@/lib/interest-utils";

// Common interests for quick selection
const commonInterests = [
  "Coffee",
  "Food",
  "Shopping",
  "Art",
  "Music",
  "Nature",
  "Tech",
  "Sports",
  "Reading",
  "Nightlife",
  "Wine",
  "Beer",
  "Yoga",
  "Hiking",
  "Museums",
  "Photography",
  "Theater",
  "Dance",
  "Film",
  "History",
];

interface EditInterestsDialogProps {
  userInterests: string[];
  userLocation?: string;
  userFavoriteCities?: string[];
  onSave: (
    interests: string[],
    location: string,
    favoriteCities?: string[]
  ) => Promise<void>;
}

export function EditInterestsDialog({
  userInterests = [],
  userLocation = "San Francisco",
  userFavoriteCities = [],
  onSave,
}: EditInterestsDialogProps) {
  const [open, setOpen] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [location, setLocation] = useState(userLocation);
  const [favoriteCities, setFavoriteCities] = useState<string[]>([]);
  const [newCityInput, setNewCityInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedInterests, setSuggestedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState("");

  // Debounced location search
  const debouncedLocation = useDebounce(location, 500);

  useEffect(() => {
    // Initialize with user's current interests
    setInterests([...userInterests]);
    setFavoriteCities([...userFavoriteCities]);
  }, [userInterests, userFavoriteCities]);

  // Set up suggested interests (TODO: use Convex for LLM-based generation)
  useEffect(() => {
    const filtered = commonInterests.filter(
      (interest) => !interests.includes(interest)
    );
    setSuggestedInterests(filtered.sort(() => Math.random() - 0.5));
  }, [interests]);

  const handleToggleInterest = (interest: string) => {
    setInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest);
      }
      return [...prev, interest];
    });
  };

  const handleSave = async () => {
    try {
      await onSave(interests, location, favoriteCities);
      setOpen(false);
    } catch (error) {
      console.error("Error saving interests:", error);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };

  const handleRefresh = () => {
    // Shuffle suggested interests
    setSuggestedInterests((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  // Handle adding a new favorite city
  const handleAddFavoriteCity = () => {
    if (!newCityInput.trim() || favoriteCities.includes(newCityInput.trim())) {
      return;
    }

    setFavoriteCities([...favoriteCities, newCityInput.trim()]);
    setNewCityInput("");
  };

  // Handle removing a favorite city
  const handleRemoveFavoriteCity = (city: string) => {
    setFavoriteCities(favoriteCities.filter((c) => c !== city));
  };

  // Filter suggested interests by search query
  const filteredSuggestions = searchQuery
    ? suggestedInterests.filter((interest) =>
        interest.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : suggestedInterests;

  // Combine common interests with API suggestions for a complete list
  const allSuggestions = [
    ...new Set([
      ...filteredSuggestions,
      ...commonInterests.filter(
        (interest) =>
          interest.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !interests.includes(interest) &&
          !filteredSuggestions.includes(interest)
      ),
    ]),
  ];

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <span className="hidden" id="edit-interests-dialog" />
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Your Interests</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Location input */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1" htmlFor="location">
              <MapPin className="h-4 w-4" />
              Your Location
            </Label>
            <div className="flex gap-2">
              <Input
                className="flex-1"
                id="location"
                onChange={handleLocationChange}
                placeholder="Enter your location..."
                value={location}
              />
              <Button
                disabled={isLoading}
                onClick={handleRefresh}
                size="icon"
                variant="outline"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
            {loadingLocation && (
              <p className="text-muted-foreground text-xs">
                Updating suggestions for {loadingLocation}...
              </p>
            )}
          </div>

          {/* Favorite Cities Section */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Favorite Cities
            </Label>
            <p className="text-muted-foreground text-xs">
              Add cities you plan to visit or want recommendations for.
            </p>

            <div className="flex gap-2">
              <Input
                className="flex-1"
                onChange={(e) => setNewCityInput(e.target.value)}
                placeholder="Enter a city..."
                value={newCityInput}
              />
              <Button
                disabled={
                  !newCityInput.trim() ||
                  favoriteCities.includes(newCityInput.trim())
                }
                onClick={handleAddFavoriteCity}
                variant="outline"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>

            {/* Display favorite cities */}
            <div className="flex min-h-[50px] flex-wrap gap-2 rounded-md border p-2">
              {favoriteCities.length > 0 ? (
                favoriteCities.map((city) => (
                  <Badge
                    className="flex items-center gap-1"
                    key={city}
                    variant="secondary"
                  >
                    {city}
                    <button
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      onClick={() => handleRemoveFavoriteCity(city)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {city}</span>
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="w-full py-2 text-center text-muted-foreground text-sm">
                  No favorite cities added yet.
                </p>
              )}
            </div>
          </div>

          {/* Selected interests */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Selected Interests ({interests.length})</span>
              {interests.length > 0 && (
                <Button
                  className="h-7 px-2 text-xs"
                  onClick={() => setInterests([])}
                  size="sm"
                  variant="ghost"
                >
                  Clear All
                </Button>
              )}
            </Label>
            <div className="flex min-h-[50px] flex-wrap gap-2 rounded-md border p-2">
              {interests.length > 0 ? (
                interests.map((interest) => (
                  <InterestTile
                    interest={enhanceInterest(interest)}
                    key={interest}
                    onClick={() => handleToggleInterest(interest)}
                    selected={true}
                    size="md"
                  />
                ))
              ) : (
                <p className="w-full py-2 text-center text-muted-foreground text-sm">
                  No interests selected. Choose from suggestions below.
                </p>
              )}
            </div>
          </div>

          {/* Interest search */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1" htmlFor="search">
              <Search className="h-4 w-4" />
              Search or Select Interests
            </Label>
            <Input
              id="search"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search interests..."
              value={searchQuery}
            />
          </div>

          {/* Suggested interests */}
          <div className="space-y-2">
            <Label>Suggested For You</Label>
            <div className="flex max-h-[200px] min-h-[100px] flex-wrap gap-2 overflow-y-auto rounded-md border p-2">
              {isLoading ? (
                <div className="flex w-full items-center justify-center py-4">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                </div>
              ) : allSuggestions.length > 0 ? (
                allSuggestions.map((interest) => (
                  <InterestTile
                    interest={enhanceInterest(interest)}
                    key={interest}
                    onClick={() => handleToggleInterest(interest)}
                    selected={false}
                    size="md"
                  />
                ))
              ) : searchQuery ? (
                <p className="w-full py-2 text-center text-muted-foreground text-sm">
                  No matching interests found.
                </p>
              ) : (
                <p className="w-full py-2 text-center text-muted-foreground text-sm">
                  Try changing your location or search for specific interests.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={() => setOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button disabled={interests.length === 0} onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
