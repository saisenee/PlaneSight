const airportConfig = {
  code: "YYZ",
  name: "Toronto Pearson International Airport",
};

const airportMetaCache = new Map();
const flightsCache = {
  arrival: null,
  departure: null,
};

function getConfig() {
  return {
    aviationStackApiKey: process.env.AVIATIONSTACK_API_KEY || "",
    aviationStackBaseUrl:
      process.env.AVIATIONSTACK_BASE_URL || "http://api.aviationstack.com",
    enableAirportEnrichment: process.env.AVIATIONSTACK_ENRICH_AIRPORTS === "true",
    freezeAviationStack: process.env.AVIATIONSTACK_FREEZE === "true",
  };
}

function placeholderResponse(type, message) {
  return {
    airportCode: airportConfig.code,
    airportName: airportConfig.name,
    type,
    count: 0,
    lastUpdated: new Date().toISOString(),
    source: "aviationstack",
    placeholder: true,
    flights: [],
    message,
  };
}

const passthroughParams = [
  "limit",
  "offset",
  "flight_status",
  "flight_date",
  "airline_name",
  "airline_iata",
  "airline_icao",
  "flight_number",
  "flight_iata",
  "flight_icao",
  "min_delay_dep",
  "min_delay_arr",
  "max_delay_dep",
  "max_delay_arr",
  "arr_scheduled_time_arr",
  "dep_scheduled_time_dep",
];

function readQueryValue(query, key) {
  const value = query && query[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function buildAviationStackUrl(type, query = {}) {
  const config = getConfig();
  const url = new URL("/v1/flights", config.aviationStackBaseUrl);

  url.searchParams.set("access_key", config.aviationStackApiKey);
  url.searchParams.set("limit", String(readQueryValue(query, "limit") || 20));

  for (const key of passthroughParams) {
    const value = readQueryValue(query, key);

    if (typeof value === "string" && value.trim()) {
      url.searchParams.set(key, value.trim());
    }
  }

  if (type === "arrival") {
    url.searchParams.set("arr_iata", airportConfig.code);
  } else {
    url.searchParams.set("dep_iata", airportConfig.code);
  }

  return url.toString();
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeCode(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const code = value.trim().toUpperCase();
  return code || null;
}

function buildAirportMetaUrl(iata, icao) {
  const config = getConfig();
  const url = new URL("/v1/airports", config.aviationStackBaseUrl);

  url.searchParams.set("access_key", config.aviationStackApiKey);
  url.searchParams.set("limit", "1");

  if (iata) {
    url.searchParams.set("iata_code", iata);
  } else if (icao) {
    url.searchParams.set("icao_code", icao);
  }

  return url.toString();
}

async function fetchAirportMeta(iata, icao) {
  const iataCode = normalizeCode(iata);
  const icaoCode = normalizeCode(icao);
  const cacheKey = `${iataCode || ""}:${icaoCode || ""}`;

  if (!iataCode && !icaoCode) {
    return null;
  }

  if (airportMetaCache.has(cacheKey)) {
    return airportMetaCache.get(cacheKey);
  }

  try {
    const response = await fetch(buildAirportMetaUrl(iataCode, icaoCode), {
      cache: "no-store",
    });

    if (!response.ok) {
      airportMetaCache.set(cacheKey, null);
      return null;
    }

    const payload = await response.json();
    const airport = payload && payload.data && payload.data[0];

    if (!airport) {
      airportMetaCache.set(cacheKey, null);
      return null;
    }

    const meta = {
      iata: normalizeCode(airport.iata_code) || iataCode,
      icao: normalizeCode(airport.icao_code) || icaoCode,
      airportName: airport.airport_name || null,
      countryCode:
        normalizeCode(airport.country_iso2) || normalizeCode(airport.country_code),
      countryName: airport.country_name || null,
      latitude: toNumber(airport.latitude),
      longitude: toNumber(airport.longitude),
    };

    airportMetaCache.set(cacheKey, meta);
    return meta;
  } catch {
    airportMetaCache.set(cacheKey, null);
    return null;
  }
}

function lookupAirportMeta(map, iata, icao) {
  const iataCode = normalizeCode(iata);
  const icaoCode = normalizeCode(icao);
  const key = `${iataCode || ""}:${icaoCode || ""}`;
  return map.get(key) || null;
}

async function buildAirportLookup(flights) {
  if (!getConfig().enableAirportEnrichment) {
    return new Map();
  }

  const lookup = new Map();
  const uniqueKeys = new Set();
  const requests = [];

  for (const flight of flights || []) {
    const depIata = normalizeCode(flight && flight.departure && flight.departure.iata);
    const depIcao = normalizeCode(flight && flight.departure && flight.departure.icao);
    const arrIata = normalizeCode(flight && flight.arrival && flight.arrival.iata);
    const arrIcao = normalizeCode(flight && flight.arrival && flight.arrival.icao);

    const pairs = [
      { iata: depIata, icao: depIcao },
      { iata: arrIata, icao: arrIcao },
    ];

    for (const pair of pairs) {
      const key = `${pair.iata || ""}:${pair.icao || ""}`;

      if ((pair.iata || pair.icao) && !uniqueKeys.has(key)) {
        uniqueKeys.add(key);
        requests.push(
          fetchAirportMeta(pair.iata, pair.icao).then((meta) => {
            lookup.set(key, meta);
          }),
        );
      }
    }
  }

  await Promise.all(requests);
  return lookup;
}

function normalizeFlights(flights, type, airportLookup) {
  return (flights || []).map((flight, index) => {
    const segment = type === "arrival" ? flight.arrival : flight.departure;
    const departureMeta = lookupAirportMeta(
      airportLookup,
      flight && flight.departure && flight.departure.iata,
      flight && flight.departure && flight.departure.icao,
    );
    const arrivalMeta = lookupAirportMeta(
      airportLookup,
      flight && flight.arrival && flight.arrival.iata,
      flight && flight.arrival && flight.arrival.icao,
    );
    const fallbackId = [
      type,
      (flight.flight && (flight.flight.iata || flight.flight.number)) || "unknown",
      (segment && segment.scheduled) || flight.flight_date || String(index),
      String(index),
    ].join("-");

    return {
      id: fallbackId,
      airline: (flight.airline && flight.airline.name) || "Unknown airline",
      flightNumber: (flight.flight && flight.flight.number) || "—",
      flightIata:
        (flight.flight && (flight.flight.iata || flight.flight.icao)) || "—",
      aircraftId:
        (flight.aircraft && (flight.aircraft.registration || flight.aircraft.icao24)) ||
        (flight.flight && (flight.flight.icao || flight.flight.iata)) ||
        "Unknown",
      departureIata:
        normalizeCode(flight && flight.departure && flight.departure.iata) ||
        (departureMeta && departureMeta.iata) ||
        "—",
      departureIcao:
        normalizeCode(flight && flight.departure && flight.departure.icao) ||
        (departureMeta && departureMeta.icao) ||
        null,
      arrivalIata:
        normalizeCode(flight && flight.arrival && flight.arrival.iata) ||
        (arrivalMeta && arrivalMeta.iata) ||
        "—",
      arrivalIcao:
        normalizeCode(flight && flight.arrival && flight.arrival.icao) ||
        (arrivalMeta && arrivalMeta.icao) ||
        null,
      departureCountryCode:
        normalizeCode(flight && flight.departure && flight.departure.country_iso2) ||
        normalizeCode(flight && flight.departure && flight.departure.country_code) ||
        (departureMeta && departureMeta.countryCode) ||
        null,
      arrivalCountryCode:
        normalizeCode(flight && flight.arrival && flight.arrival.country_iso2) ||
        normalizeCode(flight && flight.arrival && flight.arrival.country_code) ||
        (arrivalMeta && arrivalMeta.countryCode) ||
        null,
      departureLat:
        toNumber(flight && flight.departure && flight.departure.latitude) ||
        (departureMeta && departureMeta.latitude) ||
        null,
      departureLon:
        toNumber(flight && flight.departure && flight.departure.longitude) ||
        (departureMeta && departureMeta.longitude) ||
        null,
      arrivalLat:
        toNumber(flight && flight.arrival && flight.arrival.latitude) ||
        (arrivalMeta && arrivalMeta.latitude) ||
        null,
      arrivalLon:
        toNumber(flight && flight.arrival && flight.arrival.longitude) ||
        (arrivalMeta && arrivalMeta.longitude) ||
        null,
      departureAirport:
        (flight.departure && flight.departure.airport) ||
        (departureMeta && departureMeta.airportName) ||
        "Unknown origin",
      arrivalAirport:
        (flight.arrival && flight.arrival.airport) ||
        (arrivalMeta && arrivalMeta.airportName) ||
        "Unknown destination",
      scheduledTime: (segment && segment.scheduled) || null,
      actualTime: (segment && (segment.actual || segment.estimated)) || null,
      terminal: (segment && segment.terminal) || null,
      gate: (segment && segment.gate) || null,
      status: flight.flight_status || "unknown",
      isLive: Boolean(flight.live),
    };
  });
}

async function loadFlights(type, query) {
  const response = await fetch(buildAviationStackUrl(type, query), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`AviationStack request failed with ${response.status}`);
  }

  const payload = await response.json();

  if (payload.error) {
    throw new Error(payload.error.message || "AviationStack returned an error.");
  }

  const airportLookup = await buildAirportLookup(payload.data || []);
  return normalizeFlights(payload.data, type, airportLookup);
}

function getCachedPayload(type) {
  const cached = flightsCache[type];

  if (!cached) {
    return null;
  }

  const ageMs = Date.now() - cached.updatedAt;

  return {
    airportCode: airportConfig.code,
    airportName: airportConfig.name,
    type,
    count: cached.flights.length,
    lastUpdated: new Date(cached.updatedAt).toISOString(),
    source: "aviationstack",
    placeholder: true,
    stale: true,
    staleAgeMinutes: Math.round(ageMs / 60000),
    flights: cached.flights,
    message: `Live API rate limit reached. Showing cached ${type} data from ${Math.round(ageMs / 60000)} minute(s) ago.`,
  };
}

module.exports = async function handler(req, res) {
  const type = req.query.type;

  if (type !== "arrival" && type !== "departure") {
    return res
      .status(400)
      .json({ message: "Query parameter 'type' must be 'arrival' or 'departure'." });
  }

  if (!getConfig().aviationStackApiKey) {
    return res.json(
      placeholderResponse(type, "Set AVIATIONSTACK_API_KEY to load live AviationStack data."),
    );
  }

  if (getConfig().freezeAviationStack) {
    const cachedPayload = getCachedPayload(type);

    if (cachedPayload) {
      return res.json({
        ...cachedPayload,
        message: `Live API calls are currently frozen. Showing cached ${type} data from ${cachedPayload.staleAgeMinutes} minute(s) ago.`,
      });
    }

    return res.json(
      placeholderResponse(
        type,
        "Live API calls are currently frozen (AVIATIONSTACK_FREEZE=true). Refreshing is disabled until unfrozen.",
      ),
    );
  }

  try {
    const flights = await loadFlights(type, req.query);

    flightsCache[type] = {
      flights,
      updatedAt: Date.now(),
    };

    return res.json({
      airportCode: airportConfig.code,
      airportName: airportConfig.name,
      type,
      count: flights.length,
      lastUpdated: new Date().toISOString(),
      source: "aviationstack",
      placeholder: false,
      flights,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch live flight data.";
    const rateLimited = message.includes(" 429");
    const cachedPayload = getCachedPayload(type);

    if (rateLimited && cachedPayload) {
      return res.json(cachedPayload);
    }

    return res.json({
      ...placeholderResponse(
        type,
        rateLimited
          ? "AviationStack rate limit reached. Refresh less frequently or wait for reset."
          : message,
      ),
      placeholder: true,
    });
  }
};
