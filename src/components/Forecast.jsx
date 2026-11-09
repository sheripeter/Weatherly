
function Forecast({ forecast }) {
  if (!forecast || forecast.length === 0) {
    return null;
  }

  return (
    <section className="forecast-section">
      <div className="forecast-heading">
        <div>
          <p className="forecast-label">WEATHER OUTLOOK</p>
          <h2>5-Day Forecast</h2>
        </div>
      </div>

      <div className="forecast-grid">
        {forecast.map((day, index) => (
          <article className="forecast-card" key={day.date}>
            <p className="forecast-day">
              {index === 0
                ? 'Today'
                : new Date(`${day.date}T00:00:00`).toLocaleDateString(
                    'en-IN',
                    { weekday: 'short' }
                  )}
            </p>

            <p className="forecast-date">
              {new Date(`${day.date}T00:00:00`).toLocaleDateString(
                'en-IN',
                { day: 'numeric', month: 'short' }
              )}
            </p>

            <div className="forecast-icon">
              {day.description.includes('Rain') ||
              day.description.includes('drizzle')
                ? '🌧️'
                : day.description.includes('cloud') ||
                  day.description.includes('Overcast')
                ? '☁️'
                : day.description.includes('snow')
                ? '❄️'
                : day.description.includes('Thunderstorm')
                ? '⛈️'
                : '☀️'}
            </div>

            <p className="forecast-description">
              {day.description}
            </p>

            <div className="forecast-temperatures">
              <strong>{Math.round(day.max)}°</strong>
              <span>{Math.round(day.min)}°</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Forecast;
