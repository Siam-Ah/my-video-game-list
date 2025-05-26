import fetch from "node-fetch";
import crypto from "crypto";

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

let accessToken = "";
let tokenExpiration = 0;
// eslint-disable-next-line
const CLIENT_ID = process.env.IGDB_CLIENT_ID;
// eslint-disable-next-line
const CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;
const IGDB_BASE_URL = "https://api.igdb.com/v4";

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

// eslint-disable-next-line
export async function handler(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { endpoint } = event.pathParameters;
    const { query } = JSON.parse(event.body);

    // Request validation
    if (!VALID_ENDPOINTS.has(endpoint)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid endpoint" }),
      };
    }

    if (!query) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Query parameter is required" }),
      };
    }

    // Cache logic (same as before)
    const cacheKey = generateCacheKey(endpoint, query);
    const cached = cache.get(cacheKey);

    if (cached) {
      const cacheAge = Date.now() - cached.timestamp;
      if (cacheAge < getCacheTTL(endpoint)) {
        return {
          statusCode: 200,
          headers: { "X-Cache": "HIT" },
          body: JSON.stringify(cached.data),
        };
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

    return {
      statusCode: 200,
      headers: { "X-Cache": "MISS" },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Proxy Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
}
