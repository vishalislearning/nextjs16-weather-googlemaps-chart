"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Wind, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WeatherMapProps {
  latitude: number;
  longitude: number;
  cityName: string;
  windSpeed?: number;
  windDirection?: number;
  onLocationSelect?: (lat: number, lng: number, cityName?: string) => void;
  onGetWeather?: () => void;
  canGetWeather?: boolean;
  initialZoom?: number;
}

// .env.local     ---  NEXT_PUBLIC_MAPBOX_TOKEN
// get free token: mapbox.com
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function WeatherMap({
  latitude,
  longitude,
  cityName,
  onLocationSelect,
  onGetWeather,
  canGetWeather = false,
  initialZoom,
}: WeatherMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const selectedMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const windArrowRef = useRef<mapboxgl.Marker | null>(null);
  const removeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      accessToken: MAPBOX_TOKEN,
      style: "mapbox://styles/mapbox/streets-v12",
      // center: mapCenter,
      // zoom: mapZoom,
      attributionControl: false,
    });

    // create current location marker
    const createMarker = (
      lng: number,
      lat: number,
      isSelected = false,
      customLabel?: string
    ) => {
      const el = document.createElement("div");
      el.className = "relative cursor-pointer";

      const label = document.createElement("div");
      label.className =
        "absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap z-10";
      label.style.background = isSelected
        ? "linear-gradient(to right, #f97316, #fb923c)"
        : "linear-gradient(to right, #0ea5e9, #06b6d4)";
      label.textContent = isSelected ? customLabel || "New Location" : cityName;

      const icon = document.createElement("div");
      icon.innerHTML = `<svg class="w-8 h-8 ${
        isSelected ? "text-orange-500" : "text-sky-500"
      }" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
      icon.style.filter = "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))";

      el.appendChild(label);
      el.appendChild(icon);

      return new mapboxgl.Marker(el).setLngLat([lng, lat]);
    };

    markerRef.current = createMarker(longitude, latitude, false);
    markerRef.current.addTo(map.current);

    // map loaded
    map.current.on("load", () => {
      setIsMapLoaded(true);
    });

    // click map to select new location
    if (onLocationSelect) {
      map.current.on("click", async (e) => {
        const { lng, lat } = e.lngLat;

        // remove previous selected marker
        if (selectedMarkerRef.current) {
          selectedMarkerRef.current.remove();
        }

        // create new location marker (temporary display "Loading...")
        selectedMarkerRef.current = createMarker(lng, lat, true, "Loading...");
        selectedMarkerRef.current.addTo(map.current!);

        // use Mapbox Geocoding API to get detailed city/district information
        let cityName: string | undefined;
        let districtName: string | undefined;
        let regionName: string | undefined;
        let countryCode: string | undefined;

        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=place,locality,neighborhood,district,region`
          );
          const data = await response.json();

          if (data.features && data.features.length > 0) {
            const mainFeature = data.features[0];

            // get name from main feature
            cityName = mainFeature.text;

            // get detailed information from context
            if (mainFeature.context) {
              mainFeature.context.forEach((ctx: any) => {
                if (ctx.id?.startsWith("district")) {
                  districtName = ctx.text;
                } else if (ctx.id?.startsWith("place")) {
                  cityName = ctx.text || cityName;
                } else if (ctx.id?.startsWith("region")) {
                  regionName = ctx.text;
                } else if (ctx.id?.startsWith("country")) {
                  countryCode = ctx.short_code || ctx.text;
                }
              });
            }

            // use district name first, then city name
            const displayName =
              districtName ||
              cityName ||
              `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

            // combine display name (district/city, province/state, country)
            let fullName = displayName;
            if (regionName && fullName !== regionName) {
              fullName = `${fullName}, ${regionName}`;
            }
            if (countryCode && fullName !== countryCode) {
              fullName = `${fullName}, ${countryCode}`;
            }

            cityName = fullName;
          } else {
            cityName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          // if reverse geocoding fails, use coordinates as fallback
          cityName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }

        // update marker display city name
        if (selectedMarkerRef.current && cityName) {
          const markerElement = selectedMarkerRef.current.getElement();
          const labelElement = markerElement.querySelector(
            "div"
          ) as HTMLElement;
          if (labelElement) {
            labelElement.textContent = cityName;
          }
        }

        // call callback function, pass coordinates and city name (include district/city/province information)
        onLocationSelect(lat, lng, cityName);
      });

      // change mouse style
      map.current.getCanvas().style.cursor = "crosshair";
    }

    // cleanup function
    return () => {
      if (removeIntervalRef.current) {
        clearInterval(removeIntervalRef.current);
        removeIntervalRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current.remove();
      }
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.remove();
      }
      if (windArrowRef.current) {
        windArrowRef.current.remove();
      }
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // when map data updates, update marker position
  useEffect(() => {
    if (map.current && markerRef.current && isMapLoaded) {
      // update map center, if initialZoom is 8, keep 8, otherwise use 10
      const targetZoom = initialZoom !== undefined ? initialZoom : 10;
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: targetZoom,
      });

      // update marker position
      markerRef.current.setLngLat([longitude, latitude]);

      // update marker label
      const markerEl = markerRef.current.getElement();
      const label = markerEl?.querySelector("div") as HTMLElement;
      if (label) {
        label.textContent = cityName;
      }
    }
  }, [latitude, longitude, cityName, isMapLoaded]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center p-4">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Mapbox token not configured
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Get Weather Button */}
      {onGetWeather && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <Button
            onClick={onGetWeather}
            disabled={!canGetWeather}
            className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-6 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            <MapPin className="w-5 h-5 mr-2" />
            Get Weather
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
