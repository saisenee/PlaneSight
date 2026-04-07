const airportConfigs = {
  YYZ: {
    code: "YYZ",
    name: "Toronto Pearson International Airport",
  },
  CLT: {
    code: "CLT",
    name: "Charlotte Douglas International Airport",
  },
};

const airportMetaCache = new Map();
const flightsCache = {};
const flightsTtlCache = new Map();

// ICAO24 code to aircraft model mapping (Option 2)
// Maps ICAO24 transponder codes to aircraft model names
const aircraftModelLookup = {
  // Airbus (common aircraft codes starting with A)
  A20N: "Airbus A220",
  A300: "Airbus A300",
  A310: "Airbus A310",
  A319: "Airbus A319",
  A320: "Airbus A320",
  A321: "Airbus A321",
  A330: "Airbus A330",
  A340: "Airbus A340",
  A350: "Airbus A350",
  A380: "Airbus A380",
  A32N: "Airbus A320neo",
  A32L: "Airbus A320",
  A21N: "Airbus A220neo",
  A33N: "Airbus A330neo",
  A35K: "Airbus A350-1000",
  A359: "Airbus A350-900",
  
  // Boeing (common aircraft codes starting with B)
  B717: "Boeing 717",
  B721: "Boeing 727-100",
  B722: "Boeing 727-200",
  B732: "Boeing 737-200",
  B734: "Boeing 737-400",
  B735: "Boeing 737-500",
  B736: "Boeing 737-600",
  B737: "Boeing 737-700",
  B738: "Boeing 737-800",
  B739: "Boeing 737-900",
  B73J: "Boeing 737 MAX 8",
  B73H: "Boeing 737-800",
  B73F: "Boeing 737-700",
  B73E: "Boeing 737",
  B7M9: "Boeing 737 MAX 9",
  B741: "Boeing 747-100",
  B742: "Boeing 747-200",
  B744: "Boeing 747-400",
  B748: "Boeing 747-8",
  B751: "Boeing 757-100",
  B752: "Boeing 757-200",
  B761: "Boeing 767-100",
  B762: "Boeing 767-200",
  B763: "Boeing 767-300",
  B764: "Boeing 767-400",
  B771: "Boeing 777-100",
  B772: "Boeing 777-200",
  B77L: "Boeing 777-200LR",
  B77W: "Boeing 777-300ER",
  B77X: "Boeing 777X",
  B787: "Boeing 787-8",
  B788: "Boeing 787-8",
  B789: "Boeing 787-9",
  B78X: "Boeing 787-10",
  B790: "Boeing 787",
  
  // Bombardier (CRJ and DHC series)
  CRJ2: "Bombardier CRJ-200",
  CRJ7: "Bombardier CRJ-700",
  CRJ8: "Bombardier CRJ-800",
  CRJ9: "Bombardier CRJ-900",
  CRJ1: "Bombardier CRJ-1000",
  DH1: "Bombardier DHC-8-100",
  DH2: "Bombardier DHC-8-200",
  DH3: "Bombardier DHC-8-300",
  DH4: "Bombardier DHC-8-400",
  
  // Embraer (E-series regional jets)
  E170: "Embraer E170",
  E175: "Embraer E175",
  E75L: "Embraer E175",
  E190: "Embraer E190",
  E195: "Embraer E195",
  E50P: "Embraer E50",
  E545: "Embraer Legacy 450",
  E55P: "Embraer Legacy 500",
  
  // ATR turboprops
  AT42: "ATR 42",
  AT45: "ATR 45",
  AT72: "ATR 72",
  AT73: "ATR 73",
  AT7F: "ATR 72-600",
  
  // Airbus Helicopters (AS/EC/H series)
  AS65: "Airbus Helicopters AS365",
  
  // Sikorsky helicopters
  S76: "Sikorsky S-76",
  S92: "Sikorsky S-92",
  
  // Regional aircraft manufacturers
  F900: "Falcon 900",
  FA7X: "Falcon 7X",
  FA8X: "Falcon 8X",
  GLF4: "Gulfstream G450",
  GLF5: "Gulfstream G550",
  GLF6: "Gulfstream G650",
  
  // Private/Business jets
  C25B: "Cessna Citation X",
  C550: "Cessna Citation II",
  C560: "Cessna Citation V",
  C650: "Cessna Citation VII",
  
  // Utility aircraft
  SWIFT: "Swift Air",
  DHC6: "De Havilland DHC-6",
};

const DEFAULT_PAGE_LIMIT = 100;
const MAX_PAGE_LIMIT = 100;
const DEFAULT_CACHE_TTL_MS = 15 * 60 * 1000;
const DEFAULT_MAX_LOAD_ALL_PAGES = 20;

function getConfig() {
  return {
    aviationStackApiKey: process.env.AVIATIONSTACK_API_KEY || "",
    aviationStackBaseUrl:
      process.env.AVIATIONSTACK_BASE_URL || "http://api.aviationstack.com",
    enableAirportEnrichment: process.env.AVIATIONSTACK_ENRICH_AIRPORTS === "true",
    freezeAviationStack: process.env.AVIATIONSTACK_FREEZE === "true",
    defaultLimit: Number(process.env.AVIATIONSTACK_DEFAULT_LIMIT || DEFAULT_PAGE_LIMIT),
    cacheTtlMs: Number(process.env.AVIATIONSTACK_CACHE_TTL_MS || DEFAULT_CACHE_TTL_MS),
    maxLoadAllPages: Number(process.env.AVIATIONSTACK_MAX_LOAD_ALL_PAGES || DEFAULT_MAX_LOAD_ALL_PAGES),
  };
}

function normalizeAirportCode(value) {
  if (typeof value !== "string") {
    return "YYZ";
  }

  const code = value.trim().toUpperCase();
  return airportConfigs[code] ? code : "YYZ";
}

function getAirportConfig(query = {}) {
  const airportCode = normalizeAirportCode(readQueryValue(query, "airport"));
  return airportConfigs[airportCode] || airportConfigs.YYZ;
}

function placeholderResponse(type, airportConfig, message) {
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

function toPositiveInt(value, fallback) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

function normalizeLimit(value) {
  return Math.max(1, Math.min(MAX_PAGE_LIMIT, toPositiveInt(value, DEFAULT_PAGE_LIMIT)));
}

function resolvedPageLimit(query = {}) {
  const config = getConfig();
  const queryLimit = readQueryValue(query, "limit");

  if (queryLimit) {
    return normalizeLimit(queryLimit);
  }

  return normalizeLimit(config.defaultLimit);
}

function isLoadAllRequested(query = {}) {
  const raw = String(readQueryValue(query, "all") || "").trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

function buildCacheKey(type, query = {}) {
  const airportCode = normalizeAirportCode(readQueryValue(query, "airport"));
  const all = isLoadAllRequested(query) ? "all" : "single";
  const limit = resolvedPageLimit(query);
  const filterPairs = passthroughParams
    .filter((key) => key !== "offset" && key !== "limit")
    .map((key) => {
      const value = readQueryValue(query, key);
      return [key, typeof value === "string" ? value.trim() : ""];
    })
    .filter(([, value]) => value)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return `${airportCode}|${type}|${all}|limit=${limit}|${filterPairs}`;
}

function buildLivePayload(type, airportConfig, payload) {
  return {
    airportCode: airportConfig.code,
    airportName: airportConfig.name,
    type,
    count: payload.flights.length,
    fetchedCount: payload.fetchedCount,
    totalAvailable: payload.totalAvailable,
    lastUpdated: new Date(payload.updatedAt || Date.now()).toISOString(),
    source: "aviationstack",
    placeholder: false,
    stale: false,
    flights: payload.flights,
    ...(payload.cached ? { cached: true } : {}),
    ...(payload.pagesFetched ? { pagesFetched: payload.pagesFetched } : {}),
    ...(payload.pageLimit ? { pageLimit: payload.pageLimit } : {}),
    ...(payload.message ? { message: payload.message } : {}),
  };
}

function getFreshCachedPayload(type, query = {}) {
  const airportConfig = getAirportConfig(query);
  const cacheKey = buildCacheKey(type, query);
  const cacheEntry = flightsTtlCache.get(cacheKey);

  if (!cacheEntry) {
    return null;
  }

  const ttlMs = Math.max(60 * 1000, toPositiveInt(getConfig().cacheTtlMs, DEFAULT_CACHE_TTL_MS));
  const ageMs = Date.now() - cacheEntry.updatedAt;

  if (ageMs > ttlMs) {
    return null;
  }

  return buildLivePayload(type, airportConfig, {
    ...cacheEntry,
    cached: true,
    message: `Serving cached ${type} data (${Math.round(ageMs / 1000)}s old) to reduce API usage.`,
  });
}

function storeTtlCache(type, query, result) {
  const cacheKey = buildCacheKey(type, query);

  flightsTtlCache.set(cacheKey, {
    flights: result.flights,
    totalAvailable: result.totalAvailable,
    fetchedCount: result.fetchedCount,
    pagesFetched: result.pagesFetched,
    pageLimit: result.pageLimit,
    updatedAt: Date.now(),
  });
}

function buildAviationStackUrl(type, query = {}, airportConfig = getAirportConfig(query)) {
  const config = getConfig();
  const url = new URL("/v1/flights", config.aviationStackBaseUrl);

  url.searchParams.set("access_key", config.aviationStackApiKey);
  url.searchParams.set("limit", String(resolvedPageLimit(query)));

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
      airlineIata: normalizeCode(flight && flight.airline && flight.airline.iata) || null,
      airlineIcao: normalizeCode(flight && flight.airline && flight.airline.icao) || null,
      flightNumber: (flight.flight && flight.flight.number) || "—",
      flightIata:
        (flight.flight && (flight.flight.iata || flight.flight.icao)) || "—",
      aircraftId:
        (flight.aircraft && (flight.aircraft.registration || flight.aircraft.icao24)) ||
        (flight.flight && (flight.flight.icao || flight.flight.iata)) ||
        "Unknown",
      aircraftModel: (() => {
        // Option 1: Try to get model from AviationStack if available
        if (flight.aircraft) {
          if (flight.aircraft.model_code) {
            const modelCode = normalizeCode(flight.aircraft.model_code);
            return aircraftModelLookup[modelCode] || null;
          }
          if (flight.aircraft.icao24) {
            const icao24 = normalizeCode(flight.aircraft.icao24);
            return aircraftModelLookup[icao24] || null;
          }
        }
        return null;
      })(),
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

async function loadFlights(type, query, airportConfig = getAirportConfig(query)) {
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
  const flights = normalizeFlights(payload.data, type, airportLookup);
  const pagination = payload.pagination || {};
  const totalAvailable = Number.isFinite(Number(pagination.total))
    ? Number(pagination.total)
    : flights.length;

  return {
    flights,
    totalAvailable,
    fetchedCount: flights.length,
    pagesFetched: 1,
    pageLimit: resolvedPageLimit(query),
  };
}

async function loadAllFlights(type, query) {
  const pageLimit = resolvedPageLimit(query);
  const maxPages = Math.max(1, toPositiveInt(getConfig().maxLoadAllPages, DEFAULT_MAX_LOAD_ALL_PAGES));
  const mergedFlights = [];
  let totalAvailable = null;
  let pagesFetched = 0;
  let offset = 0;

  while (pagesFetched < maxPages) {
    const pageQuery = {
      ...query,
      limit: String(pageLimit),
      offset: String(offset),
    };

    const pageResult = await loadFlights(type, pageQuery, getAirportConfig(pageQuery));
    mergedFlights.push(...pageResult.flights);
    pagesFetched += 1;

    if (Number.isFinite(pageResult.totalAvailable)) {
      totalAvailable = pageResult.totalAvailable;
    }

    const reachedTotal = Number.isFinite(totalAvailable) && mergedFlights.length >= totalAvailable;
    const reachedPageEnd = pageResult.fetchedCount < pageLimit;

    if (reachedTotal || reachedPageEnd) {
      break;
    }

    offset += pageLimit;
  }

  return {
    flights: mergedFlights,
    totalAvailable: Number.isFinite(totalAvailable) ? totalAvailable : mergedFlights.length,
    fetchedCount: mergedFlights.length,
    pagesFetched,
    pageLimit,
  };
}

function getCachedPayload(type, airportConfig = airportConfigs.YYZ) {
  const cached = flightsCache[`${airportConfig.code}:${type}`];

  if (!cached) {
    return null;
  }

  const ageMs = Date.now() - cached.updatedAt;

  return {
    airportCode: airportConfig.code,
    airportName: airportConfig.name,
    type,
    count: cached.flights.length,
    fetchedCount: cached.flights.length,
    totalAvailable: Number.isFinite(cached.totalAvailable)
      ? cached.totalAvailable
      : cached.flights.length,
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
  const airportConfig = getAirportConfig(req.query);

  if (type !== "arrival" && type !== "departure") {
    return res
      .status(400)
      .json({ message: "Query parameter 'type' must be 'arrival' or 'departure'." });
  }

  if (!getConfig().aviationStackApiKey) {
    return res.json(
      placeholderResponse(
        type,
        airportConfig,
        "Set AVIATIONSTACK_API_KEY to load live AviationStack data.",
      ),
    );
  }

  if (getConfig().freezeAviationStack) {
    const cachedPayload = getCachedPayload(type, airportConfig);

    if (cachedPayload) {
      return res.json({
        ...cachedPayload,
        message: `Live API calls are currently frozen. Showing cached ${type} data from ${cachedPayload.staleAgeMinutes} minute(s) ago.`,
      });
    }

    return res.json(
      placeholderResponse(
        type,
        airportConfig,
        "Live API calls are currently frozen (AVIATIONSTACK_FREEZE=true). Refreshing is disabled until unfrozen.",
      ),
    );
  }

  const freshCachedPayload = getFreshCachedPayload(type, req.query);

  if (freshCachedPayload) {
    return res.json(freshCachedPayload);
  }

  try {
    const result = isLoadAllRequested(req.query)
      ? await loadAllFlights(type, req.query)
      : await loadFlights(type, req.query, airportConfig);
    const flights = result.flights;

    flightsCache[`${airportConfig.code}:${type}`] = {
      flights,
      totalAvailable: result.totalAvailable,
      updatedAt: Date.now(),
    };

    storeTtlCache(type, req.query, result);

    return res.json(buildLivePayload(type, airportConfig, {
      flights,
      fetchedCount: result.fetchedCount,
      totalAvailable: result.totalAvailable,
      pagesFetched: result.pagesFetched,
      pageLimit: result.pageLimit,
      updatedAt: Date.now(),
      message: isLoadAllRequested(req.query)
        ? `Loaded ${result.fetchedCount} ${type} flights across ${result.pagesFetched} page(s).`
        : undefined,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch live flight data.";
    const rateLimited = message.includes(" 429");
    const cachedPayload = getCachedPayload(type, airportConfig);

    if (rateLimited && cachedPayload) {
      return res.json(cachedPayload);
    }

    return res.json({
      ...placeholderResponse(
        type,
        airportConfig,
        rateLimited
          ? "AviationStack rate limit reached. Refresh less frequently or wait for reset."
          : message,
      ),
      placeholder: true,
    });
  }
};
