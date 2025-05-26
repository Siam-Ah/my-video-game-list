import { igdbFetch } from "./igdbService";

let platformCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export async function getPlatforms() {
  const now = Date.now();

  if (platformCache && now - lastFetchTime < CACHE_DURATION) {
    return platformCache;
  }

  try {
    const platforms = await igdbFetch(
      "platforms",
      "fields id,name,abbreviation; limit 500; sort id asc;"
    );

    platformCache = platforms;
    lastFetchTime = now;

    return platforms;
  } catch (error) {
    console.error("Failed to fetch platforms:", error);
    if (platformCache) return platformCache;
    throw error;
  }
}

export function prefetchPlatforms() {
  return getPlatforms();
}
