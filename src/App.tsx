import { Unit } from "@openmeteo/sdk/unit";
import { fetchWeatherApi } from "openmeteo";
import { FormEvent, useEffect, useState } from "react";
import CodeIcons from "./icons";

const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  admin2?: string;
  admin3?: string;
  admin4?: string;
  country: string;
}

const getLocationDisplay = (location: Location) => {
  return [
    location.name,
    location.admin1,
    location.admin2,
    location.admin3,
    location.admin4,
  ]
    .filter((field) => field)
    .join(", ");
};

interface WeatherData {
  date: Date;
  code: number;
  min: number;
  max: number;
}

function App() {
  const [query, setQuery] = useState<string>("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      name: query,
      count: "10",
      language: "en",
      format: "json",
    });
    const req = await fetch(`${GEOCODING_URL}?${params.toString()}`, {
      mode: "cors",
    });
    const data: {
      results: Location[];
    } = await req.json();
    console.log(data);
    setLocations(data.results);
    setQuery("");
  };

  useEffect(() => {
    console.log("Location", currentLocation);
    if (!currentLocation) return;
    console.log(
      "lat:",
      currentLocation.latitude,
      "long:",
      currentLocation.longitude,
    );
    fetchWeather();
  }, [currentLocation]);

  const fetchWeather = async () => {
    const params = {
      latitude: [currentLocation?.latitude],
      longitude: [currentLocation?.longitude],
      daily: "weather_code,temperature_2m_max,temperature_2m_min",
      temperature_unit: "fahrenheit",
      wind_speed_unit: "mph",
      precipitation_unit: "inch",
    };
    const responses = await fetchWeatherApi(WEATHER_URL, params);

    // Helper function to form time ranges
    const range = (start: number, stop: number, step: number) =>
      Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

    // Process first location. Add a for-loop for multiple locations or weather models
    const response = responses[0];

    // Attributes for timezone and location
    const utcOffsetSeconds = response.utcOffsetSeconds();

    const daily = response.daily()!;

    const weatherData: WeatherData[] = range(
      Number(daily.time()),
      Number(daily.timeEnd()),
      daily.interval(),
    ).map((t, i) => ({
      date: new Date((t + utcOffsetSeconds) * 1000),
      code: daily.variables(0)!.valuesArray()![i],
      min: daily.variables(2)!.valuesArray()![i],
      max: daily.variables(1)!.valuesArray()![i],
    }));
    setWeatherData(weatherData);
    console.log(weatherData);
  };

  return (
    <>
      <form className="search" onSubmit={handleSearch}>
        <input
          placeholder="Location"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button>search</button>
      </form>
      <ul>
        {locations.map((location) => (
          <li key={location.id}>
            <button onClick={() => setCurrentLocation(location)}>
              {getLocationDisplay(location)}
            </button>
          </li>
        ))}
      </ul>
      <ul
        style={{
          display: "flex",
          gap: "2rem",
          justifyContent: "center",
        }}
      >
        {weatherData.map((data) => (
          <li
            style={{
              background: "#3b82f6",
              color: "#fff",
              fontWeight: "semibold",
              padding: "1rem 1.5rem",
              borderRadius: "0.5rem",
            }}
          >
            <div>
              {data.date.toLocaleDateString("en-us", { weekday: "short" })}
            </div>
            <div
              style={{
                background: "#7dd3fc",
                borderRadius: "0.5rem",
                margin: "0.5rem 0",
              }}
            >
              <img
                src={
                  CodeIcons[`${data.code}` as keyof typeof CodeIcons].day.image
                }
              />
              <p
                style={{
                  textAlign: "center",
                  paddingBottom: "0.5rem",
                }}
              >
                {
                  CodeIcons[`${data.code}` as keyof typeof CodeIcons].day
                    .description
                }
              </p>
            </div>
            <p>
              <span>{Math.round(data.min)}°</span>-
              <span>{Math.round(data.max)}°</span>
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
