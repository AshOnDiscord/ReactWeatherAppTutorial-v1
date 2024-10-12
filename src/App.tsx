import { fetchWeatherApi } from "openmeteo";
import { FormEvent, useEffect, useState } from "react";

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

function App() {
  const [query, setQuery] = useState<string>("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

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
  }, [currentLocation]);

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
    </>
  );
}

export default App;
