import { igdbFetch } from "./igdbService";
import supabase from "./supabase";

export async function fetchGameDetails(slug) {
  const query = `
    fields 
      name,
      slug,
      cover.url,
      rating,
      first_release_date,
      summary,
      storyline,
      involved_companies.company.name,
      involved_companies.developer,
      genres.name;
    where slug = "${slug}";
  `;

  const [game] = await igdbFetch("games", query);

  if (!game) {
    throw new Error("Game not found");
  }

  let coverImg = "nocover";
  if (game.cover?.url) {
    try {
      coverImg = game.cover.url.split("/").pop().split(".")[0];
      // eslint-disable-next-line
    } catch (e) {
      console.warn("Invalid cover URL format for game", game.id);
    }
  }

  const releaseDate = game.first_release_date
    ? new Date(game.first_release_date * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const companies =
    game.involved_companies
      ?.filter((ic) => ic.developer)
      ?.map((ic) => ic.company?.name)
      ?.filter(Boolean) || [];

  const genres = game.genres?.map((g) => g.name).filter(Boolean) || [];

  return {
    game: {
      ...game,
      coverImg,
      releaseDate,
    },
    companies,
    genres,
  };
}

export async function fetchGameList({ name }) {
  const gameQuery = `fields name,slug,cover.url,rating,platforms,first_release_date;
      ${name ? `search "${name}";` : ""}
      where version_parent = null;
      limit 50;`;

  const platformsQuery = "fields id,name; limit 500;";

  const [games, platforms] = await Promise.all([
    igdbFetch("games", gameQuery),
    igdbFetch("platforms", platformsQuery),
  ]);

  return games.map((game) => {
    let coverImg = "";
    if (game.cover?.url) {
      try {
        coverImg = game.cover.url.split("/").pop().split(".")[0];
        // eslint-disable-next-line
      } catch (e) {
        console.warn("Invalid cover URL format for game", game.id);
      }
    }

    return {
      ...game,
      year: game.first_release_date
        ? new Date(game.first_release_date * 1000).getFullYear()
        : "N/A",
      coverImg: coverImg || "nocover",
      platformNames: game.platforms
        ? game.platforms.map((platformId) => {
            const platform = platforms.find((p) => p.id === platformId);
            return platform
              ? platform.name
              : `Unknown Platform (ID: ${platformId})`;
          })
        : [],
    };
  });
}

export async function fetchGamesWithRatings(gameList) {
  const { data: games } = await supabase.from("games").select("id, igdb_id");

  if (!games) return gameList;

  const { data: reviews } = await supabase
    .from("reviews")
    .select("game_id, rating");

  const gameRatings = {};
  reviews?.forEach((review) => {
    if (!gameRatings[review.game_id]) {
      gameRatings[review.game_id] = {
        total: 0,
        count: 0,
      };
    }
    gameRatings[review.game_id].total += review.rating;
    gameRatings[review.game_id].count++;
  });

  return gameList.map((game) => {
    const dbGame = games.find((g) => g.igdb_id === game.id);
    const ratingInfo = dbGame ? gameRatings[dbGame.id] : null;
    const averageRating = ratingInfo
      ? Math.round((ratingInfo.total / ratingInfo.count) * 10) / 10
      : null;

    return {
      ...game,
      userRating: averageRating,
      reviewCount: ratingInfo?.count || 0,
    };
  });
}
