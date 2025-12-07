"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IoArrowBack } from "react-icons/io5";
import { WiRain, WiSunrise, WiSunset } from "react-icons/wi";
import {
  Cloud,
  Sun,
  Droplets,
  Wind,
  Gauge,
  MapPin,
  Sparkles,
  Thermometer,
} from "lucide-react";
import dynamic from "next/dynamic";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// // 动态导入地图组件，禁用 SSR
// const WeatherMap = dynamic(() => import("@/components/WeatherMap"), {
//   ssr: false,
//   loading: () => (
//     <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
//       <div className="text-center">
//         <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
//         <p className="text-sm text-muted-foreground">Loading map...</p>
//       </div>
//     </div>
//   ),
// });

interface WeatherData {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    pressure_msl: number;
    cloud_cover: number;
    weather_code: number;
    is_day: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    sunrise: string[];
    sunset: string[];
    weather_code: number[];
  };
}

interface CityData {
  name: string;
  stateCode: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
}

// Constants
const COLORS = [
  "#0ea5e9", // sky
  "#06b6d4", // cyan
  "#22d3ee", // light cyan
  "#38bdf8", // light sky
  "#14b8a6", // teal
  "#10b981", // emerald
  "#f59e0b", // amber
  "#f97316", // orange
];

// Helper functions
const getWeatherIcon = (code: number) => {
  if (code === 0) return "☀️";
  if (code >= 1 && code <= 3) return "🌤️";
  if (code >= 45 && code <= 48) return "🌫️";
  if (code >= 51 && code <= 55) return "🌧️";
  if (code >= 56 && code <= 57) return "🌨️";
  if (code >= 61 && code <= 65) return "🌧️";
  if (code >= 66 && code <= 67) return "🌨️";
  if (code >= 71 && code <= 75) return "❄️";
  if (code >= 77 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌧️";
  if (code >= 85 && code <= 86) return "🌨️";
  if (code >= 95 && code <= 95) return "⛈️";
  if (code >= 96 && code <= 99) return "⛈️";
  return "🌤️";
};

const getDayName = (index: number) => {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const date = new Date();
  date.setDate(date.getDate() + index);
  return days[date.getDay()];
};

export default function WeatherPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async (city: CityData) => {
    if (!city.latitude || !city.longitude) {
      setError("Location coordinates not available");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&daily=weather_code,temperature_2m_min,temperature_2m_max,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration,uv_index_max,daylight_duration,sunshine_duration,uv_index_clear_sky_max,rain_sum,showers_sum,precipitation_sum,snowfall_sum,precipitation_hours,precipitation_probability_max&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure&timezone=auto`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setWeatherData(data);
        setCityData(city);
      } else {
        setError("Failed to fetch weather data");
      }
    } catch (err) {
      console.error("Weather API error:", err);
      setError("Failed to fetch weather data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      try {
        const decodedId = decodeURIComponent(id);
        const parsedCityData: CityData = JSON.parse(decodedId);
        setCityData(parsedCityData);
        fetchWeatherData(parsedCityData);
      } catch (err) {
        console.error("Error parsing city data:", err);
        setError("Invalid city data");
        setIsLoading(false);
      }
    } else {
      setError("No city data provided");
      setIsLoading(false);
    }
  }, [searchParams]);

  // Prepare chart data
  const temperatureChartData = useMemo(() => {
    if (!weatherData) return [];
    return weatherData.daily.temperature_2m_max.map((max, index) => ({
      day: getDayName(index),
      max: Math.round(max),
      min: Math.round(weatherData.daily.temperature_2m_min[index]),
    }));
  }, [weatherData]);

  const precipitationChartData = useMemo(() => {
    if (!weatherData) return [];
    return weatherData.daily.precipitation_sum.map((precip, index) => ({
      day: getDayName(index),
      precipitation: Math.round(precip * 10) / 10,
    }));
  }, [weatherData]);

  const weatherDistributionData = useMemo(() => {
    if (!weatherData) return [];
    const distribution: Record<string, number> = {};
    weatherData.daily.weather_code.forEach((code) => {
      const icon = getWeatherIcon(code);
      distribution[icon] = (distribution[icon] || 0) + 1;
    });
    return Object.entries(distribution).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
    }));
  }, [weatherData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Loading weather data...
          </p>
        </div>
      </div>
    );
  }

  if (error || !weatherData || !cityData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg text-center mb-4">
            {error || "Unable to load weather data"}
          </p>
          <Button
            onClick={() => router.back()}
            className="bg-sky-500 hover:bg-sky-600 text-white"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="icon"
          className="rounded-full"
        >
          <IoArrowBack className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-slate-700">
            Weather Dashboard
          </h2>
        </div>
        <div className="w-10" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <Card className="relative overflow-hidden border border-gray-100 shadow-lg bg-white/60 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/40 to-cyan-100/40 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-sky-100/30 to-blue-100/30 rounded-full translate-y-12 -translate-x-12" />

          <CardContent className="p-4 lg:p-6 relative">
            <div className="text-center mb-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-sky-500" />
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-700">
                  {cityData.name}
                </h1>
              </div>
              <div className="text-5xl lg:text-6xl font-bold text-sky-500 my-1">
                {Math.round(weatherData.current.temperature_2m)}°{" "}
                {getWeatherIcon(weatherData.current.weather_code)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
          {/* Humidity */}
          <Card className="relative overflow-hidden border border-gray-100 bg-white/70 backdrop-blur-sm group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-50 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-cyan-600">
                    {weatherData.current.relative_humidity_2m}%
                  </div>
                  <div className="text-sm font-medium text-slate-600">
                    Humidity
                  </div>
                </div>
                <div className="p-3 rounded-full bg-cyan-50">
                  <Droplets className="h-6 w-6 text-cyan-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wind Speed */}
          <Card className="relative overflow-hidden border border-gray-100 bg-white/70 backdrop-blur-sm group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-sky-50 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-sky-600">
                    {Math.round(weatherData.current.wind_speed_10m)} km/h
                  </div>
                  <div className="text-sm font-medium text-slate-600">
                    Wind Speed
                  </div>
                </div>
                <div className="p-3 rounded-full bg-sky-50">
                  <Wind className="h-6 w-6 text-sky-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pressure */}
          <Card className="relative overflow-hidden border border-gray-100 bg-white/70 backdrop-blur-sm group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-50 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-amber-600">
                    {Math.round(weatherData.current.pressure_msl)}
                  </div>
                  <div className="text-sm font-medium text-slate-600">
                    Pressure
                  </div>
                </div>
                <div className="p-3 rounded-full bg-amber-50">
                  <Gauge className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cloud Cover */}
          <Card className="relative overflow-hidden border border-gray-100 bg-white/70 backdrop-blur-sm group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-slate-600">
                    {weatherData.current.cloud_cover}%
                  </div>
                  <div className="text-sm font-medium text-slate-600">
                    Cloud Cover
                  </div>
                </div>
                <div className="p-3 rounded-full bg-slate-50">
                  <Cloud className="h-6 w-6 text-slate-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature Chart */}
          <Card className="border border-gray-100 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-50">
                  <Thermometer className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-xl">7-Day Temperature</CardTitle>
                  <CardDescription>High and low temperatures</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={temperatureChartData}>
                  <defs>
                    <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="max"
                    stroke="#0ea5e9"
                    fillOpacity={1}
                    fill="url(#colorMax)"
                  />
                  <Area
                    type="monotone"
                    dataKey="min"
                    stroke="#06b6d4"
                    fillOpacity={1}
                    fill="url(#colorMin)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Precipitation Chart */}
          <Card className="border border-gray-100 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-cyan-50">
                  <WiRain className="h-6 w-6 text-cyan-500" />
                </div>
                <div>
                  <CardTitle className="text-xl">Precipitation</CardTitle>
                  <CardDescription>Daily rainfall forecast</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={precipitationChartData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="precipitation"
                    fill="#22d3ee"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Weather Distribution & Today's Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weather Distribution Pie Chart */}
          <Card className="border border-gray-100 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-50">
                  <Sun className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Weather Distribution
                  </CardTitle>
                  <CardDescription>7-day weather types</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={weatherDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                    }
                    outerRadius={100}
                    fill="#0ea5e9"
                    dataKey="value"
                  >
                    {weatherDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Today's Details */}
          <Card className="border border-gray-100 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-slate-50">
                  <Sparkles className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <CardTitle className="text-xl">Today's Details</CardTitle>
                  <CardDescription>Current conditions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50/50">
                <div className="flex items-center gap-3">
                  <Thermometer className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-slate-700">
                    Temperature Range
                  </span>
                </div>
                <span className="font-bold text-blue-600">
                  {Math.round(weatherData.daily.temperature_2m_max[0])}° /{" "}
                  {Math.round(weatherData.daily.temperature_2m_min[0])}°
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-cyan-50/50">
                <div className="flex items-center gap-3">
                  <WiRain className="w-6 h-6 text-cyan-500" />
                  <span className="text-sm font-medium text-slate-700">
                    Precipitation
                  </span>
                </div>
                <span className="font-bold text-cyan-600">
                  {weatherData.daily.precipitation_sum[0]} mm
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-amber-50/50">
                <div className="flex items-center gap-3">
                  <WiSunrise className="w-6 h-6 text-amber-500" />
                  <span className="text-sm font-medium text-slate-700">
                    Sunrise
                  </span>
                </div>
                <span className="font-bold text-amber-600">
                  {weatherData.daily.sunrise[0].split("T")[1]}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-orange-50/50">
                <div className="flex items-center gap-3">
                  <WiSunset className="w-6 h-6 text-orange-500" />
                  <span className="text-sm font-medium text-slate-700">
                    Sunset
                  </span>
                </div>
                <span className="font-bold text-orange-600">
                  {weatherData.daily.sunset[0].split("T")[1]}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 7-Day Forecast */}
        <Card className="border border-gray-100 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-sky-100">
                <Cloud className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <CardTitle className="text-xl">7-Day Forecast</CardTitle>
                <CardDescription>Extended weather outlook</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 hover:shadow-md transition-all duration-300 border border-gray-100"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-base font-semibold text-slate-700 w-24">
                      {getDayName(index)}
                    </span>
                    <span className="text-4xl">
                      {getWeatherIcon(weatherData.daily.weather_code[index])}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-800">
                          {Math.round(
                            weatherData.daily.temperature_2m_max[index]
                          )}
                          °
                        </span>
                        <span className="text-sm text-slate-500">
                          /{" "}
                          {Math.round(
                            weatherData.daily.temperature_2m_min[index]
                          )}
                          °
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-sky-100 text-sky-700"
                  >
                    {weatherData.daily.precipitation_sum[index] > 0
                      ? `${weatherData.daily.precipitation_sum[index]}mm`
                      : "Dry"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
