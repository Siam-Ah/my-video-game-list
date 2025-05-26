export async function igdbFetch(endpoint, query) {
  try {
    const response = await fetch(`/.netlify/functions/igdb/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    return await response.json();
  } catch (error) {
    console.error("Proxy IGDB API Error:", error);
    throw error;
  }
}
