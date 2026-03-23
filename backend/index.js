const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

// 🔥 MIDDLEWARE
app.use(cors());
app.use(express.json());

// 🔐 YOUR DISCORD WEBHOOK
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1485605589110227104/aaQOLRnXtHuX9yQy3kUEDFLx78jQysjaLKrsJvdI5Nf4vO88EAtJfuDkLyI9qqEe5Y84";

// 🟢 HOME
app.get("/", (req, res) => {
  res.send("Lunify backend running 🚀");
});

// 🔍 SEARCH ROUTE
app.get("/search", async (req, res) => {
  const query = req.query.q;

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&maxResults=10&key=${process.env.YT_API_KEY}`
    );

    const data = await response.json();

    if (!data.items) {
      return res.status(500).json({ error: "No results from API" });
    }

    res.json(data.items);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Error fetching data" });
  }
});

// 🔔 GITHUB WEBHOOK ROUTE
app.post("/webhook", async (req, res) => {
  const event = req.headers["x-github-event"];
  const data = req.body;

  console.log("📩 GitHub Event:", event);

  let message = `📢 **${event?.toUpperCase()} EVENT**\n`;

  try {
    if (event === "push") {
      message += `📦 Repo: ${data.repository.full_name}\n`;
      message += `👤 By: ${data.pusher.name}\n\n`;
      message += `💬 Commits:\n`;

      data.commits.forEach(c => {
        message += `- ${c.message}\n`;
      });
    }

    else if (event === "fork") {
      message += `🍴 Forked by: ${data.forkee.owner.login}`;
    }

    else if (event === "issues") {
      message += `🐛 Issue: ${data.issue.title}`;
    }

    else if (event === "pull_request") {
      message += `🔀 PR: ${data.pull_request.title}`;
    }

    else {
      message += `Event triggered in ${data.repository?.full_name}`;
    }

    // 🚀 SEND TO DISCORD
    await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: message
      })
    });

    res.sendStatus(200);

  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});

// 🌐 PORT FIX FOR RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
