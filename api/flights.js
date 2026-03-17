const airportConfig = {
  code: "YYZ",
  name: "Toronto Pearson International Airport",
};

function getConfig() {
  return {
    aviationStackApiKey: process.env.AVIATIONSTACK_API_KEY || "",
    aviationStackBaseUrl:
      process.env.AVIATIONSTACK_BASE_URL || "http://api.aviationstack.com",
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

function buildAviationStackUrl(type) {
  const config = getConfig();
  const url = new URL("/v1/flights", config.aviationStackBaseUrl);

  url.searchParams.set("access_key", config.aviationStackApiKey);
  url.searchParams.set("limit", "20");

  if (type === "arrival") {
    url.searchParams.set("arrival_iata", airportConfig.code);
  } else {
    url.searchParams.set("departure_iata", airportConfig.code);
  }

  return url.toString();
}

function normalizeFlights(flights, type) {
  return (flights || []).map((flight, index) => {
    const segment = type === "arrival" ? flight.arrival : flight.departure;
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
      departureAirport:
        (flight.departure && flight.departure.airport) || "Unknown origin",
      arrivalAirport:
        (flight.arrival && flight.arrival.airport) || "Unknown destination",
      scheduledTime: (segment && segment.scheduled) || null,
      actualTime: (segment && (segment.actual || segment.estimated)) || null,
      terminal: (segment && segment.terminal) || null,
      gate: (segment && segment.gate) || null,
      status: flight.flight_status || "unknown",
      isLive: Boolean(flight.live),
    };
  });
}

async function loadFlights(type) {
  const response = await fetch(buildAviationStackUrl(type), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`AviationStack request failed with ${response.status}`);
  }

  const payload = await response.json();

  if (payload.error) {
    throw new Error(payload.error.message || "AviationStack returned an error.");
  }

  return normalizeFlights(payload.data, type);
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

  try {
    const flights = await loadFlights(type);

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
    return res.status(502).json({
      ...placeholderResponse(type, "Unable to fetch live flight data."),
      placeholder: false,
      message: error instanceof Error ? error.message : "Unable to fetch live flight data.",
    });
  }
};
