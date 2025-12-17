"use client";

import { Badge } from "@spots/design/components/ui/badge";
import { Button } from "@spots/design/components/ui/button";
import { Input } from "@spots/design/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  PlusCircle,
  RefreshCw,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@spots/backend/api";
import type { Id } from "@spots/backend/dataModel";

// Interest type
export interface Interest {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

// Default interests fallback
const defaultInterests: Interest[] = [
  { id: "coffee", name: "Coffee", emoji: "☕", color: "#4ECDC4" },
  { id: "food", name: "Food", emoji: "🍽️", color: "#FF6B6B" },
  { id: "shopping", name: "Shopping", emoji: "🛍️", color: "#FFD166" },
  { id: "art", name: "Art", emoji: "🎨", color: "#FFD166" },
  { id: "music", name: "Music", emoji: "🎵", color: "#FF6B6B" },
  { id: "nature", name: "Nature", emoji: "🌿", color: "#AAC789" },
  { id: "tech", name: "Tech", emoji: "💻", color: "#4ECDC4" },
  { id: "sports", name: "Sports", emoji: "⚽", color: "#4ECDC4" },
  { id: "reading", name: "Reading", emoji: "📚", color: "#4ECDC4" },
];

// Popular cities for suggestions
const popularCities = [
  "San Francisco",
  "New York",
  "Los Angeles",
  "Chicago",
  "Seattle",
  "London",
  "Paris",
  "Tokyo",
  "Berlin",
  "Sydney",
  "Toronto",
  "Barcelona",
  "Amsterdam",
  "Rome",
  "Miami",
  "Austin",
  "Portland",
  "Nashville",
  "Boston",
  "New Orleans",
  "Vancouver",
  "Dubai",
  "Singapore",
  "Hong Kong",
  "Mexico City",
  "Montreal",
  "Madrid",
  "Copenhagen",
  "Vienna",
  "Stockholm",
  "Dublin",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedInterestDetails, setSelectedInterestDetails] = useState<
    Interest[]
  >([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [userLocation, setUserLocation] = useState("Los Angeles");
  const [favoriteCities, setFavoriteCities] = useState<string[]>([]);
  const [newCityInput, setNewCityInput] = useState("");
  const [detectedLocation, setDetectedLocation] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [commonInterests, setCommonInterests] =
    useState<Interest[]>(defaultInterests);

  // Convex mutations
  const completeOnboarding = useMutation(
    api.app.users.mutations.completeOnboarding
  );
  const updateInterests = useMutation(api.app.users.mutations.updateInterests);

  // Convex queries
  const trendingInterests = useQuery(api.app.interests.queries.getTrending, {
    limit: 15,
  });

  // Detect user's location on mount
  useEffect(() => {
    const detectLocation = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;

              let detected = "Los Angeles";

              if (
                latitude > 37 &&
                latitude < 38 &&
                longitude < -122 &&
                longitude > -123
              ) {
                detected = "San Francisco";
              } else if (
                latitude > 40 &&
                latitude < 41 &&
                longitude < -73 &&
                longitude > -75
              ) {
                detected = "New York";
              } else if (
                latitude > 33 &&
                latitude < 35 &&
                longitude < -118 &&
                longitude > -119
              ) {
                detected = "Los Angeles";
              }

              console.log("[LOCATION] User location detected:", detected);
              setDetectedLocation(detected);
              setUserLocation(detected);
            },
            (error) => {
              console.error("[LOCATION] Error getting location:", error);
              const fallback = "Los Angeles";
              setDetectedLocation(fallback);
              setUserLocation(fallback);
            }
          );
        } else {
          const fallback = "Los Angeles";
          setDetectedLocation(fallback);
          setUserLocation(fallback);
        }
      } catch (error) {
        console.error("[LOCATION] Error detecting location:", error);
        const fallback = "Los Angeles";
        setDetectedLocation(fallback);
        setUserLocation(fallback);
      } finally {
        setLoadingLocation(false);
      }
    };

    detectLocation();
  }, []);

  // Animation effect when component mounts
  useEffect(() => {
    setAnimate(true);
  }, []);

  // Update common interests from Convex
  useEffect(() => {
    if (trendingInterests) {
      const interests = trendingInterests.map((interest) => ({
        id: interest._id,
        name: interest.name,
        emoji: getInterestEmoji(interest.name),
        color: getInterestColor(interest.name),
      }));
      setCommonInterests(interests);
    }
  }, [trendingInterests]);

  // Helper function to get emoji for an interest
  const getInterestEmoji = (interest: string): string => {
    const emojiMap: Record<string, string> = {
      Coffee: "☕",
      Food: "🍽️",
      Shopping: "🛍️",
      Art: "🎨",
      Music: "🎵",
      Nature: "🌿",
      Tech: "💻",
      Sports: "⚽",
      Reading: "📚",
      Nightlife: "🌃",
      Wine: "🍷",
      Beer: "🍺",
      Hiking: "🥾",
      Museums: "🏛️",
      Photography: "📷",
      Beaches: "🏖️",
      Film: "🎬",
      Tacos: "🌮",
    };

    if (emojiMap[interest]) return emojiMap[interest];

    for (const key of Object.keys(emojiMap)) {
      if (
        interest.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(interest.toLowerCase())
      ) {
        return emojiMap[key];
      }
    }

    return "🔍";
  };

  const getInterestColor = (interest: string): string => {
    let hash = 0;
    for (let i = 0; i < interest.length; i++) {
      hash = interest.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colors = [
      "#4ECDC4",
      "#FF6B6B",
      "#FFD166",
      "#AAC789",
      "#45B7D1",
      "#F46036",
      "#E76F51",
      "#2A9D8F",
      "#6A994E",
      "#9B5DE5",
    ];

    return colors[Math.abs(hash) % colors.length];
  };

  const handleInterestChange = (interests: string[]) => {
    setSelectedInterests(interests);

    const interestDetails = interests
      .map((id) => {
        const foundInterest = commonInterests.find(
          (interest: Interest) => interest.id === id
        );
        if (foundInterest) return foundInterest;

        const name = id
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        return {
          id,
          name,
          emoji: getInterestEmoji(name),
          color: getInterestColor(name),
        };
      })
      .filter(Boolean) as Interest[];

    setSelectedInterestDetails(interestDetails);
  };

  const handleNext = async () => {
    if (step === 1) {
      if (selectedInterests.length === 0) {
        return;
      }

      setAnimate(false);
      setTimeout(() => {
        setStep(2);
        setAnimate(true);
      }, 300);

      return;
    }

    if (step === 2) {
      setLoading(true);

      try {
        // Save interests to Convex
        // Cast to Id<"interests">[] - IDs come from interest._id when loaded from Convex
        await updateInterests({
          interestIds: selectedInterests as Id<"interests">[],
        });

        // Complete onboarding
        await completeOnboarding();

        // Navigate to dashboard
        router.push("/dashboard");
      } catch (error) {
        console.error("Error completing onboarding:", error);
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setAnimate(false);
      setTimeout(() => {
        setStep(step - 1);
        setAnimate(true);
      }, 300);
    }
  };

  const handleAddCity = () => {
    if (newCityInput.trim() && !favoriteCities.includes(newCityInput.trim())) {
      setFavoriteCities([...favoriteCities, newCityInput.trim()]);
      setNewCityInput("");
    }
  };

  const handleRemoveCity = (city: string) => {
    setFavoriteCities(favoriteCities.filter((c) => c !== city));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div
          className={`mb-8 text-center transition-all duration-500 ${animate ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}
        >
          <h1 className="mb-2 font-bold text-4xl">Welcome to Spots</h1>
          <p className="text-muted-foreground">
            Let's personalize your experience
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div
            className={`h-2 w-20 rounded-full transition-all duration-300 ${step >= 1 ? "bg-primary" : "bg-muted"}`}
          />
          <div
            className={`h-2 w-20 rounded-full transition-all duration-300 ${step >= 2 ? "bg-primary" : "bg-muted"}`}
          />
        </div>

        {/* Content */}
        <div
          className={`rounded-xl bg-card p-8 shadow-lg transition-all duration-500 ${animate ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        >
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2 font-semibold text-2xl">
                  What are you interested in?
                </h2>
                <p className="text-muted-foreground">
                  Select at least one interest to get personalized
                  recommendations
                </p>
              </div>

              {loadingLocation ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {commonInterests.map((interest) => (
                      <button
                        className={`rounded-full border-2 px-4 py-2 transition-all duration-200 ${
                          selectedInterests.includes(interest.id)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/50"
                        }`}
                        key={interest.id}
                        onClick={() => {
                          if (selectedInterests.includes(interest.id)) {
                            handleInterestChange(
                              selectedInterests.filter(
                                (id) => id !== interest.id
                              )
                            );
                          } else {
                            handleInterestChange([
                              ...selectedInterests,
                              interest.id,
                            ]);
                          }
                        }}
                      >
                        <span className="mr-2">{interest.emoji}</span>
                        {interest.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2 font-semibold text-2xl">
                  Where do you want to explore?
                </h2>
                <p className="text-muted-foreground">
                  Add cities you'd like to discover
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    className="flex-1"
                    onChange={(e) => setNewCityInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddCity()}
                    placeholder="Enter a city..."
                    value={newCityInput}
                  />
                  <Button onClick={handleAddCity} size="icon">
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>

                {favoriteCities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {favoriteCities.map((city) => (
                      <Badge
                        className="px-3 py-1"
                        key={city}
                        variant="secondary"
                      >
                        {city}
                        <button
                          className="ml-2"
                          onClick={() => handleRemoveCity(city)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <div>
                  <p className="mb-2 text-muted-foreground text-sm">
                    Popular cities:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {popularCities.slice(0, 10).map((city) => (
                      <button
                        className="rounded-full border border-border px-3 py-1 text-sm transition-colors hover:border-primary/50"
                        key={city}
                        onClick={() => {
                          if (!favoriteCities.includes(city)) {
                            setFavoriteCities([...favoriteCities, city]);
                          }
                        }}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <Button
              className="gap-2"
              disabled={step === 1}
              onClick={handleBack}
              variant="ghost"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <Button
              className="gap-2"
              disabled={step === 1 && selectedInterests.length === 0}
              onClick={handleNext}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-background border-b-2" />
                  Loading...
                </>
              ) : step === 2 ? (
                <>
                  Complete
                  <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Skip option */}
        <div className="mt-6 text-center">
          <Link
            className="text-muted-foreground text-sm underline transition-colors hover:text-foreground"
            href="/dashboard"
          >
            Skip for now
          </Link>
        </div>
      </div>
    </div>
  );
}
