"use client";

import React, { useState, useCallback } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WeatherMapProps {
  latitude: number;
  longitude: number;
  cityName: string;
  onLocationSelect?: (lat: number, lng: number, cityName?: string) => void;
  onGetWeather?: () => void;
  canGetWeather?: boolean;
  initialZoom?: number;
}

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";

const containerStyle = {
  width: "100%",
  height: "100%",
};

export default function WeatherMap({
  latitude,
  longitude,
  cityName,
  onLocationSelect,
  onGetWeather,
  canGetWeather = false,
  initialZoom = 10,
}: WeatherMapProps) {
  const [selectedPosition, setSelectedPosition] = useState({
    lat: 28.6139,
    lng: 77.2090,
  });

  // Handle map click
  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;

      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      setSelectedPosition({ lat, lng });

      // Reverse geocoding using Google
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        let formattedAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        if (status === "OK" && results && results[0]) {
          formattedAddress = results[0].formatted_address;
        }

        onLocationSelect?.(lat, lng, formattedAddress);
      });
    },
    [onLocationSelect]
  );

  if (!GOOGLE_MAPS_KEY) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Google Maps key not configured
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Add NEXT_PUBLIC_GOOGLE_MAPS_KEY to .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={selectedPosition}
          zoom={initialZoom}
          onClick={handleMapClick}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
          }}
        >
          <Marker position={selectedPosition} title={cityName} />
        </GoogleMap>
      </LoadScript>

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