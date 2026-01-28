"use client";

import { CircleArrowUp, CloudSunRain, Loader2, MapPinOff, Cloud, Sun, CloudRain, CloudSnow, CloudLightning } from "lucide-react";
import { useState, useEffect } from "react";

export default function WeatherCard() {
    const [weather, setWeather] = useState<any>(null);
    const [locationName, setLocationName] = useState("Loading...");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Location not supported");
            setLoading(false);
            setLocationName("Location N/A");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // Fetch Weather
                    const weatherRes = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
                    );
                    const weatherData = await weatherRes.json();

                    // Fetch Location Name (Reverse Geocoding)
                    try {
                        const locationRes = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );
                        const locationData = await locationRes.json();
                        // Try to get city, town, village, or falling back to a broader area
                        const address = locationData.address;
                        const city = address.city || address.town || address.village || address.suburb || address.county || "My Location";
                        setLocationName(city);
                    } catch (err) {
                        console.error("Failed to fetch location name", err);
                        setLocationName("My Location");
                    }

                    setWeather(weatherData);
                    setLoading(false);
                } catch (err) {
                    setError("Failed to fetch weather");
                    setLoading(false);
                }
            },
            (err) => {
                console.error(err);
                setError("Location Access Denied");
                setLocationName("Location Denied");
                setLoading(false);
            }
        );
    }, []);

    // WMO Weather Codes mapping
    const getWeatherIcon = (code: number) => {
        if (code === 0 || code === 1) return <Sun className="h-10 w-10 text-yellow-500 mr-2" />;
        if (code === 2 || code === 3) return <CloudSunRain className="h-10 w-10 text-orange-400 mr-2" />; // Partly cloudy
        if (code >= 45 && code <= 48) return <Cloud className="h-10 w-10 text-gray-400 mr-2" />; // Fog
        if (code >= 51 && code <= 67) return <CloudRain className="h-10 w-10 text-blue-400 mr-2" />; // Drizzle/Rain
        if (code >= 71 && code <= 77) return <CloudSnow className="h-10 w-10 text-white mr-2" />; // Snow
        if (code >= 80 && code <= 82) return <CloudRain className="h-10 w-10 text-blue-500 mr-2" />; // Showers
        if (code >= 95 && code <= 99) return <CloudLightning className="h-10 w-10 text-yellow-600 mr-2" />; // Thunderstorm
        return <CloudSunRain className="h-10 w-10 text-yellow-500 mr-2" />;
    };

    if (loading) {
        return (
            <div className="relative flex size-52 flex-col items-center justify-center rounded-3xl bg-opacity-10 bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-padding p-4 backdrop-blur-sm backdrop-filter dark:from-gray-700 dark:to-gray-900 border border-white/10 shadow-lg">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                <p className="text-xs text-slate-500 mt-2">Locating...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative flex size-52 flex-col items-center justify-center rounded-3xl bg-opacity-10 bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-padding p-4 backdrop-blur-sm backdrop-filter dark:from-gray-700 dark:to-gray-900 border border-white/10 shadow-lg text-center">
                <MapPinOff className="h-8 w-8 text-red-500 mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{error}</p>
                <p className="text-xs text-slate-500">Enable location access</p>
            </div>
        );
    }

    return (
        <div className="relative flex size-52 flex-col rounded-3xl bg-opacity-10 bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-padding p-4 backdrop-blur-sm backdrop-filter dark:from-gray-700 dark:to-gray-900 border border-white/10 shadow-lg">
            <div className="flex flex-1 flex-col gap-2 dark:text-white">
                <p className="city opacity-70 truncate" title={locationName}>{locationName}</p>
                <div className="flex items-center">
                    {getWeatherIcon(weather?.current?.weather_code || 0)}
                    <p className="text-5xl font-black">{Math.round(weather?.current?.temperature_2m || 0)}&deg;</p>
                </div>
                <p className="feels-like opacity-70 text-sm">Feels like {Math.round(weather?.current?.apparent_temperature || 0)}&deg;</p>
            </div>
            <div className="flex justify-between rounded-xl bg-gray-400 bg-opacity-30 bg-clip-padding py-1 backdrop-blur-lg backdrop-filter">
                <div className="flex items-center gap-1 px-2 text-orange-500 dark:text-orange-200">
                    <CircleArrowUp className="h-4 w-4" />
                    <span className="text-sm">{Math.round(weather?.daily?.temperature_2m_max?.[0] || 0)}&deg;</span>
                </div>
                <p className="text-black opacity-50 dark:text-white">|</p>
                <div className="flex items-center gap-1 px-3 text-green-800 dark:text-green-200">
                    <CircleArrowUp className="h-4 w-4 rotate-180" />
                    <span className="text-sm">{Math.round(weather?.daily?.temperature_2m_min?.[0] || 0)}&deg;</span>
                </div>
            </div>
        </div>
    );
}
