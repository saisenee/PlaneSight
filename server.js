const path = require("node:path");

const dotenv = require("dotenv");
const express = require("express");

const flightsHandler = require("./api/flights");
const weatherHandler = require("./api/weather");

dotenv.config({ path: path.join(__dirname, ".env.local"), override: true });
dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.static(path.join(__dirname, "public")));
app.get("/api/flights", flightsHandler);
app.get("/api/weather", weatherHandler);
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`PlaneSight running at http://localhost:${port}`);
});
