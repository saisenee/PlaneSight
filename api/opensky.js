// OpenSky API handler - not currently used
module.exports = (_req, res) => {
  res.status(404).json({ error: "OpenSky endpoint not available" });
};
