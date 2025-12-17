"use client";

import { ArrowRight, Compass, MagnifyingGlass } from "@phosphor-icons/react";
import { buttonVariants } from "@spots/design/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { DynamicFeatures } from "@/components/features/DynamicFeatures";
import type { LocationItem } from "@/components/LocationDropdown";
import { HomeMap } from "@/components/maps/HomeMap";
import { defaultCities } from "@/lib/data/cities-data";
import { cn } from "@/lib/utils";

// Convert city data to location items for dropdown
const cityLocations: LocationItem[] = defaultCities.map((city) => ({
  id: city.id,
  title: city.name,
  coordinates: city.coordinates,
  emoji: city.emoji,
  trending: city.trending,
  type: city.type,
}));

export default function HomePage() {
  // Shared location state
  const [selectedLocation, setSelectedLocation] = useState<LocationItem>(
    cityLocations[0]
  );

  // Handle location change - passed to both map and features
  const handleLocationChange = (location: LocationItem) => {
    setSelectedLocation(location);
    console.log("Location changed to:", location.title, location.emoji);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#050A14] text-white">
      <header className="container z-40 px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between py-4 sm:h-20 sm:py-6">
          <div className="flex flex-1 justify-start">
            <Link
              className="hidden font-medium text-white/60 transition-colors hover:text-white/80 md:inline-block"
              href="/explore"
            >
              Explore
            </Link>
          </div>

          <div className="flex flex-1 justify-center">
            <Link className="flex items-center space-x-2" href="/">
              <span className="text-xl sm:text-2xl">🗺️</span>
              <span className="inline-block font-bold text-xl sm:text-2xl">
                Spots
              </span>
            </Link>
          </div>

          <div className="flex flex-1 justify-end">
            <Link
              className="font-medium text-white/60 transition-colors hover:text-white/80"
              href="/login"
            >
              Login
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section with Map */}
        <section className="py-4 sm:py-6 md:py-8 lg:py-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Interactive Map */}
            <div className="mx-auto mb-8 max-w-[90rem] sm:mb-12">
              <HomeMap
                onChange={handleLocationChange}
                selectedLocation={selectedLocation}
              />
            </div>

            {/* Hero Text */}
            <div className="mx-auto flex max-w-[64rem] flex-col items-center gap-3 px-2 text-center sm:gap-4 sm:px-4">
              <h1 className="font-bold text-3xl tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Discover amazing places tailored to{" "}
                <span className="text-[#4ECDC4]/80">your interests</span>
              </h1>
              <p className="max-w-[42rem] text-sm text-white/60 leading-normal sm:text-base sm:leading-8 md:text-xl">
                Spots uses AI to understand your preferences and recommend the
                perfect locations. From hidden cafes to scenic viewpoints, find
                your next favorite spot.
              </p>
              <div className="mt-4 flex w-full flex-col space-y-3 sm:w-auto sm:flex-row sm:space-x-4 sm:space-y-0">
                <Link
                  className={cn(
                    buttonVariants({ size: "lg", variant: "default" }),
                    "w-full bg-[#4ECDC4]/90 font-medium text-black hover:bg-[#4ECDC4] sm:w-auto"
                  )}
                  href="/onboarding"
                >
                  <Compass className="mr-2" size={20} weight="duotone" />
                  Get Started
                </Link>
                <Link
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "w-full border-white/10 hover:bg-white/5 sm:w-auto"
                  )}
                  href="/explore"
                >
                  <MagnifyingGlass
                    className="mr-2"
                    size={20}
                    weight="duotone"
                  />
                  Explore
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-16 lg:py-20" id="features">
          <div className="container mx-auto flex flex-col items-center px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 flex w-full max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="font-bold text-2xl leading-[1.1] sm:text-3xl md:text-4xl lg:text-5xl">
                Features
              </h2>
              <p className="max-w-[95%] text-sm text-white/60 leading-normal sm:max-w-[85%] sm:text-base sm:leading-7 md:text-lg">
                Discover the powerful features that make Spots your perfect
                companion for place discovery
              </p>
            </div>

            {/* Dynamic features component */}
            <DynamicFeatures
              onChange={handleLocationChange}
              selectedLocation={selectedLocation}
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-16 lg:py-20" id="cta">
          <div className="container mx-auto flex flex-col items-center px-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-[58rem] flex-col items-center gap-3 text-center sm:gap-4">
              <h2 className="font-bold text-2xl leading-[1.1] sm:text-3xl md:text-4xl lg:text-5xl">
                Ready to discover your spots?
              </h2>
              <p className="max-w-[95%] text-sm text-white/60 leading-normal sm:max-w-[85%] sm:text-base sm:leading-7 md:text-lg">
                Create your profile and start getting personalized
                recommendations today.
              </p>
              <Link
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-4 w-full max-w-xs bg-[#4ECDC4]/90 font-medium text-black hover:bg-[#4ECDC4] sm:w-auto"
                )}
                href="/onboarding"
              >
                <ArrowRight className="mr-2" size={20} weight="duotone" />
                Get Started
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-white/5 border-t px-4 py-6 sm:px-6 md:py-0 lg:px-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-white/60 text-xs sm:text-sm md:text-left">
            © {new Date().getFullYear()} Spots. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              className="text-white/60 text-xs underline underline-offset-4 sm:text-sm"
              href="/terms"
            >
              Terms
            </Link>
            <Link
              className="text-white/60 text-xs underline underline-offset-4 sm:text-sm"
              href="/privacy"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
