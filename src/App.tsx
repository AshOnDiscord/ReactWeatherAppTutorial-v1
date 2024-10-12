import { WeatherApiResponse } from "@openmeteo/sdk/weather-api-response";
import { useState } from "react";

function App() {
  const [query, setQuery] = useState("");

  return (
    <>
      <form className="search">
        <input
          placeholder="Location"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button>search</button>
      </form>
      <p
        style={{
          textAlign: "center",
          fontSize: "1.5rem",
        }}
      >
        {query}
      </p>
    </>
  );
}

export default App;
