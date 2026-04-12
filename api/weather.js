const airportWeatherLocations = {
  YYZ: {
    code: "YYZ",
    name: "Toronto Pearson International Airport",
    latitude: 43.6777,
    longitude: -79.6248,
  },
  CLT: {
    code: "CLT",
    name: "Charlotte Douglas International Airport",
    latitude: 35.214,
    longitude: -80.9431,
  },
};

const weatherCache = new Map();
const WEATHER_CACHE_TTL_MS = 10 * 60 * 1000;

function normalizeAirportCode(value) {
  if (typeof value !== "string") {
    return "YYZ";
  }

  const code = value.trim().toUpperCase();
  return airportWeatherLocations[code] ? code : "YYZ";
}

function getAirportWeatherLocation(query = {}) {
  const raw = Array.isArray(query.airport) ? query.airport[0] : query.airport;
  const code = normalizeAirportCode(raw);
  return airportWeatherLocations[code] || airportWeatherLocations.YYZ;
}

function buildWeatherUrl(location) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(location.latitude));
  url.searchParams.set("longitude", String(location.longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day",
  );
  url.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
  );
  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "auto");

  return url;
}

async function fetchWeather(location) {
  if (typeof fetch !== "function") {
    throw new Error("Fetch API unavailable in current Node runtime");
  }

  const cacheKey = location.code;
  const cached = weatherCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.updatedAt <= WEATHER_CACHE_TTL_MS) {
    return cached.payload;
  }

  const url = buildWeatherUrl(location);
  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Weather provider responded with ${response.status}`);
  }

  const payload = await response.json();

  const shaped = {
    airportCode: location.code,
    airportName: location.name,
    source: "open-meteo",
    fetchedAt: new Date().toISOString(),
    timezone: payload.timezone || "UTC",
    currentUnits: payload.current_units || {},
    dailyUnits: payload.daily_units || {},
    current: payload.current || {},
    daily: {
      temperatureMax: Array.isArray(payload.daily?.temperature_2m_max)
        ? payload.daily.temperature_2m_max[0]
        : null,
      temperatureMin: Array.isArray(payload.daily?.temperature_2m_min)
        ? payload.daily.temperature_2m_min[0]
        : null,
      precipitationProbabilityMax: Array.isArray(payload.daily?.precipitation_probability_max)
        ? payload.daily.precipitation_probability_max[0]
        : null,
    },
  };

  weatherCache.set(cacheKey, {
    updatedAt: now,
    payload: shaped,
  });

  return shaped;
}

module.exports = async function weatherHandler(req, res) {
  const location = getAirportWeatherLocation(req.query || {});

  try {
    const weather = await fetchWeather(location);
    res.json(weather);
  } catch (error) {
    res.status(502).json({
      airportCode: location.code,
      airportName: location.name,
      source: "open-meteo",
      error: "Unable to fetch weather right now",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};