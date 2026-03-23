const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

// 🔍 Search route (SECURE)
app.get("/search", async (req, res) => {
  const query = req.query.q;

  if (!query) return res.status(400).json({ error: "No query" });

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&maxResults=15&key=${process.env.YT_API_KEY}`
    );

    const data = await response.json();

    res.json(data.items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch" });
  }
});

app.get("/", (req, res) => {
  res.send("Lunify backend running 🚀");
});

app.listen(3000, () => console.log("Server running"));
