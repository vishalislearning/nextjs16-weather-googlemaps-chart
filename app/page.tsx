"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, Sparkles, Droplets, Thermometer } from "lucide-react";
import dynamic from "next/dynamic";

// dynamic import map component, disable SSR
const WeatherMap = dynamic(() => import("@/components/WeatherMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
});

interface CountryData {
  code: string;
  name: string;
  flag: string;
}

interface CityData {
  name: string;
  stateCode: string;
  countryCode: string;
  isCountry?: boolean;
  latitude?: number;
  longitude?: number;
}

export default function Index() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(
    null
  );
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);

  // default location: Guangzhou
  const [mapLocation, setMapLocation] = useState<{
    lat: number;
    lng: number;
    cityName: string;
  }>({
    lat: 23.1291,
    lng: 113.2644,
    cityName: "Guangzhou",
  });

  const handleLocationSelect = (
    lat: number,
    lng: number,
    cityName?: string
  ) => {
    // update map location
    const locationName = cityName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    setMapLocation({
      lat,
      lng,
      cityName: locationName,
    });
    // create city data,
    const cityData: CityData = {
      name: locationName,
      stateCode: "",
      countryCode: selectedCountry?.code || "",
      latitude: lat,
      longitude: lng,
    };
    setSelectedCity(cityData);
  };

  const handleGetWeather = () => {
    if (mapLocation) {
      const cityData: CityData = {
        name: mapLocation.cityName,
        stateCode: "",
        countryCode: selectedCountry?.code || "",
        latitude: mapLocation.lat,
        longitude: mapLocation.lng,
      };
      const cityDataStr = JSON.stringify(cityData);
      router.push(`/weather?id=${encodeURIComponent(cityDataStr)}`);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-cyan-50/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-blue-100/20 via-sky-100/20 to-cyan-100/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(125,211,252,0.1),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
          <div className="items-start">
            {/* Left Column - Main Content (2/3 width) */}
            <div className="">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-200">
                  <Sparkles className="w-3 h-3 mr-1 text-amber-400" />
                  Real-time Weather Data
                </Badge>

                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-4">
                  <span className="text-slate-700">Discover Weather</span>
                  <span className="block text-sky-600">Around the World</span>
                </h1>

                <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  Get accurate weather forecasts for any location worldwide.
                  <span className="text-foreground font-medium">
                    {" "}
                    Fast, reliable, and beautifully designed.
                  </span>
                </p>
              </div>
            </div>

            {/* Right Column - Map (1/3 width) */}
            <div className="lg:col-span-1">
              <div className="h-[600px] sticky top-8">
                <WeatherMap
                  latitude={selectedCity?.latitude || mapLocation.lat}
                  longitude={selectedCity?.longitude || mapLocation.lng}
                  cityName={selectedCity?.name || mapLocation.cityName}
                  onLocationSelect={handleLocationSelect}
                  onGetWeather={handleGetWeather}
                  canGetWeather={!!(selectedCity || mapLocation.cityName)}
                  initialZoom={8}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 relative">
        <div className="absolute inset-0 bg-linear-to-r from-slate-50/30 via-blue-50/20 to-cyan-50/20" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              <span className="text-sky-600">Weather Features</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to stay informed about the weather
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-6">
            <Card className="border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg bg-white/70 backdrop-blur-sm rounded-xl">
              <CardHeader className="pb-4">
                <div className="p-3 rounded-xl bg-blue-50 w-fit mb-3 shadow-sm">
                  <Thermometer className="w-6 h-6 text-blue-500" />
                </div>
                <CardTitle className="text-xl font-semibold">
                  Real-time Data
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Get up-to-date weather information from reliable sources
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-gray-100 hover:border-cyan-200 transition-all duration-300 hover:shadow-lg bg-white/70 backdrop-blur-sm rounded-xl">
              <CardHeader className="pb-4">
                <div className="p-3 rounded-xl bg-cyan-50 w-fit mb-3 shadow-sm">
                  <Cloud className="w-6 h-6 text-cyan-500" />
                </div>
                <CardTitle className="text-xl font-semibold">
                  7-Day Forecast
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Plan ahead with detailed weekly weather predictions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-gray-100 hover:border-sky-200 transition-all duration-300 hover:shadow-lg bg-white/70 backdrop-blur-sm rounded-xl">
              <CardHeader className="pb-4">
                <div className="p-3 rounded-xl bg-sky-50 w-fit mb-3 shadow-sm">
                  <Droplets className="w-6 h-6 text-sky-500" />
                </div>
                <CardTitle className="text-xl font-semibold">
                  Detailed Metrics
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Humidity, wind speed, pressure, and more
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
