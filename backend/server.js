const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const { runDijkstra } = require("./algorithms/dijkstra");

// API endpoint
app.post("/shortest-path", (req, res) => {
  const { graph, start, end } = req.body;

  if (!graph || !start || !end) {
    return res.status(400).json({ error: "Missing graph, start, or end node" });
  }

  try {
    const result = runDijkstra(graph, start, end);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Server Error", details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));

