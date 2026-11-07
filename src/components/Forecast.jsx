function Forecast({ forecast }) {
  return (
    <div className="forecast-section">
      <h3>5-Day Forecast</h3>

      <div className="forecast-list">
        {forecast.map((day) => (
          <div className="forecast-item" key={day.date}>
            <p>
              {new Date(`${day.date}T00:00:00`).toLocaleDateString(
                'en-IN',
                {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                }
              )}
            </p>

            <p>{day.description}</p>

            <strong>
              {day.max}°C / {day.min}°C
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Forecast;