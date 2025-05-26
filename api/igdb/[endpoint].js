import fetch from "node-fetch";

let accessToken = "";
let tokenExpiration = 0;

const IGDB_BASE_URL = "https://api.igdb.com/v4";
const VALID_ENDPOINTS = new Set([
  "games",
  "platforms",
  "genres",
  "involved_companies",
  "companies",
]);

async function getAccessToken() {
  if (Date.now() < tokenExpiration - 60000) return accessToken;

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      // eslint-disable-next-line
      client_id: process.env.IGDB_CLIENT_ID,
      // eslint-disable-next-line
      client_secret: process.env.IGDB_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });

  const data = await res.json();
  accessToken = data.access_token;
  tokenExpiration = Date.now() + data.expires_in * 1000;
  return accessToken;
}

export default async function handler(req, res) {
  const { endpoint } = req.query;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!VALID_ENDPOINTS.has(endpoint)) {
    return res.status(400).json({ error: "Invalid endpoint" });
  }

  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query required" });
  }

  try {
    const token = await getAccessToken();

    const igdbRes = await fetch(`${IGDB_BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: query,
    });

    if (!igdbRes.ok) {
      throw new Error(`IGDB error: ${igdbRes.statusText}`);
    }

    const data = await igdbRes.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("IGDB Proxy Error", err);
    res.status(500).json({ error: err.message });
  }
}
