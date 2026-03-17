const refreshIntervalMs = Math.max(
  Number(window.PLANESIGHT_REFRESH_INTERVAL_MS || 60000),
  10000,
);

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

function renderFlights(tableBody, flights, emptyMessage) {
  if (!flights.length) {
    tableBody.innerHTML = `<tr><td colspan="6" class="empty-cell">${emptyMessage}</td></tr>`;
    return;
  }

  tableBody.innerHTML = flights
    .map(
      (flight) => `
        <tr>
          <td>${createCell(flight.flightIata, flight.flightNumber)}</td>
          <td>${flight.airline}</td>
          <td>${createCell(flight.departureAirport, flight.arrivalAirport)}</td>
          <td>${formatTime(flight.scheduledTime)}</td>
          <td>${formatTime(flight.actualTime)}</td>
          <td>
            <span class="status-badge ${flight.isLive ? "live" : ""}">
              ${flight.isLive ? "Live" : flight.status}
            </span>
          </td>
        </tr>
      `,
    )
    .join("");
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

    elements.arrivalsCount.textContent = String(arrivals.count);
    elements.departuresCount.textContent = String(departures.count);
    elements.arrivalsPill.textContent = `${arrivals.count} flights`;
    elements.departuresPill.textContent = `${departures.count} flights`;

    const liveCount = [...arrivals.flights, ...departures.flights].filter(
      (flight) => flight.isLive,
    ).length;

    elements.liveCount.textContent = String(liveCount);

    renderFlights(
      elements.arrivalsTableBody,
      arrivals.flights,
      "No arrival data yet. Add your AviationStack key to begin loading flights.",
    );
    renderFlights(
      elements.departuresTableBody,
      departures.flights,
      "No departure data yet. Add your AviationStack key to begin loading flights.",
    );

    const message =
      arrivals.message || departures.message ||
      (arrivals.placeholder || departures.placeholder
        ? "Set AVIATIONSTACK_API_KEY to load live AviationStack data."
        : "");

    showNotice(message);

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
  refreshFlights();
});

refreshFlights();
window.setInterval(refreshFlights, refreshIntervalMs);
