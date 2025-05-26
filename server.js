import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import crypto from "crypto";

dotenv.config();

const app = express();

const cache = new Map();

const MAX_CACHE_SIZE = 1000;

const ENDPOINT_TTLS = {
  platforms: 24 * 60 * 60 * 1000,
  genres: 24 * 60 * 60 * 1000,
  companies: 24 * 60 * 60 * 1000,
  default: 60 * 60 * 1000,
};

const VALID_ENDPOINTS = new Set([
  "games",
  "platforms",
  "genres",
  "involved_companies",
  "companies",
]);

const generateCacheKey = (endpoint, query) => {
  const hash = crypto.createHash("sha256").update(query).digest("hex");
  return `${endpoint}:${hash}`;
};

function getCacheTTL(endpoint) {
  return ENDPOINT_TTLS[endpoint] || ENDPOINT_TTLS.default;
}

function invalidateCache(endpoint) {
  for (const key of cache.keys()) {
    if (key.startsWith(`${endpoint}:`)) {
      cache.delete(key);
    }
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// Config
// eslint-disable-next-line
const CLIENT_ID = process.env.IGDB_CLIENT_ID;
// eslint-disable-next-line
const CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;
const IGDB_BASE_URL = "https://api.igdb.com/v4";

// Token management
let accessToken = "";
let tokenExpiration = 0;

async function getAccessToken() {
  if (Date.now() < tokenExpiration - 60000) return;

  try {
    const res = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    });

    if (!res.ok) throw new Error("Failed to get access token");

    const data = await res.json();
    accessToken = data.access_token;
    tokenExpiration = Date.now() + data.expires_in * 1000;
  } catch (error) {
    console.error("Token Error:", error);
    throw error;
  }
}

// Routes
app.post("/api/igdb/:endpoint", async (req, res) => {
  try {
    const { endpoint } = req.params;
    const query = req.body.query;

    // Request validation
    if (!VALID_ENDPOINTS.has(endpoint)) {
      return res.status(400).json({ error: "Invalid endpoint" });
    }

    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    const cacheKey = generateCacheKey(endpoint, query);
    const cached = cache.get(cacheKey);

    if (cached) {
      const cacheAge = Date.now() - cached.timestamp;
      if (cacheAge < getCacheTTL(endpoint)) {
        res.set("X-Cache", "HIT");
        return res.json(cached.data);
      }
      cache.delete(cacheKey);
    }

    await getAccessToken();

    const igdbRes = await fetch(`${IGDB_BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Client-ID": CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      body: query,
    });

    if (!igdbRes.ok) {
      if (igdbRes.status === 404) {
        invalidateCache(endpoint);
      }
      throw new Error(`IGDB API error: ${igdbRes.statusText}`);
    }

    const data = await igdbRes.json();

    if (igdbRes.ok) {
      if (cache.size >= MAX_CACHE_SIZE) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        headers: igdbRes.headers,
      });
    }

    res.set("X-Cache", "MISS");
    res.json(data);
  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({
      error: error.message,
      // eslint-disable-next-line
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

app.delete("/api/cache/:endpoint", (req, res) => {
  const { endpoint } = req.params;
  if (VALID_ENDPOINTS.has(endpoint)) {
    invalidateCache(endpoint);
    return res.json({ success: true });
  }
  return res.status(400).json({ error: "Invalid endpoint" });
});

// Start server
// eslint-disable-next-line
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () =>
//   console.log(`Secure proxy server running on port ${PORT}`)
// );

export default app;
