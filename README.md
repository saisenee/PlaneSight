# PlaneSight

PlaneSight is a starter dashboard for visualizing live flight activity to and from Toronto Pearson Airport (`YYZ`) using AviationStack.

## What is included

- Plain frontend in `public/index.html`, `public/styles.css`, and `public/app.js`
- Node/Express local preview server in `server.js`
- Server-side API route at `/api/flights` using `api/flights.js`
- Starter dashboard for arrivals, departures, refresh state, and live-flight counts
- `chart.js` installed for future visualization work
- Placeholder environment variables for AviationStack and optional MongoDB-backed secret storage later

## Project structure

```text
public/
	index.html
	styles.css
	app.js
api/
	flights.js
server.js
```

## Local setup

1. Install dependencies:

	```bash
	npm install
	```

2. Copy `.env.example` to `.env.local`.

3. Add your AviationStack key later:

	```env
	AVIATIONSTACK_API_KEY=your_real_key_here
	```

4. Start the app:

	```bash
	npm run dev
	```

5. Open `http://localhost:3000`.

## Local preview commands

- `npm install` — install dependencies
- `npm run dev` — start the local Node.js preview server
- `npm run start` — start the same local server
- `npm run build` — placeholder build command for environments expecting one

## Environment variables

- `AVIATIONSTACK_API_KEY`: required for live data
- `AVIATIONSTACK_BASE_URL`: defaults to `http://api.aviationstack.com`
- `PORT`: local server port, defaults to `3000`
- `MONGODB_URI`: optional placeholder for future secret/config storage
- `MONGODB_DB_NAME`: optional placeholder database name

## API usage

The starter includes:

- `/api/flights?type=arrival`
- `/api/flights?type=departure`

Both routes filter data to Toronto Pearson (`YYZ`) and normalize the AviationStack response for the frontend.

Optional AviationStack filters can also be passed through, for example:

- `/api/flights?type=arrival&flight_status=active&limit=30`
- `/api/flights?type=departure&airline_iata=AC&flight_date=2026-03-17`

## Vercel notes

- Add the same environment variables in your Vercel project settings.
- Vercel can serve the static files in `public/` and the serverless route in `api/flights.js`.
- If your AviationStack plan supports HTTPS, you can update `AVIATIONSTACK_BASE_URL` accordingly.

## Next ideas

- Add a Chart.js line chart for arrivals vs departures over time
- Persist historical snapshots in MongoDB for trend analysis
- Add filters for airline, status, and terminal
- Add map-based visualization for live flights
