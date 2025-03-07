// src/hooks/useWeatherData.ts
import { useEffect, useState } from "react";

interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  loading: boolean;
  error: boolean;
}

export const useWeatherData = () => {
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 0,
    apparentTemperature: 0,
    weatherCode: 0,
    loading: true,
    error: false
  });

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const latitude = 40.2033;  // Coimbra
        const longitude = -8.4103;

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code&timezone=auto`
        );

        if (!response.ok) throw new Error("Weather data fetch failed");

        const data = await response.json();

        setWeatherData({
          temperature: Math.round(data.current.temperature_2m),
          apparentTemperature: Math.round(data.current.apparent_temperature),
          weatherCode: data.current.weather_code,
          loading: false,
          error: false
        });
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setWeatherData(prev => ({
          ...prev,
          loading: false,
          error: true
        }));
      }
    };

    fetchWeatherData();
    const intervalId = setInterval(fetchWeatherData, 30 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Weather description helper function
  const getWeatherDescription = (code: number) => {
    if (code === 0) return "Clear sky";
    if (code === 1) return "Mainly clear";
    if (code === 2) return "Partly cloudy";
    if (code === 3) return "Overcast";
    if (code >= 45 && code <= 48) return "Fog";
    if (code >= 51 && code <= 57) return "Drizzle";
    if (code >= 61 && code <= 67) return "Rain";
    if (code >= 71 && code <= 77) return "Snow";
    if (code >= 80 && code <= 82) return "Rain showers";
    if (code >= 85 && code <= 86) return "Snow showers";
    if (code >= 95) return "Thunderstorm";
    return "Unknown";
  };

  return {
    weatherData,
    getWeatherDescription
  };
};