"use client";

import mapboxgl from "mapbox-gl";
import React, { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/utils";

// Default San Francisco coordinates
const DEFAULT_CENTER: [number, number] = [-122.4194, 37.7749];

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    name: string;
    description?: string;
    coordinates: [number, number];
    category?: string;
    color?: string;
  }>;
  onMarkerClick?: (markerId: string) => void;
  className?: string;
  interactive?: boolean;
  controls?: boolean;
  style?: "light" | "dark" | "streets" | "outdoors" | "satellite";
}

export function MapView({
  center = DEFAULT_CENTER,
  zoom = 12,
  markers = [],
  onMarkerClick,
  className,
  interactive = true,
  controls = true,
  style = "light",
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [id: string]: mapboxgl.Marker }>({});
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Style options
  const mapStyles = {
    light: "mapbox://styles/mapbox/light-v11",
    dark: "mapbox://styles/mapbox/dark-v11",
    streets: "mapbox://styles/mapbox/streets-v12",
    outdoors: "mapbox://styles/mapbox/outdoors-v12",
    satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  };

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    setError(null);

    try {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

      if (!mapboxgl.accessToken) {
        throw new Error("MapBox access token is not configured");
      }

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyles[style],
        center,
        zoom,
        interactive,
        attributionControl: false,
      });

      map.current.on("error", (e) => {
        const errorMessage = e.error ? e.error.message : "Unknown map error";
        console.error("MapBox error:", errorMessage);
        setError(errorMessage);
      });

      if (controls) {
        map.current.addControl(
          new mapboxgl.NavigationControl({
            showCompass: false,
          }),
          "top-right"
        );

        map.current.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showAccuracyCircle: false,
          }),
          "top-right"
        );
      }

      map.current.addControl(
        new mapboxgl.AttributionControl({
          compact: true,
        }),
        "bottom-right"
      );

      map.current.on("load", () => {
        if (map.current) {
          map.current.resize();
        }
        setLoaded(true);
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error initializing map";
      console.error("Error initializing map:", errorMessage);
      setError(errorMessage);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom, interactive, controls, style]);

  // Update markers
  useEffect(() => {
    if (!(map.current && loaded)) return;

    try {
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};

      markers.forEach((marker) => {
        try {
          const el = document.createElement("div");
          el.className = "map-marker";
          el.style.backgroundColor = marker.color || "#4ECDC4";
          el.style.width = "22px";
          el.style.height = "22px";
          el.style.borderRadius = "50%";
          el.style.cursor = "pointer";
          el.style.border = "2px solid white";
          el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
          el.style.transition = "transform 0.2s ease";

          el.addEventListener("mouseenter", () => {
            el.style.transform = "scale(1.1)";
          });

          el.addEventListener("mouseleave", () => {
            el.style.transform = "scale(1)";
          });

          const markerObj = new mapboxgl.Marker(el)
            .setLngLat(marker.coordinates)
            .addTo(map.current!);

          if (marker.name) {
            const popup = new mapboxgl.Popup({
              offset: 25,
              closeButton: false,
              className: "custom-popup",
              maxWidth: "250px",
            }).setHTML(`
              <div class="marker-popup">
                <strong>${marker.name}</strong>
                ${marker.description ? `<p>${marker.description}</p>` : ""}
                <div class="text-xs opacity-70">Click to explore</div>
              </div>
            `);

            markerObj.setPopup(popup);
          }

          if (onMarkerClick) {
            el.addEventListener("click", () => {
              onMarkerClick(marker.id);
            });
          }

          markersRef.current[marker.id] = markerObj;
        } catch (markerError) {
          console.error(`Error creating marker: ${marker.id}`, markerError);
        }
      });
    } catch (markersError) {
      console.error("Error updating markers", markersError);
    }
  }, [markers, loaded, onMarkerClick]);

  // Update map center and zoom
  useEffect(() => {
    if (!(map.current && loaded)) return;

    try {
      map.current.flyTo({
        center,
        zoom,
        essential: true,
        duration: 1000,
        easing: (t) => t * (2 - t),
      });
    } catch (flyError) {
      console.error("Error updating map view", flyError);
    }
  }, [center, zoom, loaded]);

  // Update map style
  useEffect(() => {
    if (!(map.current && loaded)) return;

    try {
      map.current.setStyle(mapStyles[style]);

      map.current.once("styledata", () => {
        const currentMarkers = { ...markersRef.current };
        Object.values(markersRef.current).forEach((marker) => marker.remove());
        markersRef.current = {};

        setTimeout(() => {
          markers.forEach((marker) => {
            if (currentMarkers[marker.id]) {
              currentMarkers[marker.id].addTo(map.current!);
              markersRef.current[marker.id] = currentMarkers[marker.id];
            }
          });
        }, 100);
      });
    } catch (styleError) {
      console.error("Error updating map style", styleError);
    }
  }, [style, loaded, markers]);

  return (
    <div className="relative">
      <div
        className={cn(
          "min-h-[300px] w-full overflow-hidden rounded-md",
          className
        )}
        ref={mapContainer}
        style={{ backgroundColor: "#e0e0e0" }}
      />

      {!(loaded || error) && (
        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-white/10 backdrop-blur-sm">
          <div className="animate-pulse text-sm text-white/70">
            Loading map...
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-white/10 backdrop-blur-sm">
          <div className="max-w-xs px-4 text-center text-red-400 text-sm">
            <p className="mb-1 font-bold">Map error</p>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
