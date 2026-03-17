# PlaneSight local preview note

## Project format

This project is currently built with a plain **HTML**, **CSS**, and **JavaScript** frontend.

That means:

- The UI lives in `public/index.html`, `public/styles.css`, and `public/app.js`.
- A small Node.js server in `server.js` previews the site locally.
- The backend route in `api/flights.js` keeps your AviationStack key private.
- This setup is a good fit for **Vercel**, API routes, and future **Chart.js** work.

## Local preview with Node.js

You do **not** need Vercel yet.
You can build and preview everything locally first using Node.js.

### Commands

Install dependencies:

```bash
npm install
```

Start the local development preview:

```bash
npm run dev
```

Start the local server directly:

```bash
npm run start
```

Run the placeholder build command:

```bash
npm run build
```

## Local URLs

When the dev server is running, preview the site at:

- Local: http://localhost:3000
- Network: http://10.16.131.97:3000

## Quick takeaway

- Use `npm run dev` while building.
- Use `npm run start` if you want to run the same server without the dev label.
- Use `npm run build` only if a deployment flow expects a build command.
- Vercel can be added later when you are ready to deploy.
