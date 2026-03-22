const refreshIntervalMs = Math.max(
  Number(window.PLANESIGHT_REFRESH_INTERVAL_MS || 300000),
  10000,
);

const statusColorMap = {
  scheduled: "#9fb3d2",
  active: "#56ccf2",
  landed: "#6ee7b7",
  cancelled: "#ff8a80",
  incident: "#ffb86b",
  diverted: "#d7b6ff",
};

let topRoutesChart;
let hourlyClockChart;
let selectedFlightId = null;
let latestFlights = [];
let pollingIntervalId = null;
let latestArrivals = [];
let latestDepartures = [];

const elements = {
  refreshButton: document.getElementById("refreshButton"),
  lastUpdatedText: document.getElementById("lastUpdatedText"),
  arrivalsCount: document.getElementById("arrivalsCount"),
  departuresCount: document.getElementById("departuresCount"),
  liveCount: document.getElementById("liveCount"),
  arrivalsPill: document.getElementById("arrivalsPill"),
  departuresPill: document.getElementById("departuresPill"),
  arrivalsTableBody: document.getElementById("arrivalsTableBody"),
  departuresTableBody: document.getElementById("departuresTableBody"),
  noticePanel: document.getElementById("noticePanel"),
  noticeText: document.getElementById("noticeText"),
  topRoutesChart: document.getElementById("topRoutesChart"),
  hourlyClockChart: document.getElementById("hourlyClockChart"),
  flightConstellation: document.getElementById("flightConstellation"),
  flightTooltip: document.getElementById("flightTooltip"),
  selectedFlightPanel: document.getElementById("selectedFlightPanel"),
  filterStatus: document.getElementById("filterStatus"),
  filterDirection: document.getElementById("filterDirection"),
  filterAirline: document.getElementById("filterAirline"),
  filterLimit: document.getElementById("filterLimit"),
  clearFiltersButton: document.getElementById("clearFiltersButton"),
  activeFilterChips: document.getElementById("activeFilterChips"),
};

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

function createOrUpdateTopRoutesChart(flights) {
  if (!elements.topRoutesChart || typeof Chart === "undefined") {
    return;
  }

  const topRoutes = buildTopRoutes(flights);
  const labels = topRoutes.map(([route]) => route);
  const values = topRoutes.map(([, count]) => count);
  const dataset = {
    label: "Flights",
    data: values,
    borderRadius: 8,
    backgroundColor: "rgba(86, 204, 242, 0.7)",
    borderColor: "rgba(176, 232, 255, 0.95)",
    borderWidth: 1,
  };

  const options = {
    indexAxis: "y",
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label(context) {
            return `${context.parsed.x} flights`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#d0ddf0", precision: 0 },
        grid: { color: "rgba(196, 217, 243, 0.15)" },
      },
      y: {
        ticks: { color: "#eff6ff" },
        grid: { display: false },
      },
    },
  };

  if (topRoutesChart) {
    topRoutesChart.data.labels = labels;
    topRoutesChart.data.datasets[0].data = values;
    topRoutesChart.update();
    return;
  }

  topRoutesChart = new Chart(elements.topRoutesChart, {
    type: "bar",
    data: { labels, datasets: [dataset] },
    options,
  });
}

function createOrUpdateHourlyClockChart(flights) {
  if (!elements.hourlyClockChart || typeof Chart === "undefined") {
    return;
  }

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
            return index % 2 === 0 ? hourLabels[index] : "";
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
    hourlyClockChart.update();
    return;
  }

  hourlyClockChart = new Chart(elements.hourlyClockChart, {
    type: "line",
    data: { labels: hourLabels, datasets: [dataset] },
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

function projectCoordinate(lat, lon) {
  return {
    x: ((lon + 180) / 360) * 100,
    y: ((90 - lat) / 180) * 100,
  };
}

function statusLabel(status, isLive) {
  if (isLive) {
    return "live";
  }

  return status || "unknown";
}

function describeRoute(flight) {
  const depFlag = countryCodeToFlag(flight.departureCountryCode);
  const arrFlag = countryCodeToFlag(flight.arrivalCountryCode);
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
    direction: elements.filterDirection ? elements.filterDirection.value : "all",
    airlineQuery: elements.filterAirline ? elements.filterAirline.value.trim().toLowerCase() : "",
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

  if (filters.direction !== "all") {
    chips.push(`Direction: ${filters.direction}`);
  }

  if (filters.airlineQuery) {
    chips.push(`Airline: ${filters.airlineQuery}`);
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

  if (filters.direction !== "all") {
    output = output.filter((flight) => flight.direction === filters.direction);
  }

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

  if (filters.limit !== "all") {
    const parsed = Number(filters.limit);
    if (Number.isFinite(parsed) && parsed > 0) {
      output = output.slice(0, parsed);
    }
  }

  return output;
}

function filteredArrivalFlights() {
  const filters = currentFilters();

  if (filters.direction === "departure") {
    return [];
  }

  const statusAdjusted = {
    ...filters,
    direction: "all",
  };

  return applyFlightFilters(latestArrivals, statusAdjusted);
}

function filteredDepartureFlights() {
  const filters = currentFilters();

  if (filters.direction === "arrival") {
    return [];
  }

  const statusAdjusted = {
    ...filters,
    direction: "all",
  };

  return applyFlightFilters(latestDepartures, statusAdjusted);
}

function updateFilteredView() {
  const filters = currentFilters();
  renderActiveFilterChips(filters);
  const filteredAll = applyFlightFilters(latestFlights, filters);
  const arrivalsFiltered = filteredArrivalFlights();
  const departuresFiltered = filteredDepartureFlights();

  elements.arrivalsCount.textContent = String(arrivalsFiltered.length);
  elements.departuresCount.textContent = String(departuresFiltered.length);
  elements.arrivalsPill.textContent = `${arrivalsFiltered.length} flights`;
  elements.departuresPill.textContent = `${departuresFiltered.length} flights`;
  elements.liveCount.textContent = String(filteredAll.filter((flight) => flight.isLive).length);

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

  const depFlag = countryCodeToFlag(flight.departureCountryCode);
  const arrFlag = countryCodeToFlag(flight.arrivalCountryCode);

  elements.selectedFlightPanel.innerHTML = `
    <h4>Selected flight · ${escapeHtml(flight.flightIata)}</h4>
    <div class="selected-flight-grid">
      <div><b>Airline</b><span>${escapeHtml(flight.airline)}</span></div>
      <div><b>Plane ID</b><span>${escapeHtml(flight.aircraftId || "Unknown")}</span></div>
      <div><b>Route</b><span>${escapeHtml(`${depFlag} ${flight.departureIata || "—"} → ${arrFlag} ${flight.arrivalIata || "—"}`)}</span></div>
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
  const depFlag = countryCodeToFlag(flight.departureCountryCode);
  const arrFlag = countryCodeToFlag(flight.arrivalCountryCode);

  tooltip.innerHTML = `
    <strong>${flight.flightIata} · ${flight.airline}</strong>
    <div><b>Route:</b> ${depFlag} ${flight.departureIata || "—"} → ${arrFlag} ${flight.arrivalIata || "—"}</div>
    <div><b>Destination:</b> ${flight.arrivalAirport}</div>
    <div><b>Plane ID:</b> ${flight.aircraftId || flight.flightIata}</div>
    <div><b>Status:</b> ${statusLabel(flight.status, flight.isLive)}</div>
    <div><b>Scheduled:</b> ${formatTime(flight.scheduledTime)}</div>
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

function renderConstellation(flights) {
  const container = elements.flightConstellation;

  if (!container) {
    return;
  }

  container.querySelectorAll(".flight-point").forEach((node) => node.remove());
  container.querySelectorAll(".route-layer").forEach((node) => node.remove());
  hideFlightTooltip();

  const width = container.clientWidth || 900;
  const height = container.clientHeight || 460;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "route-layer");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("preserveAspectRatio", "none");
  container.appendChild(svg);

  flights.forEach((flight) => {
    const depLat = Number(flight.departureLat);
    const depLon = Number(flight.departureLon);
    const arrLat = Number(flight.arrivalLat);
    const arrLon = Number(flight.arrivalLon);

    let x;
    let y;

    if (isValidCoordinate(depLat, depLon) && isValidCoordinate(arrLat, arrLon)) {
      const from = projectCoordinate(depLat, depLon);
      const to = projectCoordinate(arrLat, arrLon);

      const deltaX = to.x - from.x;
      const deltaY = to.y - from.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const curveLift = Math.min(18, Math.max(4, distance * 0.22));
      const controlX = (from.x + to.x) / 2;
      const controlY = (from.y + to.y) / 2 - curveLift;

      const pathData = `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;

      const routeArc = document.createElementNS("http://www.w3.org/2000/svg", "path");
      routeArc.setAttribute("class", "route-arc");
      routeArc.setAttribute("d", pathData);
      routeArc.setAttribute("stroke", getStatusColor((flight.status || "").toLowerCase()));
      svg.appendChild(routeArc);

      const routeLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      routeLine.setAttribute("class", "route-line");
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

      x = (from.x + to.x) / 2;
      y = (from.y + to.y) / 2;
    } else {
      x = 8 + seededUnit(flight.id, "x") * 84;
      y = 12 + seededUnit(flight.id, "y") * 76;
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
      (flight) => `
        <tr class="flight-row ${flight.id === selectedFlightId ? "selected" : ""}" data-flight-id="${escapeHtml(flight.id)}">
          <td>${createCell(`${countryCodeToFlag(flight.departureCountryCode)} ${flight.flightIata}`, flight.airline)}</td>
          <td>${createCell(describeRoute(flight).primary, describeRoute(flight).secondary)}</td>
          <td>${createCell(formatTime(flight.scheduledTime), `Actual/Est: ${formatTime(flight.actualTime)}`)}</td>
          <td>
            <span class="status-badge ${flight.isLive ? "live" : ""}">
              ${flight.isLive ? "Live" : flight.status}
            </span>
          </td>
        </tr>
      `,
    )
    .join("");

  tableBody.querySelectorAll(".flight-row").forEach((row) => {
    row.addEventListener("click", () => {
      selectFlightById(row.dataset.flightId);
    });
  });
}

function showNotice(message) {
  if (!message) {
    elements.noticePanel.classList.add("hidden");
    elements.noticeText.textContent = "";
    return;
  }

  elements.noticeText.textContent = message;
  elements.noticePanel.classList.remove("hidden");
}

function pauseAutoPollingForRateLimit() {
  if (pollingIntervalId) {
    window.clearInterval(pollingIntervalId);
    pollingIntervalId = null;
  }
}

async function fetchFlights(type) {
  const response = await fetch(`/api/flights?type=${type}`, {
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Unable to load ${type} flights.`);
  }

  return data;
}

async function refreshFlights() {
  elements.refreshButton.disabled = true;
  elements.refreshButton.textContent = "Refreshing…";

  try {
    const [arrivals, departures] = await Promise.all([
      fetchFlights("arrival"),
      fetchFlights("departure"),
    ]);

    latestArrivals = arrivals.flights.map((flight) => ({
      ...flight,
      direction: "arrival",
    }));
    latestDepartures = departures.flights.map((flight) => ({
      ...flight,
      direction: "departure",
    }));
    latestFlights = [...latestArrivals, ...latestDepartures];

    const message =
      arrivals.message || departures.message ||
      (arrivals.placeholder || departures.placeholder
        ? "Set AVIATIONSTACK_API_KEY to load live AviationStack data."
        : "");

    showNotice(message);

    if (message && message.toLowerCase().includes("rate limit")) {
      pauseAutoPollingForRateLimit();
    }

    updateFilteredView();

    elements.lastUpdatedText.textContent = `Last updated ${new Intl.DateTimeFormat(
      "en-CA",
      {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      },
    ).format(new Date())}`;
  } catch (error) {
    showNotice(error instanceof Error ? error.message : "Unable to load flight data.");
  } finally {
    elements.refreshButton.disabled = false;
    elements.refreshButton.textContent = "Refresh now";
  }
}

elements.refreshButton.addEventListener("click", () => {
  if (!pollingIntervalId) {
    pollingIntervalId = window.setInterval(refreshFlights, refreshIntervalMs);
  }
  refreshFlights();
});

if (elements.filterStatus) {
  elements.filterStatus.addEventListener("change", updateFilteredView);
}

if (elements.filterDirection) {
  elements.filterDirection.addEventListener("change", updateFilteredView);
}

if (elements.filterAirline) {
  elements.filterAirline.addEventListener("input", updateFilteredView);
}

if (elements.filterLimit) {
  elements.filterLimit.addEventListener("change", updateFilteredView);
}

if (elements.clearFiltersButton) {
  elements.clearFiltersButton.addEventListener("click", () => {
    if (elements.filterStatus) {
      elements.filterStatus.value = "all";
    }
    if (elements.filterDirection) {
      elements.filterDirection.value = "all";
    }
    if (elements.filterAirline) {
      elements.filterAirline.value = "";
    }
    if (elements.filterLimit) {
      elements.filterLimit.value = "all";
    }

    updateFilteredView();
  });
}

refreshFlights();
pollingIntervalId = window.setInterval(refreshFlights, refreshIntervalMs);
