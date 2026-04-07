const refreshIntervalMs = Math.max(
  Number(window.PLANESIGHT_REFRESH_INTERVAL_MS || 18000000),
  60000,
);

const statusColorMap = {
  scheduled: "#9fb3d2",
  active: "#56ccf2",
  landed: "#6ee7b7",
  cancelled: "#ff8a80",
  incident: "#ffb86b",
  diverted: "#d7b6ff",
};

const airportCoordinateByIata = {
  YYZ: { lat: 43.6777, lon: -79.6248 },
  CLT: { lat: 35.214, lon: -80.9431 },
  YUL: { lat: 45.4706, lon: -73.7408 },
  YOW: { lat: 45.3225, lon: -75.6692 },
  YWG: { lat: 49.9099, lon: -97.2399 },
  YYC: { lat: 51.1215, lon: -114.0076 },
  YEG: { lat: 53.3097, lon: -113.5797 },
  YHZ: { lat: 44.8808, lon: -63.5086 },
  YQB: { lat: 46.7911, lon: -71.3933 },
  YQT: { lat: 48.3719, lon: -89.3239 },
  JFK: { lat: 40.6413, lon: -73.7781 },
  EWR: { lat: 40.6895, lon: -74.1745 },
  PHL: { lat: 39.8744, lon: -75.2424 },
  ATL: { lat: 33.6407, lon: -84.4277 },
  ORD: { lat: 41.9742, lon: -87.9073 },
  IAD: { lat: 38.9531, lon: -77.4565 },
  RDU: { lat: 35.8801, lon: -78.788 },
  MIA: { lat: 25.7959, lon: -80.2871 },
  MCO: { lat: 28.4312, lon: -81.3081 },
  LAS: { lat: 36.084, lon: -115.1537 },
  AMS: { lat: 52.3105, lon: 4.7683 },
  LHR: { lat: 51.47, lon: -0.4543 },
  LIS: { lat: 38.7742, lon: -9.1342 },
  IST: { lat: 41.2753, lon: 28.7519 },
  DEL: { lat: 28.5562, lon: 77.1 },
  ICN: { lat: 37.4602, lon: 126.4407 },
  AUH: { lat: 24.433, lon: 54.6511 },
  DXB: { lat: 25.2532, lon: 55.3657 },
  CAI: { lat: 30.1219, lon: 31.4056 },
  GIG: { lat: -22.809, lon: -43.2506 },
  PUJ: { lat: 18.5674, lon: -68.3634 },
  PDL: { lat: 37.7412, lon: -25.6979 },
  CDG: { lat: 49.0097, lon: 2.5479 },
  FRA: { lat: 50.0379, lon: 8.5622 },
  MUC: { lat: 48.3538, lon: 11.7861 },
  MAD: { lat: 40.4983, lon: -3.5676 },
  BCN: { lat: 41.2974, lon: 2.0833 },
  FCO: { lat: 41.8003, lon: 12.2389 },
  CPH: { lat: 55.6181, lon: 12.656 },
  ARN: { lat: 59.6519, lon: 17.9186 },
  OSL: { lat: 60.1976, lon: 11.1004 },
  HEL: { lat: 60.3172, lon: 24.9633 },
  ZRH: { lat: 47.4581, lon: 8.5555 },
  VIE: { lat: 48.1103, lon: 16.5697 },
  BRU: { lat: 50.901, lon: 4.4844 },
  DUB: { lat: 53.4213, lon: -6.2701 },
  DOH: { lat: 25.2731, lon: 51.6081 },
  HND: { lat: 35.5494, lon: 139.7798 },
  NRT: { lat: 35.772, lon: 140.3929 },
  HKG: { lat: 22.308, lon: 113.9185 },
  SIN: { lat: 1.3644, lon: 103.9915 },
  SYD: { lat: -33.9399, lon: 151.1753 },
  AKL: { lat: -37.0082, lon: 174.785 },
  MEX: { lat: 19.4363, lon: -99.0721 },
  LAX: { lat: 33.9416, lon: -118.4085 },
  SFO: { lat: 37.6213, lon: -122.379 },
  SEA: { lat: 47.4502, lon: -122.3088 },
};

const airportCountryByIata = {
  YYZ: "CA",
  CLT: "US",
  YUL: "CA",
  YOW: "CA",
  YWG: "CA",
  YYC: "CA",
  YEG: "CA",
  YHZ: "CA",
  YQB: "CA",
  YQT: "CA",
  JFK: "US",
  EWR: "US",
  PHL: "US",
  ATL: "US",
  ORD: "US",
  IAD: "US",
  RDU: "US",
  MIA: "US",
  MCO: "US",
  LAS: "US",
  LAX: "US",
  SFO: "US",
  SEA: "US",
  AMS: "NL",
  LHR: "GB",
  LIS: "PT",
  IST: "TR",
  DEL: "IN",
  ICN: "KR",
  AUH: "AE",
  DXB: "AE",
  CAI: "EG",
  GIG: "BR",
  PUJ: "DO",
  PDL: "PT",
  CDG: "FR",
  FRA: "DE",
  MUC: "DE",
  MAD: "ES",
  BCN: "ES",
  FCO: "IT",
  CPH: "DK",
  ARN: "SE",
  OSL: "NO",
  HEL: "FI",
  ZRH: "CH",
  VIE: "AT",
  BRU: "BE",
  DUB: "IE",
  DOH: "QA",
  HND: "JP",
  NRT: "JP",
  HKG: "HK",
  SIN: "SG",
  SYD: "AU",
  AKL: "NZ",
  MEX: "MX",
};

const airportDefinitions = {
  YYZ: {
    code: "YYZ",
    title: "Toronto Pearson Airport",
    displayName: "Lester B. Pearson International Airport (YYZ)",
    blurb:
      "Canada's largest and busiest airport serving millions of passengers annually since 1938. Located in Mississauga, it serves the Greater Toronto Area with two terminals (1 and 3) and five runways. It connects to roughly 200 destinations and acts as a major economic hub.",
    logoSrc: "img/pearsonlogo.png",
    logoAlt: "Toronto Pearson logo",
    photoSrc: "img/pearson.jpg",
    photoAlt: "Toronto Pearson airport terminal",
    siteUrl: "https://www.torontopearson.com/en",
    siteLabel: "Visit Site",
    facts: {
      address: "6301 Silver Dart Dr, Mississauga, ON L5P 1B2, Canada",
      terminals: "2 public passenger terminals (Terminal 1 and Terminal 3)",
      opened: "1939",
      annualTraffic: "~45 million annual passengers",
      history:
        "Opened as Malton Airport, it became Toronto Pearson and evolved into Canada's busiest international gateway.",
      highlights: [
        "Canada's largest and busiest airport.",
        "Major connection point for North America and overseas routes.",
        "Primary airport for the Greater Toronto Area.",
      ],
    },
    restaurantCsvPath: "/airportdata/PlaneSight%20-%20Pearson%20Restaurants.csv",
  },
  CLT: {
    code: "CLT",
    title: "Charlotte Douglas International Airport",
    displayName: "Charlotte Douglas International Airport (CLT)",
    blurb:
      "Charlotte Douglas International Airport is an international airport serving Charlotte, North Carolina, United States, located roughly six miles west of the city's central business district. Charlotte Douglas is the primary airport for commercial and military use in the Charlotte metropolitan area.",
    logoSrc: "img/Charlotte_Douglas_International_Airport_logo.svg.png",
    logoAlt: "Charlotte Douglas International Airport logo",
    photoSrc: "img/CLT_IMG.png",
    photoAlt: "Charlotte Douglas International Airport",
    siteUrl: "https://www.cltairport.com/",
    siteLabel: "Visit Site",
    facts: {
      address: "5501 Josh Birmingham Pkwy, Charlotte, NC 28208, USA",
      terminals: "1 terminal with 5 concourses (A, B, C, D, E)",
      opened: "1935",
      annualTraffic: "~50 million annual passengers",
      history:
        "CLT grew from a city airport into one of the busiest U.S. connecting hubs with extensive domestic and international reach.",
      highlights: [
        "One of the busiest airports in the United States.",
        "Strong east-coast hub with high daily departures.",
        "Central to Charlotte's economic and logistics network.",
      ],
    },
    restaurantCsvPath: "/airportdata/PlaneSight%20-%20Charlotte%20Restaurants.csv",
  },
};

const airportHeroImageSets = {
  YYZ: [
    "img/pearson.jpg",
    "img/Airport2.avif",
    "img/Airport3.jpg",
  ],
  CLT: ["img/CLT_IMG.png"],
};

let topRoutesChart;
let hourlyClockChart;
let domesticMixChart;
let selectedFlightId = null;
let latestFlights = [];
let pollingIntervalId = null;
let latestArrivals = [];
let latestDepartures = [];
let latestArrivalTotal = 0;
let latestDepartureTotal = 0;
let isRefreshing = false;
let isLoadingAll = false;
let responsiveLayoutFrameId = null;
let constellationMap = null;
let constellationHost = null;
let routeLayerGroup = null;
let markerLayerGroup = null;
let mapTileLayer = null;
let hasLeafletViewportSet = false;
const flightMarkersById = new Map();
let mapTheme = window.localStorage.getItem("planesight-map-theme") === "light"
  ? "light"
  : "dark";
let activeAirportCode = null;
const airportSnapshotCache = new Map();
let airportPhotoIntervalId = null;
let airportPhotoElements = null;
const airportRestaurantsCache = new Map();
let airportRestaurantsMap = null;
let airportRestaurantsMapLayer = null;
let airportRestaurantsMapTileLayer = null;

const elements = {
  airportSelectorButtons: document.querySelectorAll("[data-airport-code]"),
  airportChoicePrompt: document.getElementById("airportChoicePrompt"),
  refreshButton: document.getElementById("refreshButton"),
  lastUpdatedText: document.getElementById("lastUpdatedText"),
  heroAirportCode: document.getElementById("heroAirportCode"),
  heroAirportLogo: document.getElementById("heroAirportLogo"),
  heroAirportTitle: document.getElementById("airportTitle"),
  heroAirportName: document.getElementById("heroAirportName"),
  heroAirportBlurb: document.getElementById("heroAirportBlurb"),
  heroAirportVisitButton: document.getElementById("heroAirportVisitButton"),
  heroAirportPhoto: document.getElementById("heroAirportPhoto"),
  airportDeepDiveTitle: document.getElementById("airportDeepDiveTitle"),
  airportDeepDiveSubtitle: document.getElementById("airportDeepDiveSubtitle"),
  airportDeepDiveCodePill: document.getElementById("airportDeepDiveCodePill"),
  airportFactAddress: document.getElementById("airportFactAddress"),
  airportFactWebsite: document.getElementById("airportFactWebsite"),
  airportFactTerminals: document.getElementById("airportFactTerminals"),
  airportFactOpened: document.getElementById("airportFactOpened"),
  airportFactTraffic: document.getElementById("airportFactTraffic"),
  airportHistoryText: document.getElementById("airportHistoryText"),
  airportHighlightsList: document.getElementById("airportHighlightsList"),
  airportRestaurantsMiniMap: document.getElementById("airportRestaurantsMiniMap"),
  airportRestaurantsGrid: document.getElementById("airportRestaurantsGrid"),
  topRoutesList: document.getElementById("topRoutesList"),
  topAirlinesList: document.getElementById("topAirlinesList"),
  arrivalsCount: document.getElementById("arrivalsCount"),
  departuresCount: document.getElementById("departuresCount"),
  arrivalsPill: document.getElementById("arrivalsPill"),
  departuresPill: document.getElementById("departuresPill"),
  arrivalsTableBody: document.getElementById("arrivalsTableBody"),
  departuresTableBody: document.getElementById("departuresTableBody"),
  noticePanel: document.getElementById("noticePanel"),
  noticeText: document.getElementById("noticeText"),
  topRoutesChart: document.getElementById("topRoutesChart"),
  hourlyClockChart: document.getElementById("hourlyClockChart"),
  domesticMixChart: document.getElementById("domesticMixChart"),
  flightConstellation: document.getElementById("flightConstellation"),
  flightTooltip: document.getElementById("flightTooltip"),
  selectedFlightPanel: document.getElementById("selectedFlightPanel"),
  filterStatus: document.getElementById("filterStatus"),
  filterAirline: document.getElementById("filterAirline"),
  filterDestination: document.getElementById("filterDestination"),
  filterLimit: document.getElementById("filterLimit"),
  clearFiltersButton: document.getElementById("clearFiltersButton"),
  loadAllOnceButton: document.getElementById("loadAllOnceButton"),
  activeFilterChips: document.getElementById("activeFilterChips"),
  mapThemeToggle: document.getElementById("mapThemeToggle"),
  apiUnauthorizedFlag: document.getElementById("apiUnauthorizedFlag"),
};

function normalizeAirportCode(value) {
  const code = String(value || "").trim().toUpperCase();
  return airportDefinitions[code] ? code : "YYZ";
}

function getAirportDefinition(airportCode = activeAirportCode) {
  const normalizedAirportCode = normalizeAirportCode(airportCode);
  return airportDefinitions[normalizedAirportCode] || airportDefinitions.YYZ;
}

function updateAirportSelectorState(airportCode) {
  const normalized = normalizeAirportCode(airportCode);

  elements.airportSelectorButtons.forEach((button) => {
    const isActive = button.dataset.airportCode === normalized;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function setAirportGateActive(isActive) {
  document.body.classList.toggle("airport-gate-active", isActive);

  if (elements.airportChoicePrompt) {
    elements.airportChoicePrompt.classList.toggle("hidden", !isActive);
  }
}

function unlockAirportGate() {
  setAirportGateActive(false);
}

function lockAirportGate() {
  setAirportGateActive(true);
}

function hideAirportDataShell() {
  latestArrivals = [];
  latestDepartures = [];
  latestFlights = [];
  latestArrivalTotal = 0;
  latestDepartureTotal = 0;
  if (elements.heroAirportCode) {
    elements.heroAirportCode.textContent = "—";
  }
  if (elements.heroAirportTitle) {
    elements.heroAirportTitle.textContent = "Choose an airport to begin";
  }
  if (elements.heroAirportName) {
    elements.heroAirportName.textContent = "YYZ and CLT are available now, with LAX and YVR coming soon.";
  }
  if (elements.heroAirportBlurb) {
    elements.heroAirportBlurb.textContent = "Select one of the active airport cards above to unlock the dashboard and load its cached live data.";
  }
  if (elements.heroAirportVisitButton) {
    elements.heroAirportVisitButton.href = "#airportSelectorSection";
    elements.heroAirportVisitButton.textContent = "Choose airport";
  }
  if (elements.heroAirportLogo) {
    elements.heroAirportLogo.removeAttribute("src");
  }
  if (elements.heroAirportPhoto) {
    elements.heroAirportPhoto.removeAttribute("src");
  }
  if (elements.arrivalsCount) {
    elements.arrivalsCount.textContent = "0";
  }
  if (elements.departuresCount) {
    elements.departuresCount.textContent = "0";
  }
  if (elements.arrivalsPill) {
    elements.arrivalsPill.textContent = "Locked";
  }
  if (elements.departuresPill) {
    elements.departuresPill.textContent = "Locked";
  }
  showNotice("Choose YYZ or CLT to load the dashboard.");
  updateUnauthorizedFlag("");
}

function updateAirportShell(airportCode) {
  const airport = getAirportDefinition(airportCode);
  const descriptionMeta = document.querySelector('meta[name="description"]');

  activeAirportCode = airport.code;
  unlockAirportGate();

  if (descriptionMeta) {
    descriptionMeta.setAttribute(
      "content",
      `Live ${airport.title} flight dashboard using AviationStack.`,
    );
  }

  document.title = `PlaneSight | ${airport.code} | ${airport.title}`;

  if (elements.heroAirportCode) {
    elements.heroAirportCode.textContent = airport.code;
  }

  if (elements.heroAirportLogo) {
    elements.heroAirportLogo.src = airport.logoSrc;
    elements.heroAirportLogo.alt = airport.logoAlt;
  }

  if (elements.heroAirportTitle) {
    elements.heroAirportTitle.textContent = airport.title;
  }

  if (elements.heroAirportName) {
    elements.heroAirportName.textContent = airport.displayName;
  }

  if (elements.heroAirportBlurb) {
    elements.heroAirportBlurb.textContent = airport.blurb;
  }

  if (elements.heroAirportVisitButton) {
    elements.heroAirportVisitButton.href = airport.siteUrl;
    elements.heroAirportVisitButton.textContent = airport.siteLabel;
  }

  if (elements.heroAirportPhoto) {
    elements.heroAirportPhoto.src = airport.photoSrc;
    elements.heroAirportPhoto.alt = airport.photoAlt;
  }

  configureAirportPhotoRotation(airport.code);

  const statusDetails = document.querySelectorAll("#statusSection .status-card-detail");
  if (statusDetails[0]) {
    statusDetails[0].textContent = `Total arrivals available for ${airport.code}`;
  }
  if (statusDetails[1]) {
    statusDetails[1].textContent = `Total departures available for ${airport.code}`;
  }

  const routesHeading = document.querySelector("#topRoutesSection h3");
  const routesDescription = document.querySelector("#topRoutesSection p");
  if (routesHeading) {
    routesHeading.textContent = "Most Flown Routes Today";
  }
  if (routesDescription) {
    routesDescription.textContent = `Top three routes currently moving through ${airport.code}.`;
  }

  const airlinesHeading = document.querySelector("#topRoutesSection .top-summary-panel:nth-child(2) h3");
  const airlinesDescription = document.querySelector("#topRoutesSection .top-summary-panel:nth-child(2) p");
  if (airlinesHeading) {
    airlinesHeading.textContent = "Most Flown Airlines Today";
  }
  if (airlinesDescription) {
    airlinesDescription.textContent = `Top three airlines currently moving through ${airport.code}.`;
  }

  const hourlyHeading = document.querySelector("#hourlyClockSection h3");
  const hourlyDescription = document.querySelector("#hourlyClockSection p");
  if (hourlyHeading) {
    hourlyHeading.textContent = "24-Hour Flight Clock";
  }
  if (hourlyDescription) {
    hourlyDescription.textContent = `Flight density by scheduled hour to show daily traffic wave patterns for ${airport.code}.`;
  }

  const domesticHeading = document.querySelector("#domesticMixSection h3");
  const domesticDescription = document.querySelector("#domesticMixSection p");
  if (domesticHeading) {
    domesticHeading.textContent = "Domestic vs International";
  }
  if (domesticDescription) {
    domesticDescription.textContent = `Share of ${airport.code} flights that are within Canada versus outside Canada.`;
  }

  const arrivalsHeading = document.querySelector("#arrivalsSection h2");
  const arrivalsDescription = document.querySelector("#arrivalsSection .panel-header p");
  if (arrivalsHeading) {
    arrivalsHeading.textContent = `Arrivals to ${airport.code}`;
  }
  if (arrivalsDescription) {
    arrivalsDescription.textContent = `Latest inbound flights returned by AviationStack for ${airport.code}.`;
  }

  const departuresHeading = document.querySelector("#departuresSection h2");
  const departuresDescription = document.querySelector("#departuresSection .panel-header p");
  if (departuresHeading) {
    departuresHeading.textContent = `Departures from ${airport.code}`;
  }
  if (departuresDescription) {
    departuresDescription.textContent = `Latest outbound flights returned by AviationStack for ${airport.code}.`;
  }

  const routeLegendItems = document.querySelectorAll(".route-legend span");
  if (routeLegendItems[0]?.childNodes[1]) {
    routeLegendItems[0].childNodes[1].nodeValue = `To ${airport.code} (arrivals)`;
  }
  if (routeLegendItems[1]?.childNodes[1]) {
    routeLegendItems[1].childNodes[1].nodeValue = `From ${airport.code} (departures)`;
  }

  renderAirportDeepDive(airport.code);
  updateAirportSelectorState(airport.code);
}

function setAirportPhotoSource(src) {
  if (!airportPhotoElements) {
    return;
  }

  airportPhotoElements.base.setAttribute("src", src);
  airportPhotoElements.overlay.setAttribute("src", src);
  airportPhotoElements.base.classList.remove("is-hidden");
  airportPhotoElements.overlay.classList.add("is-hidden");
  airportPhotoElements.showingOverlay = false;
}

function configureAirportPhotoRotation(airportCode) {
  if (!airportPhotoElements) {
    return;
  }

  const normalizedAirportCode = normalizeAirportCode(airportCode);
  const imageSources = airportHeroImageSets[normalizedAirportCode] || airportHeroImageSets.YYZ;

  if (airportPhotoIntervalId) {
    window.clearInterval(airportPhotoIntervalId);
    airportPhotoIntervalId = null;
  }

  imageSources.forEach((src) => {
    const preload = new Image();
    preload.src = src;
  });

  if (imageSources.length <= 1) {
    setAirportPhotoSource(imageSources[0]);
    return;
  }

  let activeIndex = imageSources.findIndex((src) => (
    (airportPhotoElements.base.getAttribute("src") || "").includes(src)
  ));

  if (activeIndex < 0) {
    activeIndex = 0;
    setAirportPhotoSource(imageSources[0]);
  }

  function crossfadeTo(nextSrc) {
    const incoming = airportPhotoElements.showingOverlay
      ? airportPhotoElements.base
      : airportPhotoElements.overlay;
    const outgoing = airportPhotoElements.showingOverlay
      ? airportPhotoElements.overlay
      : airportPhotoElements.base;

    incoming.setAttribute("src", nextSrc);
    incoming.classList.remove("is-hidden");
    outgoing.classList.add("is-hidden");
    airportPhotoElements.showingOverlay = !airportPhotoElements.showingOverlay;
  }

  airportPhotoIntervalId = window.setInterval(() => {
    activeIndex = (activeIndex + 1) % imageSources.length;
    crossfadeTo(imageSources[activeIndex]);
  }, 3000);
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += ch;
  }

  values.push(current);
  return values;
}

function parseCsvRows(csvText) {
  const lines = String(csvText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const rawValues = parseCsvLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = (rawValues[index] || "").trim();
    });

    return row;
  });
}

function toNumberOrNull(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeRestaurantRecord(row) {
  return {
    name: row["Business Name"] || "Unnamed restaurant",
    address: row.Address || "Address unavailable",
    phone: row.Phone || "Phone unavailable",
    website: row.Website || "",
    rating: toNumberOrNull(row.Rating),
    reviews: toNumberOrNull(row.Reviews),
    category: row.Category || "Restaurant",
    mapsUrl: row["Google Maps URL"] || "",
    latitude: toNumberOrNull(row.Latitude),
    longitude: toNumberOrNull(row.Longitude),
  };
}

async function getAirportRestaurants(airportCode) {
  const normalizedAirportCode = normalizeAirportCode(airportCode);

  if (airportRestaurantsCache.has(normalizedAirportCode)) {
    return airportRestaurantsCache.get(normalizedAirportCode);
  }

  const airport = getAirportDefinition(normalizedAirportCode);
  const csvPath = airport.restaurantCsvPath;

  if (!csvPath) {
    airportRestaurantsCache.set(normalizedAirportCode, []);
    return [];
  }

  try {
    const response = await fetch(csvPath, { cache: "force-cache" });

    if (!response.ok) {
      airportRestaurantsCache.set(normalizedAirportCode, []);
      return [];
    }

    const csvText = await response.text();
    const restaurants = parseCsvRows(csvText).map(normalizeRestaurantRecord);
    airportRestaurantsCache.set(normalizedAirportCode, restaurants);
    return restaurants;
  } catch {
    airportRestaurantsCache.set(normalizedAirportCode, []);
    return [];
  }
}

function renderRestaurantCards(restaurants) {
  if (!elements.airportRestaurantsGrid) {
    return;
  }

  if (!restaurants.length) {
    elements.airportRestaurantsGrid.innerHTML = '<p class="airport-restaurants-empty">No restaurant data available for this airport yet.</p>';
    return;
  }

  const featured = [...restaurants]
    .sort((a, b) => {
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (ratingDiff !== 0) {
        return ratingDiff;
      }
      return (b.reviews || 0) - (a.reviews || 0);
    })
    .slice(0, 6);

  elements.airportRestaurantsGrid.innerHTML = featured
    .map((restaurant) => {
      const ratingText = Number.isFinite(restaurant.rating)
        ? `★ ${restaurant.rating.toFixed(1)} / 5`
        : "No rating";
      const reviewsText = Number.isFinite(restaurant.reviews)
        ? `${restaurant.reviews.toLocaleString()} reviews`
        : "Reviews n/a";
      const websiteLink = restaurant.website
        ? `<a href="${escapeHtml(restaurant.website)}" target="_blank" rel="noopener noreferrer">Website</a>`
        : "";
      const mapsLink = restaurant.mapsUrl
        ? `<a href="${escapeHtml(restaurant.mapsUrl)}" target="_blank" rel="noopener noreferrer">Google Maps</a>`
        : "";

      return `
        <article class="airport-restaurant-card">
          <div class="restaurant-preview">
            <div class="restaurant-image-placeholder">Image Slot</div>
            <div class="restaurant-preview-footer">
              <h4>${escapeHtml(restaurant.name)}</h4>
              <div class="restaurant-meta">
                <span>${escapeHtml(ratingText)}</span>
                <span>${escapeHtml(reviewsText)}</span>
              </div>
            </div>
            <div class="restaurant-detail-overlay">
              <div class="restaurant-meta">
                <span>${escapeHtml(restaurant.category)}</span>
                <span>${escapeHtml(ratingText)}</span>
                <span>${escapeHtml(reviewsText)}</span>
              </div>
              <div class="restaurant-details">
                <span><b>Address:</b> ${escapeHtml(restaurant.address)}</span>
                <span><b>Phone:</b> ${escapeHtml(restaurant.phone)}</span>
              </div>
              <div class="restaurant-links">
                ${websiteLink}
                ${mapsLink}
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function ensureAirportRestaurantsMap() {
  if (!window.L || !elements.airportRestaurantsMiniMap) {
    return false;
  }

  if (airportRestaurantsMap) {
    airportRestaurantsMap.invalidateSize();
    return true;
  }

  airportRestaurantsMap = window.L.map(elements.airportRestaurantsMiniMap, {
    zoomControl: true,
    attributionControl: true,
    minZoom: 2,
    maxZoom: 16,
  });

  airportRestaurantsMapLayer = window.L.layerGroup().addTo(airportRestaurantsMap);
  airportRestaurantsMap.setView([20, 0], 2);
  return true;
}

function syncAirportRestaurantsMapTheme() {
  if (!window.L || !airportRestaurantsMap) {
    return;
  }

  const config = mapTileConfig(mapTheme);

  if (airportRestaurantsMapTileLayer) {
    airportRestaurantsMap.removeLayer(airportRestaurantsMapTileLayer);
  }

  airportRestaurantsMapTileLayer = window.L.tileLayer(config.url, {
    minZoom: 2,
    maxZoom: 16,
    attribution: config.attribution,
  }).addTo(airportRestaurantsMap);
}

function renderAirportRestaurantsMap(restaurants) {
  if (!ensureAirportRestaurantsMap() || !airportRestaurantsMapLayer) {
    return;
  }

  syncAirportRestaurantsMapTheme();
  airportRestaurantsMapLayer.clearLayers();

  const boundsPoints = [];

  restaurants.forEach((restaurant) => {
    if (!Number.isFinite(restaurant.latitude) || !Number.isFinite(restaurant.longitude)) {
      return;
    }

    const marker = window.L.circleMarker([restaurant.latitude, restaurant.longitude], {
      radius: 6,
      color: "rgba(255,255,255,0.88)",
      weight: 1.2,
      fillColor: "#56ccf2",
      fillOpacity: 0.84,
    });

    marker.bindPopup(`
      <strong>${escapeHtml(restaurant.name)}</strong><br/>
      ${escapeHtml(restaurant.address)}<br/>
      Rating: ${escapeHtml(Number.isFinite(restaurant.rating) ? `★ ${restaurant.rating.toFixed(1)}` : "n/a")}
    `);

    marker.addTo(airportRestaurantsMapLayer);
    boundsPoints.push([restaurant.latitude, restaurant.longitude]);
  });

  if (boundsPoints.length) {
    airportRestaurantsMap.fitBounds(boundsPoints, {
      padding: [20, 20],
      maxZoom: 12,
    });
  } else {
    airportRestaurantsMap.setView([20, 0], 2);
  }
}

async function renderAirportDeepDive(airportCode) {
  const airport = getAirportDefinition(airportCode);
  const facts = airport.facts || {};

  if (elements.airportDeepDiveTitle) {
    elements.airportDeepDiveTitle.textContent = `${airport.title} Deep Dive`;
  }
  if (elements.airportDeepDiveSubtitle) {
    elements.airportDeepDiveSubtitle.textContent = "Address, operations, and food highlights sourced for this airport.";
  }
  if (elements.airportDeepDiveCodePill) {
    elements.airportDeepDiveCodePill.textContent = airport.code;
  }
  if (elements.airportFactAddress) {
    elements.airportFactAddress.textContent = facts.address || "—";
  }
  if (elements.airportFactWebsite) {
    elements.airportFactWebsite.href = airport.siteUrl || "#";
    elements.airportFactWebsite.textContent = airport.siteUrl || "Official airport site";
  }
  if (elements.airportFactTerminals) {
    elements.airportFactTerminals.textContent = facts.terminals || "—";
  }
  if (elements.airportFactOpened) {
    elements.airportFactOpened.textContent = facts.opened || "—";
  }
  if (elements.airportFactTraffic) {
    elements.airportFactTraffic.textContent = facts.annualTraffic || "—";
  }
  if (elements.airportHistoryText) {
    elements.airportHistoryText.textContent = facts.history || "—";
  }
  if (elements.airportHighlightsList) {
    elements.airportHighlightsList.innerHTML = (facts.highlights || [])
      .map((item) => `<div class="airport-highlight-item">${escapeHtml(item)}</div>`)
      .join("");
  }

  const restaurants = await getAirportRestaurants(airport.code);
  renderRestaurantCards(restaurants);
  renderAirportRestaurantsMap(restaurants);
}

function applyAirportSnapshot(snapshot) {
  latestArrivals = snapshot.arrivals.map((flight) => ({
    ...flight,
    direction: "arrival",
  }));
  latestDepartures = snapshot.departures.map((flight) => ({
    ...flight,
    direction: "departure",
  }));

  latestArrivalTotal = Number.isFinite(Number(snapshot.arrivalTotal))
    ? Number(snapshot.arrivalTotal)
    : latestArrivals.length;
  latestDepartureTotal = Number.isFinite(Number(snapshot.departureTotal))
    ? Number(snapshot.departureTotal)
    : latestDepartures.length;

  latestFlights = [...latestArrivals, ...latestDepartures];
  updateAirportShell(snapshot.airportCode);

  const message = snapshot.message || (snapshot.placeholder
    ? "Set AVIATIONSTACK_API_KEY to load live AviationStack data."
    : "");

  showNotice(message);
  updateUnauthorizedFlag(message);

  if (
    message
    && (message.toLowerCase().includes("rate limit")
      || message.toLowerCase().includes("currently frozen"))
  ) {
    pauseAutoPollingForRateLimit();
  }

  updateFilteredView();
}

// Hero scroll animation
function initHeroScrollAnimation() {
  const heroScrollSection = document.querySelector(".hero-scroll-section");
  const planeWrapper = document.getElementById("heroPlaneWrapper");
  const landingSequence = document.getElementById("heroLandingSequence");
  const planeImg = document.querySelector(".hero-plane");
  const heroDestination = document.querySelector(".hero-destination");
  const enterDashboardButton = document.querySelector(".landing__cta");

  if (!heroScrollSection || !planeWrapper || !landingSequence) return;

  function updatePlanePosition() {
    const rect = heroScrollSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const progress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / rect.height));

    const sectionWidth = heroScrollSection.clientWidth;
    const planeWidth = planeImg ? planeImg.getBoundingClientRect().width : sectionWidth * 0.33;
    const startX = -planeWidth * 0.95;
    const endX = sectionWidth - planeWidth * 0.05;
    const planeX = startX + (endX - startX) * progress;

    const trackHeight = Math.max(heroScrollSection.clientHeight * 0.56, 280);
    const startY = 8;
    const endY = Math.max(96, trackHeight * 0.44);
    const planeY = startY + (endY - startY) * progress;

    const tilt = -7 + progress * 9;
    planeWrapper.style.transform = `translate3d(${planeX}px, ${planeY}px, 0) rotate(${tilt}deg)`;

    const arrivalReveal = Math.max(0, Math.min(1, (progress - 0.42) / 0.28));
    landingSequence.style.opacity = String(arrivalReveal);

    if (planeImg) {
      planeImg.style.opacity = String(1 - arrivalReveal * 0.58);
    }

    if (heroDestination) {
      heroDestination.style.opacity = String(arrivalReveal);
      heroDestination.style.transform = `translateY(${(1 - arrivalReveal) * 36}px)`;
    }

    if (arrivalReveal > 0.82) {
      landingSequence.classList.add("visible");
      heroScrollSection.classList.add("arrived");
    } else {
      landingSequence.classList.remove("visible");
      heroScrollSection.classList.remove("arrived");
    }
  }

  let ticking = false;

  function onScrollOrResize() {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(() => {
      updatePlanePosition();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);

  if (enterDashboardButton) {
    enterDashboardButton.addEventListener("click", (event) => {
      event.preventDefault();

      const targetY = Math.max(
        0,
        heroScrollSection.offsetTop + heroScrollSection.offsetHeight - window.innerHeight,
      );

      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth";

      window.scrollTo({
        top: targetY,
        behavior,
      });
    });
  }

  updatePlanePosition();
}

function initRevealSectionsAndNavWheel() {
  const revealSections = Array.from(document.querySelectorAll(".reveal-section"));
  const navItems = Array.from(document.querySelectorAll(".side-nav-item"));
  const pageProgressFill = document.getElementById("pageProgressFill");
  const pageProgressPlane = document.getElementById("pageProgressPlane");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (revealSections.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealSections.forEach((section) => section.classList.add("in-view"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.02,
          rootMargin: "0px 0px -6% 0px",
        },
      );

      revealSections.forEach((section) => revealObserver.observe(section));
    }
  }

  if (!navItems.length) {
    return;
  }

  const sectionElements = navItems
    .map((item) => document.getElementById(item.dataset.target || ""))
    .filter(Boolean);

  if (!sectionElements.length) {
    return;
  }

  function setActiveIndex(index, { scroll = false } = {}) {
    const clampedIndex = Math.max(0, Math.min(sectionElements.length - 1, index));

    navItems.forEach((item, itemIndex) => {
      item.classList.toggle("active", itemIndex === clampedIndex);
    });

    if (scroll) {
      sectionElements[clampedIndex].scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }
  }

  navItems.forEach((item) => {
    if (!item.dataset.label) {
      item.dataset.label = (item.textContent || "").trim();
    }

    item.addEventListener("click", () => {
      const itemIndex = navItems.indexOf(item);
      if (itemIndex < 0) {
        return;
      }

      setActiveIndex(itemIndex, { scroll: true });
    });
  });

  let ticking = false;

  function scheduleNavSync() {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(() => {
      updateNavProgressAnchors();
      updateNavWheelState();
      updatePageProgress();
      ticking = false;
    });
  }

  function updateNavProgressAnchors() {
    const scrollMax = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight,
    );

    sectionElements.forEach((section, index) => {
      const navItem = navItems[index];
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const triggerMode = navItem && navItem.dataset.trigger === "top" ? "top" : "offset";
      const sectionAnchor = triggerMode === "top"
        ? sectionTop
        : sectionTop + Math.min(section.offsetHeight * 0.08, window.innerHeight * 0.12);
      const progress = Math.max(0, Math.min(1, sectionAnchor / scrollMax));

      if (!navItem) {
        return;
      }

      navItem.style.setProperty("--nav-progress", progress.toFixed(4));
      navItem.dataset.progress = String(progress);
    });
  }

  function updateNavHitState(progress) {
    navItems.forEach((item) => {
      const anchor = Number(item.dataset.progress);
      const isNear = Number.isFinite(anchor) && Math.abs(progress - anchor) <= 0.014;
      item.classList.toggle("is-hit", isNear);
    });
  }

  function updateNavWheelState() {
    const defaultAnchorY = window.innerHeight * 0.28;
    let bestIndex = 0;
    let bestScore = Number.POSITIVE_INFINITY;

    sectionElements.forEach((section, index) => {
      const navItem = navItems[index];
      const anchorY = navItem && navItem.dataset.trigger === "top"
        ? window.innerHeight * 0.08
        : defaultAnchorY;
      const rect = section.getBoundingClientRect();
      const inAnchorBand = rect.top <= anchorY && rect.bottom >= anchorY;
      const score = inAnchorBand ? 0 : Math.abs(rect.top - anchorY);

      if (score < bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    setActiveIndex(bestIndex, { scroll: false });
  }

  function updatePageProgress() {
    if (!pageProgressFill && !pageProgressPlane) {
      return;
    }

    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const scrollMax = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    const progress = Math.max(0, Math.min(1, scrollTop / scrollMax));

    if (pageProgressFill) {
      pageProgressFill.style.width = `${progress * 100}%`;
    }

    if (pageProgressPlane) {
      pageProgressPlane.style.left = `${progress * 100}%`;
    }

    updateNavHitState(progress);
  }

  function onScrollOrResize() {
    scheduleNavSync();
  }

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(() => {
      scheduleNavSync();
    });

    const pageShell = document.querySelector(".page-shell");

    if (pageShell) {
      observer.observe(pageShell);
    }

    sectionElements.forEach((section) => {
      observer.observe(section);
    });
  }

  updateNavProgressAnchors();
  updateNavWheelState();
  updatePageProgress();
}

function initAirportPhotoRotator() {
  const airportPhoto = document.querySelector(".hero-airport-photo");
  const airportVisual = document.querySelector(".hero-airport-visual");

  if (!airportPhoto || !airportVisual) {
    return;
  }

  const overlayPhoto = airportPhoto.cloneNode(true);
  overlayPhoto.classList.add("hero-airport-photo--overlay", "is-hidden");
  overlayPhoto.removeAttribute("id");
  overlayPhoto.setAttribute("alt", "");
  overlayPhoto.setAttribute("aria-hidden", "true");
  airportVisual.appendChild(overlayPhoto);

  airportPhotoElements = {
    base: airportPhoto,
    overlay: overlayPhoto,
    showingOverlay: false,
  };

  configureAirportPhotoRotation(activeAirportCode || "YYZ");
}

function formatTime(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function createCell(primary, secondary) {
  return `
    <div class="cell-primary">${primary}</div>
    <div class="cell-secondary">${secondary}</div>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function countryCodeToFlag(code) {
  if (!code || typeof code !== "string") {
    return "🌐";
  }

  const normalized = code.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(normalized)) {
    return "🌐";
  }

  const points = [...normalized].map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...points);
}

function getStatusColor(status) {
  return statusColorMap[status] || "#d7b6ff";
}

function scheduleToHour(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.getHours();
}

function buildTopRoutes(flights) {
  const routeCounts = new Map();

  for (const flight of flights) {
    const origin = flight.departureAirport || "Unknown origin";
    const destination = flight.arrivalAirport || "Unknown destination";
    const route = `${origin} → ${destination}`;
    routeCounts.set(route, (routeCounts.get(route) || 0) + 1);
  }

  return [...routeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
}

function buildTopAirlines(flights) {
  const airlineCounts = new Map();

  for (const flight of flights) {
    const airline = flight.airline || "Unknown airline";
    airlineCounts.set(airline, (airlineCounts.get(airline) || 0) + 1);
  }

  return [...airlineCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
}

function buildHourlyBuckets(flights) {
  const buckets = new Array(24).fill(0);

  for (const flight of flights) {
    const hour = scheduleToHour(flight.scheduledTime);

    if (hour !== null) {
      buckets[hour] += 1;
    }
  }

  return buckets;
}

function isCompactViewport() {
  return window.matchMedia("(max-width: 760px)").matches;
}

function shortenLabel(value, maxLength) {
  if (typeof value !== "string" || value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

function createOrUpdateTopRoutesChart(flights) {
  if (!elements.topRoutesList || !elements.topAirlinesList) {
    return;
  }

  const topRoutes = buildTopRoutes(flights);
  const topAirlines = buildTopAirlines(flights);
  const topThreeRoutes = topRoutes.slice(0, 3);

  elements.topRoutesList.innerHTML = topThreeRoutes.length
    ? topThreeRoutes.map(([route, count], index) => `
        <li class="top-ranked-item">
          <strong>${index + 1}. ${escapeHtml(route)}</strong>
          <span>${escapeHtml(`${count} flights`)}</span>
        </li>
      `).join("")
    : '<p class="top-ranked-empty">No route data yet.</p>';

  elements.topAirlinesList.innerHTML = topAirlines.length
    ? topAirlines.map(([airline, count], index) => {
        const logoUrl = airlineLogoUrlForName(airline);
        const logoFallbacks = airlineLogoCandidatesForName(airline).slice(1).join("|");
        const initials = String(airline || "")
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part.charAt(0))
          .join("")
          .toUpperCase() || "?";

        const logoMarkup = logoUrl
          ? `<img class="airline-logo top-ranked-logo" src="${logoUrl}" data-fallback-src="${escapeHtml(logoFallbacks)}" alt="" loading="lazy" decoding="async" onerror="window.handleAirlineLogoError && window.handleAirlineLogoError(this)" />`
          : `<span class="airline-logo top-ranked-logo top-ranked-logo--fallback" aria-hidden="true">${escapeHtml(initials)}</span>`;

        return `
        <li class="top-ranked-item top-ranked-item--airline">
          <div class="top-ranked-item-main">
            ${logoMarkup}
            <strong>${index + 1}. ${escapeHtml(airline)}</strong>
          </div>
          <span>${escapeHtml(`${count} flights`)}</span>
        </li>
      `;
      }).join("")
    : '<p class="top-ranked-empty">No airline data yet.</p>';
}

function createOrUpdateHourlyClockChart(flights) {
  if (!elements.hourlyClockChart || typeof Chart === "undefined") {
    return;
  }

  const compact = isCompactViewport();
  const hourLabels = Array.from({ length: 24 }, (_, index) =>
    `${String(index).padStart(2, "0")}:00`,
  );
  const values = buildHourlyBuckets(flights);

  const dataset = {
    label: "Scheduled flights",
    data: values,
    backgroundColor: "rgba(110, 231, 183, 0.36)",
    borderColor: "rgba(110, 231, 183, 0.98)",
    pointBackgroundColor: "rgba(110, 231, 183, 0.98)",
    borderWidth: 2,
    fill: true,
    tension: 0.35,
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label(context) {
            return `${context.parsed.y} flights`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#d0ddf0",
          maxRotation: 0,
          callback(value, index) {
            const stride = compact ? 4 : 2;
            return index % stride === 0 ? hourLabels[index] : "";
          },
        },
        grid: { color: "rgba(196, 217, 243, 0.12)" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#d0ddf0", precision: 0 },
        grid: { color: "rgba(196, 217, 243, 0.12)" },
      },
    },
  };

  if (hourlyClockChart) {
    hourlyClockChart.data.labels = hourLabels;
    hourlyClockChart.data.datasets[0].data = values;
    hourlyClockChart.options = options;
    hourlyClockChart.update();
    return;
  }

  hourlyClockChart = new Chart(elements.hourlyClockChart, {
    type: "line",
    data: { labels: hourLabels, datasets: [dataset] },
    options,
  });
}

function createOrUpdateDomesticMixChart(flights) {
  if (!elements.domesticMixChart || typeof Chart === "undefined") {
    return;
  }

  let domestic = 0;
  let international = 0;

  for (const flight of flights) {
    const peerCountry = flight.direction === "arrival"
      ? airportCountryCode(flight.departureIata, flight.departureCountryCode)
      : airportCountryCode(flight.arrivalIata, flight.arrivalCountryCode);

    if (!peerCountry) {
      continue;
    }

    if (peerCountry === "CA") {
      domestic += 1;
    } else {
      international += 1;
    }
  }

  const totalKnown = domestic + international;
  const labels = ["Domestic (Canada)", "International"];
  const values = totalKnown ? [domestic, international] : [1, 0];
  const dataset = {
    data: values,
    backgroundColor: totalKnown
      ? ["rgba(110, 231, 183, 0.82)", "rgba(86, 204, 242, 0.82)"]
      : ["rgba(159, 179, 210, 0.34)", "rgba(86, 204, 242, 0.14)"],
    borderColor: ["rgba(187, 245, 224, 0.95)", "rgba(170, 234, 255, 0.95)"],
    borderWidth: 1,
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#d0ddf0",
        },
      },
      tooltip: {
        callbacks: {
          label(context) {
            if (!totalKnown) {
              return "No country metadata available";
            }

            const value = context.parsed;
            const pct = Math.round((value / totalKnown) * 100);
            return `${context.label}: ${value} flights (${pct}%)`;
          },
        },
      },
    },
    cutout: "58%",
  };

  if (domesticMixChart) {
    domesticMixChart.data.labels = labels;
    domesticMixChart.data.datasets[0].data = values;
    domesticMixChart.data.datasets[0].backgroundColor = dataset.backgroundColor;
    domesticMixChart.options = options;
    domesticMixChart.update();
    return;
  }

  domesticMixChart = new Chart(elements.domesticMixChart, {
    type: "doughnut",
    data: {
      labels,
      datasets: [dataset],
    },
    options,
  });
}

function hashString(value) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededUnit(value, salt) {
  const hashed = hashString(`${value}:${salt}`);
  return hashed / 4294967295;
}

function isValidCoordinate(lat, lon) {
  return Number.isFinite(lat)
    && Number.isFinite(lon)
    && lat >= -90
    && lat <= 90
    && lon >= -180
    && lon <= 180;
}

function isRenderableCoordinate(lat, lon) {
  if (!isValidCoordinate(lat, lon)) {
    return false;
  }

  // AviationStack sometimes returns placeholder coordinates at (0, 0),
  // which clusters all points near the Gulf of Guinea.
  if (Math.abs(lat) < 0.0001 && Math.abs(lon) < 0.0001) {
    return false;
  }

  return true;
}

function projectCoordinate(lat, lon) {
  // Full equirectangular projection for a pole-to-pole world map.
  const minLon = -180;
  const maxLon = 180;
  const maxLat = 90;
  const minLat = -90;

  const clampedLon = Math.max(minLon, Math.min(maxLon, lon));
  const clampedLat = Math.max(minLat, Math.min(maxLat, lat));

  return {
    x: ((clampedLon - minLon) / (maxLon - minLon)) * 100,
    y: ((maxLat - clampedLat) / (maxLat - minLat)) * 100,
  };
}

const worldMapAspectRatio = 2;

function mapCoordinateToContainer(point, width, height) {
  const mapWidth = Math.min(width, height * worldMapAspectRatio);
  const mapHeight = mapWidth / worldMapAspectRatio;
  const offsetX = (width - mapWidth) / 2;
  const offsetY = (height - mapHeight) / 2;

  return {
    x: ((offsetX + (point.x / 100) * mapWidth) / width) * 100,
    y: ((offsetY + (point.y / 100) * mapHeight) / height) * 100,
  };
}

function knownAirportCoordinate(iata) {
  if (!iata || typeof iata !== "string") {
    return null;
  }

  const code = iata.trim().toUpperCase();
  return airportCoordinateByIata[code] || null;
}

function airportCountryCode(iata, countryCode) {
  const explicitCode = normalizeCountryCode(countryCode);

  if (explicitCode) {
    return explicitCode;
  }

  if (!iata || typeof iata !== "string") {
    return null;
  }

  return airportCountryByIata[iata.trim().toUpperCase()] || null;
}

function normalizeCountryCode(code) {
  if (!code || typeof code !== "string") {
    return null;
  }

  const normalized = code.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : null;
}

function airportFlag(iata, countryCode) {
  return countryCodeToFlag(airportCountryCode(iata, countryCode));
}

function countryFlagHtml(code, label = "Country flag") {
  const normalizedCode = normalizeCountryCode(code);

  if (!normalizedCode) {
    return `<span class="flag-emoji flag-emoji--fallback" aria-hidden="true">🌐</span>`;
  }

  return `<img class="flag-emoji" src="https://flagsapi.com/${normalizedCode}/flat/24.png" alt="${escapeHtml(label)}" loading="lazy" decoding="async" onerror="window.handleCountryFlagError && window.handleCountryFlagError(this)" />`;
}

function airportFlagHtml(iata, countryCode, label = "Country flag") {
  const code = airportCountryCode(iata, countryCode);
  return countryFlagHtml(code, label);
}

function flagEmojiHtml(iata, countryCode) {
  return airportFlagHtml(iata, countryCode, "Route country flag");
}

if (typeof window !== "undefined" && !window.handleCountryFlagError) {
  window.handleCountryFlagError = (img) => {
    img.replaceWith(document.createTextNode("🌐"));
  };
}

const airlineLogoCatalogueByCode = {
  AC: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Air_Canada_Logo.svg/200px-Air_Canada_Logo.svg.png",
  WS: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/WestJet_Logo.svg/200px-WestJet_Logo.svg.png",
  BA: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/British_Airways_Logo.svg/200px-British_Airways_Logo.svg.png",
  LH: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Lufthansa_Logo_2018.svg/200px-Lufthansa_Logo_2018.svg.png",
  AF: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Air_France_Logo.svg/200px-Air_France_Logo.svg.png",
  KL: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/KLM_logo.svg/200px-KLM_logo.svg.png",
  EK: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/200px-Emirates_logo.svg.png",
  DL: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Delta_Air_Lines_Logo.svg/200px-Delta_Air_Lines_Logo.svg.png",
  UA: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/United_Airlines_Logo.svg/200px-United_Airlines_Logo.svg.png",
  AA: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/American_Airlines_logo_2013.svg/200px-American_Airlines_logo_2013.svg.png",
  KE: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Korean_Air_Logo.svg/200px-Korean_Air_Logo.svg.png",
  TS: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Air_Transat_logo.svg/200px-Air_Transat_logo.svg.png",
  PD: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2c/Porter_Airlines_Logo.svg/200px-Porter_Airlines_Logo.svg.png",
  F8: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Flair_Airlines_Logo.svg/200px-Flair_Airlines_Logo.svg.png",
  WG: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Sunwing_Airlines_Logo.svg/200px-Sunwing_Airlines_Logo.svg.png",
  TK: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Turkish_Airlines_logo_2019_compact.svg/200px-Turkish_Airlines_logo_2019_compact.svg.png",
  QR: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Qatar_Airways_Logo.svg/200px-Qatar_Airways_Logo.svg.png",
  ET: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Ethiopian_Airlines_Logo.svg/200px-Ethiopian_Airlines_Logo.svg.png",
  NH: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/All_Nippon_Airways_logo.svg/200px-All_Nippon_Airways_logo.svg.png",
  JL: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Japan_Airlines_logo.svg/200px-Japan_Airlines_logo.svg.png",
  CX: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Cathay_Pacific_Logo.svg/200px-Cathay_Pacific_Logo.svg.png",
  SQ: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Singapore_Airlines_Logo_2.svg/200px-Singapore_Airlines_Logo_2.svg.png",
  AZ: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/ITA_Airways_logo.svg/200px-ITA_Airways_logo.svg.png",
  EI: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Aer_Lingus_Logo_2019.svg/200px-Aer_Lingus_Logo_2019.svg.png",
};

const airlineNameToCode = {
  "air canada": "AC",
  westjet: "WS",
  "american airlines": "AA",
  "delta air lines": "DL",
  "united airlines": "UA",
  "british airways": "BA",
  lufthansa: "LH",
  "air france": "AF",
  klm: "KL",
  emirates: "EK",
  "korean air": "KE",
  egyptair: "MS",
  "egypt air": "MS",
  "latam airlines": "LA",
  latam: "LA",
  "china southern airlines": "CZ",
  "china southern": "CZ",
  "china eastern airlines": "MU",
  "china eastern": "MU",
  "air china": "CA",
  "hainan airlines": "HU",
  "ana all nippon airways": "NH",
  "all nippon airways": "NH",
  "kenya airways": "KQ",
  qantas: "QF",
  "qantas airways": "QF",
  "tap air portugal": "TP",
  tap: "TP",
  avianca: "AV",
  "sa avianca": "AV",
  austrian: "OS",
  "austrian airlines": "OS",
  sas: "SK",
  "sas scandinavian airlines": "SK",
  "scandinavian airlines": "SK",
  condor: "DE",
  "condor airlines": "DE",
  aeromexico: "AM",
  "aero mexico": "AM",
  "caribbean airlines": "BW",
  "carribean airlines": "BW",
  "etihad airways": "EY",
  "virgin atlantic": "VS",
  "virigin atlantic": "VS",
  "el al": "LY",
  "el al israel airlines": "LY",
  "ei ai": "LY",
};

const airlineIataToIcao = {
  AC: "ACA",
  WS: "WJA",
  AA: "AAL",
  DL: "DAL",
  UA: "UAL",
  BA: "BAW",
  LH: "DLH",
  AF: "AFR",
  KL: "KLM",
  EK: "UAE",
  KE: "KAL",
  TS: "TSC",
  PD: "POE",
  F8: "FLE",
  WG: "SWG",
  TK: "THY",
  QR: "QTR",
  ET: "ETH",
  NH: "ANA",
  JL: "JAL",
  CX: "CPA",
  SQ: "SIA",
  EI: "EIN",
  MS: "MSR",
  LA: "LAN",
  JJ: "TAM",
  CZ: "CSN",
  MU: "CES",
  CA: "CCA",
  HU: "CHH",
  KQ: "KQA",
  QF: "QFA",
  TP: "TAP",
  AV: "AVA",
  OS: "AUA",
  SK: "SAS",
  DE: "CFG",
  AM: "AMX",
  BW: "BWA",
  EY: "ETD",
  VS: "VIR",
  LY: "ELY",
};

function normalizeAirlineName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function inferredAirlineCodes(flight) {
  const iataCodes = new Set();
  const icaoCodes = new Set();

  const explicitIata = String(flight && flight.airlineIata ? flight.airlineIata : "")
    .trim()
    .toUpperCase();
  const explicitIcao = String(flight && flight.airlineIcao ? flight.airlineIcao : "")
    .trim()
    .toUpperCase();

  if (/^[A-Z0-9]{2}$/.test(explicitIata)) {
    iataCodes.add(explicitIata);
  }

  if (/^[A-Z0-9]{3}$/.test(explicitIcao)) {
    icaoCodes.add(explicitIcao);
  }

  const fromFlightIata = String(flight && flight.flightIata ? flight.flightIata : "")
    .trim()
    .toUpperCase();

  if (/^[A-Z0-9]{2,3}/.test(fromFlightIata)) {
    const prefix2 = fromFlightIata.slice(0, 2);
    const prefix3 = fromFlightIata.slice(0, 3);

    if (/^[A-Z0-9]{2}$/.test(prefix2)) {
      iataCodes.add(prefix2);
    }

    if (/^[A-Z0-9]{3}$/.test(prefix3)) {
      icaoCodes.add(prefix3);
    }
  }

  const airlineName = normalizeAirlineName(flight && flight.airline ? flight.airline : "");
  if (airlineName && airlineNameToCode[airlineName]) {
    iataCodes.add(airlineNameToCode[airlineName]);
  }

  return [...iataCodes, ...icaoCodes];
}

function logopediaLogoCandidates(flight, codes) {
  const airlineName = String(flight && flight.airline ? flight.airline : "").trim();

  if (!airlineName) {
    return [];
  }

  const normalizedName = airlineName
    .replaceAll("&", "and")
    .replace(/[^A-Za-z0-9\s-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizedName) {
    return [];
  }

  const title = normalizedName.replace(/\s+/g, "_");
  const candidates = [
    `https://logos.fandom.com/wiki/Special:FilePath/${encodeURIComponent(title)}_logo.svg`,
    `https://logos.fandom.com/wiki/Special:FilePath/${encodeURIComponent(title)}_logo.png`,
    `https://logos.fandom.com/wiki/Special:FilePath/${encodeURIComponent(title)}_Logo.svg`,
    `https://logos.fandom.com/wiki/Special:FilePath/${encodeURIComponent(title)}_Logo.png`,
  ];

  for (const code of codes) {
    candidates.push(
      `https://logos.fandom.com/wiki/Special:FilePath/${encodeURIComponent(title)}_${encodeURIComponent(code)}_logo.svg`,
    );
    candidates.push(
      `https://logos.fandom.com/wiki/Special:FilePath/${encodeURIComponent(title)}_${encodeURIComponent(code)}_logo.png`,
    );
  }

  return candidates;
}

function airlineLogoCandidates(flight) {
  const codes = inferredAirlineCodes(flight);

  const icaoCodes = new Set(
    codes.filter((code) => /^[A-Z0-9]{3}$/.test(code)),
  );

  for (const iataCode of codes.filter((code) => /^[A-Z0-9]{2}$/.test(code))) {
    if (airlineIataToIcao[iataCode]) {
      icaoCodes.add(airlineIataToIcao[iataCode]);
    }
  }

  const repoCandidates = [...icaoCodes].flatMap((icaoCode) => [
    `https://cdn.jsdelivr.net/gh/sexym0nk3y/airline-logos@main/logos/${encodeURIComponent(icaoCode)}.png`,
    `https://raw.githubusercontent.com/sexym0nk3y/airline-logos/main/logos/${encodeURIComponent(icaoCode)}.png`,
  ]);

  const logopediaCandidates = logopediaLogoCandidates(flight, codes);

  const candidates = [];

  candidates.push(...repoCandidates);

  candidates.push(...logopediaCandidates);

  for (const code of codes) {
    if (airlineLogoCatalogueByCode[code]) {
      candidates.push(airlineLogoCatalogueByCode[code]);
    }
  }

  return [...new Set(candidates)].filter(Boolean);
}

if (typeof window !== "undefined" && !window.handleAirlineLogoError) {
  window.handleAirlineLogoError = (img) => {
    const queue = (img.dataset.fallbackSrc || "")
      .split("|")
      .map((value) => value.trim())
      .filter(Boolean);

    if (!queue.length) {
      img.style.display = "none";
      return;
    }

    const [next, ...rest] = queue;
    img.dataset.fallbackSrc = rest.join("|");
    img.src = next;
  };
}

function airlineLogoUrl(flight) {
  const candidates = airlineLogoCandidates(flight);
  return candidates.length ? candidates[0] : null;
}

function airlineLogoCandidatesForName(airlineName) {
  return airlineLogoCandidates({ airline: airlineName });
}

function airlineLogoUrlForName(airlineName) {
  const candidates = airlineLogoCandidatesForName(airlineName);
  return candidates.length ? candidates[0] : null;
}

function statusLabel(status, isLive) {
  if (isLive) {
    return "live";
  }

  return status || "unknown";
}

function describeRoute(flight) {
  const depFlag = airportFlag(flight.departureIata, flight.departureCountryCode);
  const arrFlag = airportFlag(flight.arrivalIata, flight.arrivalCountryCode);
  const depCode = flight.departureIata || "—";
  const arrCode = flight.arrivalIata || "—";

  return {
    primary: `${depFlag} ${depCode} → ${arrFlag} ${arrCode}`,
    secondary: `${flight.departureAirport} → ${flight.arrivalAirport}`,
  };
}

function findFlightById(flightId) {
  return latestFlights.find((flight) => flight.id === flightId) || null;
}

function currentFilters() {
  return {
    status: elements.filterStatus ? elements.filterStatus.value : "all",
    airlineQuery: elements.filterAirline ? elements.filterAirline.value.trim().toLowerCase() : "",
    destinationQuery: elements.filterDestination ? elements.filterDestination.value.trim().toLowerCase() : "",
    limit: elements.filterLimit ? elements.filterLimit.value : "all",
  };
}

function renderActiveFilterChips(filters) {
  if (!elements.activeFilterChips) {
    return;
  }

  const chips = [];

  if (filters.status !== "all") {
    chips.push(`Status: ${filters.status}`);
  }

  if (filters.airlineQuery) {
    chips.push(`Airline: ${filters.airlineQuery}`);
  }

  if (filters.destinationQuery) {
    chips.push(`Destination: ${filters.destinationQuery}`);
  }

  if (filters.limit !== "all") {
    chips.push(`Max: ${filters.limit}`);
  }

  if (!chips.length) {
    elements.activeFilterChips.classList.add("hidden");
    elements.activeFilterChips.innerHTML = "";
    return;
  }

  elements.activeFilterChips.classList.remove("hidden");
  elements.activeFilterChips.innerHTML = chips
    .map((chip) => `<span class="filter-chip">${escapeHtml(chip)}</span>`)
    .join("");
}

function applyFlightFilters(flights, filters) {
  let output = [...flights];

  if (filters.status === "live") {
    output = output.filter((flight) => flight.isLive);
  } else if (filters.status !== "all") {
    output = output.filter((flight) => (flight.status || "").toLowerCase() === filters.status);
  }

  if (filters.airlineQuery) {
    output = output.filter((flight) =>
      (flight.airline || "").toLowerCase().includes(filters.airlineQuery),
    );
  }

  if (filters.destinationQuery) {
    output = output.filter((flight) => {
      const searchable = [
        flight.arrivalAirport,
        flight.arrivalIata,
        flight.arrivalIcao,
        flight.departureAirport,
        flight.departureIata,
        flight.departureIcao,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(filters.destinationQuery);
    });
  }

  if (filters.limit !== "all") {
    const parsed = Number(filters.limit);
    if (Number.isFinite(parsed) && parsed > 0) {
      output = output.slice(0, parsed);
    }
  }

  return output;
}

function filteredArrivalFlights() {
  return applyFlightFilters(latestArrivals, currentFilters());
}

function filteredDepartureFlights() {
  return applyFlightFilters(latestDepartures, currentFilters());
}

function updateFilteredView() {
  const filters = currentFilters();
  renderActiveFilterChips(filters);
  const filteredAll = applyFlightFilters(latestFlights, filters);
  const arrivalsFiltered = filteredArrivalFlights();
  const departuresFiltered = filteredDepartureFlights();

  const arrivalTotalDisplay = latestArrivalTotal || latestArrivals.length;
  const departureTotalDisplay = latestDepartureTotal || latestDepartures.length;

  elements.arrivalsCount.textContent = String(arrivalTotalDisplay);
  elements.departuresCount.textContent = String(departureTotalDisplay);
  elements.arrivalsPill.textContent = `${arrivalsFiltered.length} shown · ${arrivalTotalDisplay} total`;
  elements.departuresPill.textContent = `${departuresFiltered.length} shown · ${departureTotalDisplay} total`;

  renderFlights(
    elements.arrivalsTableBody,
    arrivalsFiltered,
    "No arrival flights match current filters.",
  );
  renderFlights(
    elements.departuresTableBody,
    departuresFiltered,
    "No departure flights match current filters.",
  );

  createOrUpdateTopRoutesChart(filteredAll);
  createOrUpdateHourlyClockChart(filteredAll);
  createOrUpdateDomesticMixChart(filteredAll);

  if (!selectedFlightId || !filteredAll.some((flight) => flight.id === selectedFlightId)) {
    selectedFlightId = filteredAll.length ? filteredAll[0].id : null;
  }

  renderConstellation(filteredAll);
  highlightFlightRows(selectedFlightId);
  renderSelectedFlightPanel(findFlightById(selectedFlightId));
}

function renderSelectedFlightPanel(flight) {
  if (!elements.selectedFlightPanel) {
    return;
  }

  if (!flight) {
    elements.selectedFlightPanel.innerHTML = `
      <h4>Selected flight</h4>
      <p>Click a point on the map to inspect a flight and highlight it in the board.</p>
    `;
    return;
  }

  const depFlag = airportFlagHtml(
    flight.departureIata,
    flight.departureCountryCode,
    `${flight.departureIata || "Unknown"} country flag`,
  );
  const arrFlag = airportFlagHtml(
    flight.arrivalIata,
    flight.arrivalCountryCode,
    `${flight.arrivalIata || "Unknown"} country flag`,
  );

  elements.selectedFlightPanel.innerHTML = `
    <h4>Selected flight · ${escapeHtml(flight.flightIata)}</h4>
    <div class="selected-flight-grid">
      <div><b>Airline</b><span>${escapeHtml(flight.airline)}</span></div>
      <div><b>Aircraft</b><span>${escapeHtml(flight.aircraftModel ? `${flight.aircraftModel} (${flight.aircraftId})` : (flight.aircraftId || "Unknown"))}</span></div>
      <div><b>Route</b><span>${depFlag} ${escapeHtml(flight.departureIata || "—")} → ${arrFlag} ${escapeHtml(flight.arrivalIata || "—")}</span></div>
      <div><b>Status</b><span>${escapeHtml(statusLabel(flight.status, flight.isLive))}</span></div>
      <div><b>Schedule</b><span>${escapeHtml(formatTime(flight.scheduledTime))}</span></div>
      <div><b>Actual / Est.</b><span>${escapeHtml(formatTime(flight.actualTime))}</span></div>
    </div>
  `;
}

function highlightFlightRows(flightId) {
  document.querySelectorAll(".flight-row").forEach((row) => {
    row.classList.toggle("selected", row.dataset.flightId === flightId);
  });
}

function highlightMapPoints(flightId) {
  if (flightMarkersById.size) {
    for (const [id, marker] of flightMarkersById.entries()) {
      const selected = id === flightId;
      marker.setStyle({
        radius: selected ? 7.5 : 5,
        weight: selected ? 2.6 : 1.4,
        opacity: selected ? 1 : 0.9,
        fillOpacity: selected ? 1 : 0.86,
      });
    }

    return;
  }

  if (!elements.flightConstellation) {
    return;
  }

  elements.flightConstellation.querySelectorAll(".flight-point").forEach((point) => {
    point.classList.toggle("selected", point.dataset.flightId === flightId);
  });
}

function selectFlightById(flightId) {
  selectedFlightId = flightId;
  highlightFlightRows(flightId);
  highlightMapPoints(flightId);
  renderSelectedFlightPanel(findFlightById(flightId));
}

function showFlightTooltip(event, flight) {
  const tooltip = elements.flightTooltip;

  if (!tooltip || !elements.flightConstellation) {
    return;
  }

  const bounds = elements.flightConstellation.getBoundingClientRect();
  const x = Math.min(event.clientX - bounds.left + 14, bounds.width - 260);
  const y = Math.min(event.clientY - bounds.top + 14, bounds.height - 130);
  const depFlag = airportFlagHtml(
    flight.departureIata,
    flight.departureCountryCode,
    `${flight.departureIata || "Unknown"} country flag`,
  );
  const arrFlag = airportFlagHtml(
    flight.arrivalIata,
    flight.arrivalCountryCode,
    `${flight.arrivalIata || "Unknown"} country flag`,
  );

  tooltip.innerHTML = `
    <strong>${escapeHtml(flight.flightIata)} · ${escapeHtml(flight.airline)}</strong>
    <div><b>Route:</b> ${depFlag} ${escapeHtml(flight.departureIata || "—")} → ${arrFlag} ${escapeHtml(flight.arrivalIata || "—")}</div>
    <div><b>Destination:</b> ${escapeHtml(flight.arrivalAirport || "Unknown")}</div>
    <div><b>Aircraft:</b> ${escapeHtml(flight.aircraftModel ? `${flight.aircraftModel} (${flight.aircraftId})` : (flight.aircraftId || flight.flightIata))}</div>
    <div><b>Status:</b> ${escapeHtml(statusLabel(flight.status, flight.isLive))}</div>
    <div><b>Scheduled:</b> ${escapeHtml(formatTime(flight.scheduledTime))}</div>
  `;

  tooltip.style.left = `${Math.max(12, x)}px`;
  tooltip.style.top = `${Math.max(12, y)}px`;
  tooltip.classList.remove("hidden");
}

function hideFlightTooltip() {
  if (!elements.flightTooltip) {
    return;
  }

  elements.flightTooltip.classList.add("hidden");
}

function mapTileConfig(theme) {
  if (theme === "light") {
    return {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "&copy; OpenStreetMap contributors",
    };
  }

  return {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
  };
}

function syncMapThemeToggleUi() {
  if (!elements.mapThemeToggle) {
    return;
  }

  const isDark = mapTheme === "dark";
  elements.mapThemeToggle.textContent = isDark ? "🌙 Dark" : "☀️ Light";
  elements.mapThemeToggle.setAttribute("aria-pressed", String(isDark));
}

function applyLeafletMapTheme() {
  if (!window.L) {
    return;
  }

  const config = mapTileConfig(mapTheme);

  if (constellationMap) {
    if (mapTileLayer) {
      constellationMap.removeLayer(mapTileLayer);
    }

    mapTileLayer = window.L.tileLayer(config.url, {
      minZoom: 2,
      maxZoom: 6,
      noWrap: true,
      attribution: config.attribution,
    }).addTo(constellationMap);
  }

  syncAirportRestaurantsMapTheme();

  window.localStorage.setItem("planesight-map-theme", mapTheme);
  syncMapThemeToggleUi();
}

function buildFlightLatLon(flight) {
  const depRawLat = Number(flight.departureLat);
  const depRawLon = Number(flight.departureLon);
  const arrRawLat = Number(flight.arrivalLat);
  const arrRawLon = Number(flight.arrivalLon);

  const depKnown = knownAirportCoordinate(flight.departureIata);
  const arrKnown = knownAirportCoordinate(flight.arrivalIata);

  const depLat = isRenderableCoordinate(depRawLat, depRawLon)
    ? depRawLat
    : depKnown
      ? depKnown.lat
      : Number.NaN;
  const depLon = isRenderableCoordinate(depRawLat, depRawLon)
    ? depRawLon
    : depKnown
      ? depKnown.lon
      : Number.NaN;
  const arrLat = isRenderableCoordinate(arrRawLat, arrRawLon)
    ? arrRawLat
    : arrKnown
      ? arrKnown.lat
      : Number.NaN;
  const arrLon = isRenderableCoordinate(arrRawLat, arrRawLon)
    ? arrRawLon
    : arrKnown
      ? arrKnown.lon
      : Number.NaN;

  return {
    departure: isValidCoordinate(depLat, depLon) ? [depLat, depLon] : null,
    arrival: isValidCoordinate(arrLat, arrLon) ? [arrLat, arrLon] : null,
  };
}

function markerLatLonForFlight(flight, coords) {
  if (flight.direction === "arrival" && coords.departure) {
    return coords.departure;
  }

  if (flight.direction === "departure" && coords.arrival) {
    return coords.arrival;
  }

  if (coords.arrival) {
    return coords.arrival;
  }

  if (coords.departure) {
    return coords.departure;
  }

  return null;
}

function tooltipMarkup(flight) {
  const depFlag = airportFlagHtml(
    flight.departureIata,
    flight.departureCountryCode,
    `${flight.departureIata || "Unknown"} country flag`,
  );
  const arrFlag = airportFlagHtml(
    flight.arrivalIata,
    flight.arrivalCountryCode,
    `${flight.arrivalIata || "Unknown"} country flag`,
  );

  return `
    <strong>${escapeHtml(flight.flightIata)} · ${escapeHtml(flight.airline)}</strong>
    <div><b>Route:</b> ${depFlag} ${escapeHtml(flight.departureIata || "—")} → ${arrFlag} ${escapeHtml(flight.arrivalIata || "—")}</div>
    <div><b>Destination:</b> ${escapeHtml(flight.arrivalAirport || "Unknown")}</div>
    <div><b>Aircraft:</b> ${escapeHtml(flight.aircraftModel ? `${flight.aircraftModel} (${flight.aircraftId})` : (flight.aircraftId || flight.flightIata))}</div>
    <div><b>Status:</b> ${escapeHtml(statusLabel(flight.status, flight.isLive))}</div>
    <div><b>Scheduled:</b> ${escapeHtml(formatTime(flight.scheduledTime))}</div>
  `;
}

function ensureLeafletConstellation(container) {
  if (!window.L) {
    return false;
  }

  if (constellationMap && constellationHost && container.contains(constellationHost)) {
    return true;
  }

  container.querySelectorAll(".flight-point").forEach((node) => node.remove());
  container.querySelectorAll(".route-layer").forEach((node) => node.remove());
  hideFlightTooltip();

  if (constellationMap) {
    constellationMap.remove();
    constellationMap = null;
  }

  let host = container.querySelector(".flight-map");

  if (!host) {
    host = document.createElement("div");
    host.className = "flight-map";
    container.prepend(host);
  }

  constellationHost = host;

  constellationMap = window.L.map(host, {
    zoomControl: true,
    attributionControl: true,
    minZoom: 2,
    maxZoom: 6,
    worldCopyJump: false,
    maxBounds: [[-85, -180], [85, 180]],
    maxBoundsViscosity: 1,
  });

  applyLeafletMapTheme();

  routeLayerGroup = window.L.layerGroup().addTo(constellationMap);
  markerLayerGroup = window.L.layerGroup().addTo(constellationMap);
  hasLeafletViewportSet = false;
  flightMarkersById.clear();

  constellationMap.setView([35, -20], 2);
  return true;
}

function renderConstellationLeaflet(flights) {
  const container = elements.flightConstellation;

  if (!container || !ensureLeafletConstellation(container) || !constellationMap) {
    return false;
  }

  routeLayerGroup.clearLayers();
  markerLayerGroup.clearLayers();
  flightMarkersById.clear();
  container.querySelectorAll(".airport-point").forEach((node) => node.remove());

  const boundsPoints = [];

  for (const flight of flights) {
    const coords = buildFlightLatLon(flight);
    const color = getStatusColor((flight.status || "").toLowerCase());
    const isArrival = flight.direction === "arrival";

    if (coords.departure && coords.arrival) {
      const route = window.L.polyline([coords.departure, coords.arrival], {
        color,
        weight: isArrival ? 1.9 : 2,
        opacity: isArrival ? 0.64 : 0.76,
        dashArray: isArrival ? "8 6" : undefined,
      });
      route.addTo(routeLayerGroup);
      boundsPoints.push(coords.departure, coords.arrival);
    }

    const markerPoint = markerLatLonForFlight(flight, coords);

    if (!markerPoint) {
      continue;
    }

    const marker = window.L.circleMarker(markerPoint, {
      radius: 5,
      color: "rgba(255,255,255,0.95)",
      weight: 1.4,
      fillColor: color,
      fillOpacity: 0.86,
      opacity: 0.9,
    });

    marker.on("mouseover", () => marker.bindTooltip(tooltipMarkup(flight), {
      direction: "top",
      sticky: true,
      opacity: 0.96,
    }).openTooltip());
    marker.on("click", () => selectFlightById(flight.id));
    marker.addTo(markerLayerGroup);

    flightMarkersById.set(flight.id, marker);
    boundsPoints.push(markerPoint);
  }

  if (boundsPoints.length && !hasLeafletViewportSet) {
    constellationMap.fitBounds(boundsPoints, {
      padding: [24, 24],
      maxZoom: 3,
    });
    hasLeafletViewportSet = true;
  }

  highlightMapPoints(selectedFlightId);
  return true;
}

function renderConstellation(flights) {
  if (renderConstellationLeaflet(flights)) {
    return;
  }

  renderConstellationFallback(flights);
}

function renderConstellationFallback(flights) {
  const container = elements.flightConstellation;

  if (!container) {
    return;
  }

  container.querySelectorAll(".flight-point").forEach((node) => node.remove());
  container.querySelectorAll(".route-layer").forEach((node) => node.remove());
  container.querySelectorAll(".airport-point").forEach((node) => node.remove());
  hideFlightTooltip();

  const width = container.clientWidth || 900;
  const height = container.clientHeight || 460;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "route-layer");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("preserveAspectRatio", "none");
  container.appendChild(svg);

  const mapWidth = Math.min(width, height * worldMapAspectRatio);
  const mapHeight = mapWidth / worldMapAspectRatio;
  const mapOffsetX = (width - mapWidth) / 2;
  const mapOffsetY = (height - mapHeight) / 2;

  function randomPointInsideMap(flightId) {
    const mapX = 4 + seededUnit(flightId, "x") * 92;
    const mapY = 4 + seededUnit(flightId, "y") * 92;

    return {
      x: ((mapOffsetX + (mapX / 100) * mapWidth) / width) * 100,
      y: ((mapOffsetY + (mapY / 100) * mapHeight) / height) * 100,
    };
  }

  flights.forEach((flight) => {
    const depRawLat = Number(flight.departureLat);
    const depRawLon = Number(flight.departureLon);
    const arrRawLat = Number(flight.arrivalLat);
    const arrRawLon = Number(flight.arrivalLon);

    const depKnown = knownAirportCoordinate(flight.departureIata);
    const arrKnown = knownAirportCoordinate(flight.arrivalIata);

    const depLat = isRenderableCoordinate(depRawLat, depRawLon)
      ? depRawLat
      : depKnown
        ? depKnown.lat
        : Number.NaN;
    const depLon = isRenderableCoordinate(depRawLat, depRawLon)
      ? depRawLon
      : depKnown
        ? depKnown.lon
        : Number.NaN;
    const arrLat = isRenderableCoordinate(arrRawLat, arrRawLon)
      ? arrRawLat
      : arrKnown
        ? arrKnown.lat
        : Number.NaN;
    const arrLon = isRenderableCoordinate(arrRawLat, arrRawLon)
      ? arrRawLon
      : arrKnown
        ? arrKnown.lon
        : Number.NaN;

    let x;
    let y;

    if (isValidCoordinate(depLat, depLon) && isValidCoordinate(arrLat, arrLon)) {
      const rawFrom = projectCoordinate(depLat, depLon);
      const rawTo = projectCoordinate(arrLat, arrLon);
      const from = mapCoordinateToContainer(rawFrom, width, height);
      const to = mapCoordinateToContainer(rawTo, width, height);
      const routeDirectionClass = flight.direction === "arrival" ? "arrival-route" : "departure-route";

      const deltaX = to.x - from.x;
      const deltaY = to.y - from.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const curveLift = Math.min(18, Math.max(4, distance * 0.22));
      const controlX = (from.x + to.x) / 2;
      const controlY = (from.y + to.y) / 2 - curveLift;

      const pathData = `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;

      const routeArc = document.createElementNS("http://www.w3.org/2000/svg", "path");
      routeArc.setAttribute("class", `route-arc ${routeDirectionClass}`);
      routeArc.setAttribute("d", pathData);
      routeArc.setAttribute("stroke", getStatusColor((flight.status || "").toLowerCase()));
      svg.appendChild(routeArc);

      const routeLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      routeLine.setAttribute("class", `route-line ${routeDirectionClass}`);
      routeLine.setAttribute("x1", String(from.x));
      routeLine.setAttribute("y1", String(from.y));
      routeLine.setAttribute("x2", String(to.x));
      routeLine.setAttribute("y2", String(to.y));
      routeLine.setAttribute("stroke", getStatusColor((flight.status || "").toLowerCase()));
      svg.appendChild(routeLine);

      const fromDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      fromDot.setAttribute("class", "route-endpoint");
      fromDot.setAttribute("cx", String(from.x));
      fromDot.setAttribute("cy", String(from.y));
      fromDot.setAttribute("r", "0.45");
      fromDot.setAttribute("fill", "rgba(233, 242, 255, 0.72)");
      svg.appendChild(fromDot);

      const toDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      toDot.setAttribute("class", "route-endpoint");
      toDot.setAttribute("cx", String(to.x));
      toDot.setAttribute("cy", String(to.y));
      toDot.setAttribute("r", "0.45");
      toDot.setAttribute("fill", "rgba(233, 242, 255, 0.72)");
      svg.appendChild(toDot);

      if (flight.direction === "arrival") {
        x = from.x;
        y = from.y;
      } else if (flight.direction === "departure") {
        x = to.x;
        y = to.y;
      } else {
        x = (from.x + to.x) / 2;
        y = (from.y + to.y) / 2;
      }
    } else if (isValidCoordinate(depLat, depLon)) {
      const from = mapCoordinateToContainer(projectCoordinate(depLat, depLon), width, height);
      x = from.x;
      y = from.y;
    } else if (isValidCoordinate(arrLat, arrLon)) {
      const to = mapCoordinateToContainer(projectCoordinate(arrLat, arrLon), width, height);
      x = to.x;
      y = to.y;
    } else {
      const fallback = randomPointInsideMap(flight.id);
      x = fallback.x;
      y = fallback.y;
    }

    const point = document.createElement("button");
    point.type = "button";
    point.className = "flight-point";
    point.dataset.flightId = flight.id;

    const normalizedStatus = (flight.status || "").toLowerCase();
    point.style.background = getStatusColor(normalizedStatus);

    point.style.left = `${x}%`;
    point.style.top = `${y}%`;

    point.setAttribute(
      "aria-label",
      `${flight.flightIata} to ${flight.arrivalAirport}, ${statusLabel(flight.status, flight.isLive)}`,
    );

    point.addEventListener("mouseenter", (event) => showFlightTooltip(event, flight));
    point.addEventListener("mousemove", (event) => showFlightTooltip(event, flight));
    point.addEventListener("focus", () => {
      const fakeEvent = {
        clientX: container.getBoundingClientRect().left + (x / 100) * width,
        clientY: container.getBoundingClientRect().top + (y / 100) * height,
      };
      showFlightTooltip(fakeEvent, flight);
    });
    point.addEventListener("click", () => {
      selectFlightById(flight.id);
    });
    point.addEventListener("mouseleave", hideFlightTooltip);
    point.addEventListener("blur", hideFlightTooltip);

    container.appendChild(point);
  });

  highlightMapPoints(selectedFlightId);
}

function renderFlights(tableBody, flights, emptyMessage) {
  if (!flights.length) {
    tableBody.innerHTML = `<tr><td colspan="4" class="empty-cell">${emptyMessage}</td></tr>`;
    return;
  }

  tableBody.innerHTML = flights
    .map(
      (flight) => {
        const depFlag = flagEmojiHtml(flight.departureIata, flight.departureCountryCode);
        const arrFlag = flagEmojiHtml(flight.arrivalIata, flight.arrivalCountryCode);
        const depCode = escapeHtml(flight.departureIata || "—");
        const arrCode = escapeHtml(flight.arrivalIata || "—");
        const routePrimary = `${depFlag} ${depCode} → ${arrFlag} ${arrCode}`;

        const airlineLogo = airlineLogoUrl(flight);
        const logoFallbacks = airlineLogoCandidates(flight).slice(1).join("|");
        const airlineSecondary = airlineLogo
          ? `<span class="airline-meta"><img class="airline-logo" src="${airlineLogo}" data-fallback-src="${escapeHtml(logoFallbacks)}" alt="" loading="lazy" decoding="async" onerror="window.handleAirlineLogoError && window.handleAirlineLogoError(this)" />${escapeHtml(flight.airline)}</span>`
          : escapeHtml(flight.airline);
        const normalizedStatus = (flight.status || "").toLowerCase();
        const statusClass = [
          normalizedStatus,
          flight.isLive ? "live" : "",
          normalizedStatus === "active" ? "active" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return `
        <tr class="flight-row ${flight.id === selectedFlightId ? "selected" : ""}" data-flight-id="${escapeHtml(flight.id)}">
          <td>${createCell(escapeHtml(flight.flightIata || "—"), airlineSecondary)}</td>
          <td>${createCell(routePrimary, describeRoute(flight).secondary)}</td>
          <td>${createCell(formatTime(flight.scheduledTime), `Actual/Est: ${formatTime(flight.actualTime)}`)}</td>
          <td>
            <span class="status-badge ${statusClass}">
              ${flight.isLive ? "Live" : flight.status}
            </span>
          </td>
        </tr>
      `;
      },
    )
    .join("");

  tableBody.querySelectorAll(".flight-row").forEach((row) => {
    row.addEventListener("click", () => {
      selectFlightById(row.dataset.flightId);
    });
  });
}

function showNotice(message) {
  if (!elements.noticePanel || !elements.noticeText) {
    return;
  }

  if (!message) {
    elements.noticePanel.classList.add("hidden");
    elements.noticeText.textContent = "";
    return;
  }

  elements.noticeText.textContent = message;
  elements.noticePanel.classList.remove("hidden");
}

function updateUnauthorizedFlag(message) {
  if (!elements.apiUnauthorizedFlag) {
    return;
  }

  const normalized = String(message || "").toLowerCase();
  const isUnauthorized =
    normalized.includes("unauthorized")
    || normalized.includes("request failed with 401")
    || normalized.includes("status 401");

  elements.apiUnauthorizedFlag.classList.toggle("hidden", !isUnauthorized);
}

function pauseAutoPollingForRateLimit() {
  if (pollingIntervalId) {
    window.clearInterval(pollingIntervalId);
    pollingIntervalId = null;
  }
}

async function fetchFlights(type, options = {}) {
  const airportCode = normalizeAirportCode(options.airportCode || activeAirportCode);
  const query = new URLSearchParams({ type, airport: airportCode });

  if (options.loadAllOnce) {
    query.set("all", "1");
  }

  const response = await fetch(`/api/flights?${query.toString()}`, {
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Unable to load ${type} flights.`);
  }

  return data;
}

async function loadAirportSnapshot(airportCode, options = {}) {
  const normalizedAirportCode = normalizeAirportCode(airportCode);
  const [arrivals, departures] = await Promise.all([
    fetchFlights("arrival", {
      airportCode: normalizedAirportCode,
      loadAllOnce: Boolean(options.loadAllOnce),
    }),
    fetchFlights("departure", {
      airportCode: normalizedAirportCode,
      loadAllOnce: Boolean(options.loadAllOnce),
    }),
  ]);

  const loadedArrivals = Number.isFinite(Number(arrivals.fetchedCount))
    ? Number(arrivals.fetchedCount)
    : arrivals.flights.length;
  const loadedDepartures = Number.isFinite(Number(departures.fetchedCount))
    ? Number(departures.fetchedCount)
    : departures.flights.length;

  const summaryMessage = options.loadAllOnce
    ? `Loaded ${loadedArrivals} arrivals and ${loadedDepartures} departures in one paginated snapshot.`
    : "";
  const upstreamMessage = arrivals.message || departures.message || "";
  const message = upstreamMessage ? (summaryMessage ? `${summaryMessage} ${upstreamMessage}` : upstreamMessage) : summaryMessage;

  return {
    airportCode: normalizedAirportCode,
    arrivals: arrivals.flights || [],
    departures: departures.flights || [],
    arrivalTotal: arrivals.totalAvailable,
    departureTotal: departures.totalAvailable,
    arrivalFetchedCount: arrivals.fetchedCount,
    departureFetchedCount: departures.fetchedCount,
    placeholder: Boolean(arrivals.placeholder || departures.placeholder),
    message,
  };
}

function cacheAirportSnapshot(snapshot) {
  airportSnapshotCache.set(snapshot.airportCode, snapshot);
}

function getCachedAirportSnapshot(airportCode) {
  return airportSnapshotCache.get(normalizeAirportCode(airportCode)) || null;
}

function createEmptyAirportSnapshot(airportCode, message = "") {
  return {
    airportCode: normalizeAirportCode(airportCode),
    arrivals: [],
    departures: [],
    arrivalTotal: 0,
    departureTotal: 0,
    placeholder: true,
    message,
  };
}

function selectAirport(airportCode) {
  const normalizedAirportCode = normalizeAirportCode(airportCode);
  const cachedSnapshot = getCachedAirportSnapshot(normalizedAirportCode);

  if (cachedSnapshot) {
    applyAirportSnapshot(cachedSnapshot);
    return;
  }

  latestArrivals = [];
  latestDepartures = [];
  latestFlights = [];
  latestArrivalTotal = 0;
  latestDepartureTotal = 0;
  updateAirportShell(normalizedAirportCode);
  updateFilteredView();
}

async function refreshFlights() {
  if (isRefreshing || isLoadingAll) {
    return;
  }

  if (!activeAirportCode) {
    return;
  }

  const requestedAirportCode = activeAirportCode;
  isRefreshing = true;
  elements.refreshButton.disabled = true;
  elements.refreshButton.textContent = `Refreshing ${requestedAirportCode}…`;

  try {
    const snapshot = await loadAirportSnapshot(requestedAirportCode);
    cacheAirportSnapshot(snapshot);

    if (requestedAirportCode === activeAirportCode) {
      applyAirportSnapshot(snapshot);
      elements.lastUpdatedText.textContent = `Last updated ${new Intl.DateTimeFormat(
        "en-CA",
        {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
        },
      ).format(new Date())}`;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load flight data.";
    showNotice(message);
    updateUnauthorizedFlag(message);
  } finally {
    isRefreshing = false;
    elements.refreshButton.disabled = false;
    elements.refreshButton.textContent = "Refresh now";
  }
}

async function loadAllFlightsOnce() {
  if (isRefreshing || isLoadingAll) {
    return;
  }

  if (!activeAirportCode) {
    return;
  }

  const requestedAirportCode = activeAirportCode;
  isLoadingAll = true;
  elements.refreshButton.disabled = true;

  if (elements.loadAllOnceButton) {
    elements.loadAllOnceButton.disabled = true;
    elements.loadAllOnceButton.textContent = "Loading all…";
  }

  try {
    const snapshot = await loadAirportSnapshot(requestedAirportCode, { loadAllOnce: true });
    cacheAirportSnapshot(snapshot);

    if (requestedAirportCode === activeAirportCode) {
      applyAirportSnapshot(snapshot);
      elements.lastUpdatedText.textContent = `Last updated ${new Intl.DateTimeFormat(
        "en-CA",
        {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
        },
      ).format(new Date())}`;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load all flight pages.";
    showNotice(message);
    updateUnauthorizedFlag(message);
  } finally {
    isLoadingAll = false;
    elements.refreshButton.disabled = false;

    if (elements.loadAllOnceButton) {
      elements.loadAllOnceButton.disabled = false;
      elements.loadAllOnceButton.textContent = "Load all once";
    }
  }
}

async function bootstrapAirportSnapshots() {
  const airportCodes = Object.keys(airportDefinitions);
  const results = await Promise.allSettled(
    airportCodes.map(async (airportCode) => {
      const snapshot = await loadAirportSnapshot(airportCode);
      cacheAirportSnapshot(snapshot);
      return snapshot;
    }),
  );

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      return;
    }

    const airportCode = airportCodes[index];
    cacheAirportSnapshot(
      createEmptyAirportSnapshot(airportCode, result.reason instanceof Error
        ? result.reason.message
        : `Unable to load ${airportCode} flight data.`),
    );
  });

  activeAirportCode = null;
  lockAirportGate();
  hideAirportDataShell();
}

function refreshWhenVisible() {
  if (document.visibilityState === "visible") {
    refreshFlights();
  }
}

function reflowResponsiveVisuals() {
  if (responsiveLayoutFrameId) {
    window.cancelAnimationFrame(responsiveLayoutFrameId);
  }

  responsiveLayoutFrameId = window.requestAnimationFrame(() => {
    responsiveLayoutFrameId = null;

    if (constellationMap) {
      constellationMap.invalidateSize();
      hasLeafletViewportSet = false;
    }

    if (latestFlights.length) {
      updateFilteredView();
    }
  });
}

elements.refreshButton.addEventListener("click", () => {
  if (!pollingIntervalId) {
    pollingIntervalId = window.setInterval(refreshWhenVisible, refreshIntervalMs);
  }
  refreshFlights();
});

elements.airportSelectorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const airportCode = button.dataset.airportCode;

    if (!airportCode || normalizeAirportCode(airportCode) === activeAirportCode) {
      return;
    }

    selectAirport(airportCode);

    if (!pollingIntervalId) {
      pollingIntervalId = window.setInterval(refreshWhenVisible, refreshIntervalMs);
    }

    window.setTimeout(() => {
      const target = document.getElementById("dashboardStart");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 180);
  });
});

if (elements.loadAllOnceButton) {
  elements.loadAllOnceButton.addEventListener("click", () => {
    loadAllFlightsOnce();
  });
}

if (elements.filterStatus) {
  elements.filterStatus.addEventListener("change", updateFilteredView);
}

if (elements.filterAirline) {
  elements.filterAirline.addEventListener("input", updateFilteredView);
}

if (elements.filterDestination) {
  elements.filterDestination.addEventListener("input", updateFilteredView);
}

if (elements.filterLimit) {
  elements.filterLimit.addEventListener("change", updateFilteredView);
}

if (elements.clearFiltersButton) {
  elements.clearFiltersButton.addEventListener("click", () => {
    if (elements.filterStatus) {
      elements.filterStatus.value = "all";
    }
    if (elements.filterAirline) {
      elements.filterAirline.value = "";
    }
    if (elements.filterDestination) {
      elements.filterDestination.value = "";
    }
    if (elements.filterLimit) {
      elements.filterLimit.value = "all";
    }

    updateFilteredView();
  });
}

if (elements.mapThemeToggle) {
  syncMapThemeToggleUi();

  elements.mapThemeToggle.addEventListener("click", () => {
    mapTheme = mapTheme === "dark" ? "light" : "dark";
    applyLeafletMapTheme();
  });
}

bootstrapAirportSnapshots();
window.addEventListener("resize", reflowResponsiveVisuals, { passive: true });
window.addEventListener("orientationchange", reflowResponsiveVisuals);

// Initialize hero scroll animation
initHeroScrollAnimation();
initRevealSectionsAndNavWheel();
initAirportPhotoRotator();
