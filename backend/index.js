const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Lunify backend running 🚀");
});

app.get("/search", async (req, res) => {
  const query = req.query.q;

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&maxResults=10&key=${process.env.YT_API_KEY}`
    );

    const data = await response.json();
    res.json(data.items);
  } catch (err) {
    res.status(500).json({ error: "Error fetching data" });
  }
});

app.listen(3000, () => console.log("Server running"));
