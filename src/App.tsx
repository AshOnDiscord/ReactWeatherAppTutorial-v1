import { WeatherApiResponse } from "@openmeteo/sdk/weather-api-response";
import { useState } from "react";

function App() {
  const [query, setQuery] = useState("");

  return (
    <>
      <form>
        <input
          placeholder="Location"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button>search</button>
      </form>
      <p>{query}</p>
    </>
  );
}

export default App;
