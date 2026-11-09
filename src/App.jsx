
import { useState, useEffect, useCallback } from 'react';
import './App.css';
import Forecast from './components/Forecast';

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
  const [city, setCity] = useState(
    () => localStorage.getItem('lastCity') || ''
  );

  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [recentCities, setRecentCities] = useState(() => {
    const savedCities = localStorage.getItem('recentCities');
    return savedCities ? JSON.parse(savedCities) : [];
  });

  // Save recent searches
  useEffect(() => {
    localStorage.setItem(
      'recentCities',
      JSON.stringify(recentCities)
    );
  }, [recentCities]);

  // Update browser tab title
  useEffect(() => {
    document.title = weather
      ? `${weather.city} Weather | Weatherly`
      : 'Weatherly';
  }, [weather]);

  // Search for weather
  const handleSearch = useCallback(async (searchCity) => {
    if (!searchCity.trim()) {
      setError('Please enter a city name.');
      return;
    }

    setLoading(true);
    setError('');
    setWeather(null);
    setForecast([]);

    try {
      const locationResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchCity.trim())}&count=1&language=en&format=json`
      );

      if (!locationResponse.ok) {
        throw new Error('Could not search for this city.');
      }

      const locationData = await locationResponse.json();

      if (!locationData.results?.length) {
        throw new Error('City not found. Please try another city.');
      }

      const location = locationData.results[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`
      );

      if (!weatherResponse.ok) {
        throw new Error('Could not retrieve weather information.');
      }

      const weatherData = await weatherResponse.json();

      // Update weather information
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

      // Update five-day forecast
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

      // Save last successful city
      localStorage.setItem('lastCity', location.name);

      // Update recent search history
      setRecentCities((previousCities) => [
        location.name,
        ...previousCities.filter(
          (cityName) => cityName !== location.name
        )
      ].slice(0, 5));

      setCity(location.name);

    } catch (err) {
      setError(err.message);
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Restore the last searched city after the component mounts
  useEffect(() => {
    const savedCity = localStorage.getItem('lastCity');

    if (!savedCity) return;

    const timer = setTimeout(() => {
      handleSearch(savedCity);
    }, 0);

    return () => clearTimeout(timer);
  }, [handleSearch]);

  return (
    <div className="app">

      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="brand">
          <h1>
            <span className="brand-icon">☁️</span>
            Weatherly
          </h1>
        </div>

        <form
          className="search-box"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(city);
          }}
        >
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search any city..."
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </header>

      <main className="dashboard-content">

        {/* Recent Searches */}
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

        {/* Loading */}
        {loading && (
          <p className="loading-message">
            Getting weather information...
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="error">{error}</p>
        )}

        {/* Welcome Message */}
        {!loading && !error && !weather && (
          <section className="current-weather-card">
            <h2>Welcome to Weatherly!</h2>
            <p>Search for a city to explore its weather.</p>
          </section>
        )}

        {/* Current Weather Card */}
        {weather && (
          <section className="current-weather-card">

            <div className="weather-location">
              <div>
                <p className="weather-label">CURRENT WEATHER</p>

                <h2>
                  {weather.city}, {weather.country}
                </h2>

                <p className="weather-description">
                  {weather.description}
                </p>
              </div>

              <span className="weather-emoji">🌤️</span>
            </div>

            <div className="temperature">
              {Math.round(weather.temperature)}°
            </div>

            {/* Weather Metrics */}
            <section className="weather-metrics">

              <div className="metric-card">
                <span>🌡️</span>
                <p>Feels Like</p>
                <h3>{Math.round(weather.feelsLike)}°C</h3>
              </div>

              <div className="metric-card">
                <span>💧</span>
                <p>Humidity</p>
                <h3>{weather.humidity}%</h3>
              </div>

              <div className="metric-card">
                <span>💨</span>
                <p>Wind Speed</p>
                <h3>{weather.windSpeed} km/h</h3>
              </div>

            </section>
          </section>
        )}

        {/* Five-Day Forecast */}
        {weather && (
          <Forecast forecast={forecast} />
        )}

      </main>

      {/* Footer */}
      <footer className="app-footer">
        Weather data provided by Open-Meteo
      </footer>

    </div>
  );
}

export default App;
