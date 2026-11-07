import { useState, useEffect } from 'react';
import './App.css';
import Forecast from './components/Forecast';

// Convert weather codes into readable descriptions
function getWeatherDescription(code) {
  const descriptions = {
    0: 'Clear sky ☀️',
    1: 'Mainly clear 🌤️',
    2: 'Partly cloudy ⛅',
    3: 'Overcast ☁️',
    45: 'Fog 🌫️',
    48: 'Depositing rime fog 🌫️',
    51: 'Light drizzle 🌦️',
    53: 'Moderate drizzle 🌦️',
    55: 'Dense drizzle 🌧️',
    61: 'Slight rain 🌧️',
    63: 'Moderate rain 🌧️',
    65: 'Heavy rain 🌧️',
    71: 'Slight snowfall ❄️',
    73: 'Moderate snowfall ❄️',
    75: 'Heavy snowfall ❄️',
    80: 'Rain showers 🌦️',
    81: 'Moderate rain showers 🌧️',
    82: 'Heavy rain showers 🌧️',
    95: 'Thunderstorm ⛈️',
    96: 'Thunderstorm with hail ⛈️',
    99: 'Heavy thunderstorm with hail ⛈️'
  };

  return descriptions[code] || 'Weather conditions unavailable';
}

function App() {
  // React states
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentCities, setRecentCities] = useState(() => {
  const savedCities = localStorage.getItem('recentCities');

  return savedCities ? JSON.parse(savedCities) : [];
  });

  
useEffect(() => {
  localStorage.setItem(
    'recentCities',
    JSON.stringify(recentCities)
  );
}, [recentCities]);

  useEffect(() => {
    if (weather) {
      document.title = `${weather.city} Weather | Weather App`;
    } else {
      document.title = 'Weather App';
    }
  }, [weather]);

  useEffect(() => {
  localStorage.setItem(
    'recentCities',
    JSON.stringify(recentCities)
  );
}, [recentCities]);

  // Search for weather
  async function handleSearch() {
    if (!city.trim()) {
      setError('Please enter a city name.');
      setWeather(null);
      setForecast([]);
      return;
    }

    setLoading(true);
    setError('');
    setWeather(null);
    setForecast([]);

    try {
      // Step 1: Find city coordinates
      const locationResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=1&language=en&format=json`
      );

      if (!locationResponse.ok) {
        throw new Error('Could not search for this city.');
      }

      const locationData = await locationResponse.json();

      if (!locationData.results?.length) {
        throw new Error('City not found. Please try another city.');
      }

      const location = locationData.results[0];
      setRecentCities((previousCities) => [
        location.name,
        ...previousCities.filter(
          (cityName) => cityName !== location.name
        )
      ].slice(0, 5));

      // Step 2: Get current weather and five-day forecast
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`
      );

      if (!weatherResponse.ok) {
        throw new Error('Could not retrieve weather information.');
      }

      const weatherData = await weatherResponse.json();

      // Step 3: Save current weather
      setWeather({
        city: location.name,
        country: location.country,
        temperature: weatherData.current.temperature_2m,
        feelsLike: weatherData.current.apparent_temperature,
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: weatherData.current.wind_speed_10m,
        description: getWeatherDescription(
          weatherData.current.weather_code
        )
      });

      // Step 4: Save five-day forecast
      setForecast(
        weatherData.daily.time.map((date, index) => ({
          date,
          max: weatherData.daily.temperature_2m_max[index],
          min: weatherData.daily.temperature_2m_min[index],
          description: getWeatherDescription(
            weatherData.daily.weather_code[index]
          )
        }))
      );

    } catch (err) {
      setError(err.message);
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="weather-app">

      <header className="app-header">
        <h1>Weather App</h1>
        <p>Check the weather in your city</p>
      </header>

      {/* City search */}
      <section className="search-section">
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(event) => setCity(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleSearch();
            }
          }}
        />

        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </section>
     {recentCities.length > 0 && (
      <section className="recent-section">
        <div className="recent-header">
          <h3>Recently Searched</h3>

          <button
            className="clear-button"
            onClick={() => setRecentCities([])}
          >
            Clear History
          </button>
        </div>

        <div className="recent-list">
          {recentCities.map((cityName) => (
            <button
              key={cityName}
              onClick={() => setCity(cityName)}
            >
              {cityName}
            </button>
          ))}
        </div>
      </section>
    )}

      {/* Weather information */}
      <section className="weather-card">

        {loading && (
          <p>Getting weather information...</p>
        )}

        {error && (
          <p className="error">{error}</p>
        )}

        {weather && (
          <>
            <h2>
              {weather.city}, {weather.country}
            </h2>

            <h1>{weather.temperature}°C</h1>

            <h3 className="weather-description">
              {weather.description}
            </h3>

            <p>Feels like: {weather.feelsLike}°C</p>
            <p>Humidity: {weather.humidity}%</p>
            <p>Wind speed: {weather.windSpeed} km/h</p>

            {/* Five-day forecast */}
            <Forecast forecast={forecast} />
          </>
        )}

        {!loading && !error && !weather && (
          <>
            <h2>Welcome!</h2>
            <p>Search for a city to get started.</p>
          </>
        )}

      </section>

      <footer>
        Weather data provided by Open-Meteo
      </footer>

    </main>
  );
}

export default App;
