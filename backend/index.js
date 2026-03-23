const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

// 🔥 MIDDLEWARE
app.use(cors());
app.use(express.json());

// 🔐 DISCORD WEBHOOK
const DISCORD_WEBHOOK = "Your webhook here";

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

// 🔔 GITHUB WEBHOOK ROUTE (EMBED VERSION)
app.post("/webhook", async (req, res) => {
  const event = req.headers["x-github-event"];
  const data = req.body;

  console.log("📩 GitHub Event:", event);

  try {
    let embed = null;

    // 🚀 PUSH EVENT (MAIN ONE)
    if (event === "push") {
      const commits = data.commits
        .map(c => `• ${c.message}`)
        .join("\n");

      embed = {
        title: "🚀 New Push",
        url: data.repository.html_url,
        color: 0xff004c,
        author: {
          name: data.repository.full_name
        },
        fields: [
          {
            name: "👤 Author",
            value: data.pusher.name,
            inline: true
          },
          {
            name: "🔢 Commits",
            value: `${data.commits.length}`,
            inline: true
          },
          {
            name: "💬 Messages",
            value: commits || "No commits",
            inline: false
          }
        ],
        footer: {
          text: "Lunify GitHub Logs"
        },
        timestamp: new Date()
      };
    }

    // 🍴 FORK
    else if (event === "fork") {
      embed = {
        title: "🍴 Repository Forked",
        description: `Forked by **${data.forkee.owner.login}**`,
        url: data.repository.html_url,
        color: 0x00ff99
      };
    }

    // 🐛 ISSUE
    else if (event === "issues") {
      embed = {
        title: "🐛 Issue Created",
        description: `[${data.issue.title}](${data.issue.html_url})`,
        color: 0xffcc00
      };
    }

    // 🔀 PULL REQUEST
    else if (event === "pull_request") {
      embed = {
        title: "🔀 Pull Request",
        description: `[${data.pull_request.title}](${data.pull_request.html_url})`,
        color: 0x5865F2
      };
    }

    // 📡 DEFAULT (ignore noisy events)
    if (!embed) return res.sendStatus(200);

    // 🚀 SEND EMBED TO DISCORD
    await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        embeds: [embed]
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
