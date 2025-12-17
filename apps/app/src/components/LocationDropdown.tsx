import { Input } from "@spots/design/components/ui/input";
import React, { useEffect, useRef, useState } from "react";

export type LocationItem = {
  id: string;
  title: string;
  coordinates: [number, number];
  emoji: string;
  trending?: boolean;
  type?: string;
};

interface LocationDropdownProps {
  locations: LocationItem[];
  selectedLocation: LocationItem;
  onChange: (location: LocationItem) => void;
  className?: string;
}

export function LocationDropdown({
  locations,
  selectedLocation,
  onChange,
  className = "",
}: LocationDropdownProps) {
  const [searchQuery, setSearchQuery] = useState(selectedLocation.title);
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter locations based on search input
  const filteredLocations =
    isTyping && activeSearchQuery.trim() !== ""
      ? locations.filter((loc) =>
          loc.title.toLowerCase().includes(activeSearchQuery.toLowerCase())
        )
      : locations;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setIsTyping(false);
        setActiveSearchQuery("");
        setSearchQuery(selectedLocation.title);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedLocation]);

  // Select a location
  const selectLocation = (location: LocationItem) => {
    onChange(location);
    setSearchQuery(location.title);
    setActiveSearchQuery("");
    setIsTyping(false);
    setShowDropdown(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Input
          className="border-0 bg-white/90 pl-9 text-[#050A14] shadow-md backdrop-blur-sm"
          onChange={(e) => {
            setActiveSearchQuery(e.target.value);
            setIsTyping(true);
            setShowDropdown(true);
          }}
          onFocus={() => {
            setShowDropdown(true);
            setIsTyping(true);
            setActiveSearchQuery("");
          }}
          placeholder="Search for a city..."
          type="text"
          value={isTyping ? activeSearchQuery : searchQuery}
        />
        <span className="-translate-y-1/2 absolute top-1/2 left-3 transform text-[#050A14]/70">
          {selectedLocation.emoji || "🔍"}
        </span>

        {showDropdown && (
          <div className="absolute top-full left-0 z-20 mt-1 max-h-64 w-full overflow-hidden overflow-y-auto rounded-md border border-[#4ECDC4]/20 bg-white/95 shadow-lg backdrop-blur-md">
            {filteredLocations.length > 0 ? (
              <>
                {/* Trending Cities Section */}
                {(!isTyping || activeSearchQuery.trim() === "") && (
                  <div className="px-3 py-2">
                    <div className="mb-1 font-semibold text-[#050A14]/60 text-xs uppercase tracking-wider">
                      Trending Cities
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {filteredLocations
                        .filter((loc) => loc.trending)
                        .map((location) => (
                          <div
                            className={`flex cursor-pointer items-center gap-1.5 rounded px-2 py-1.5 text-[#050A14] hover:bg-[#4ECDC4]/10 ${
                              location.id === selectedLocation.id
                                ? "bg-[#4ECDC4]/20 font-medium"
                                : ""
                            }`}
                            key={location.id}
                            onClick={() => selectLocation(location)}
                          >
                            <span className="text-lg">{location.emoji}</span>
                            <span className="truncate">{location.title}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* All Cities Section */}
                <div className="px-3 py-2">
                  {(!isTyping || activeSearchQuery.trim() === "") && (
                    <div className="mb-1 font-semibold text-[#050A14]/60 text-xs uppercase tracking-wider">
                      All Cities ({locations.length})
                    </div>
                  )}

                  {filteredLocations.map((location) => (
                    <div
                      className={`flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-[#050A14] hover:bg-[#4ECDC4]/10 ${
                        location.id === selectedLocation.id
                          ? "bg-[#4ECDC4]/20 font-medium"
                          : ""
                      }`}
                      key={location.id}
                      onClick={() => selectLocation(location)}
                    >
                      <span className="text-lg">{location.emoji}</span>
                      <span>{location.title}</span>
                      {location.trending && (
                        <span className="ml-auto rounded-full bg-[#4ECDC4]/10 px-1.5 py-0.5 text-[#4ECDC4]/90 text-xs">
                          trending
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 text-[#050A14]/60">
                <span>🔍</span>
                <span>No locations found</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
