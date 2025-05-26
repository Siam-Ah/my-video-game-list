import { useQuery } from "@tanstack/react-query";
import supabase from "../services/supabase";
import { getPlatforms } from "../services/platformService";
import { useMemo } from "react";
import { igdbFetch } from "../services/igdbService";

export async function fetchTopRatedGames() {
  const { data: gamesWithRatings, error } = await supabase.rpc(
    "get_top_rated_games"
  );

  if (error || !gamesWithRatings?.length) return [];

  const BATCH_SIZE = 10;
  const allIgdbGames = [];

  for (let i = 0; i < gamesWithRatings.length; i += BATCH_SIZE) {
    const batch = gamesWithRatings.slice(i, i + BATCH_SIZE);
    const igdbIds = batch.map((game) => game.igdb_id);

    const query = `fields name,slug,cover.url,platforms,first_release_date;
      where id = (${igdbIds.join(",")});`;

    try {
      const igdbGames = await igdbFetch("games", query);
      allIgdbGames.push(...igdbGames);
    } catch (err) {
      console.error("Failed to fetch IGDB batch:", err);
    }
  }

  return gamesWithRatings.map((dbGame) => {
    const igdbGame = allIgdbGames.find((game) => game?.id === dbGame.igdb_id);

    if (!igdbGame) {
      return {
        id: dbGame.igdb_id,
        name: dbGame.name || "Unknown Game",
        userRating: dbGame.avg_rating,
        reviewCount: dbGame.review_count,
        coverImg: "nocover",
        year: "N/A",
        platforms: [],
        platformNames: [],
      };
    }

    return {
      ...igdbGame,
      id: igdbGame.id,
      userRating: dbGame.avg_rating,
      reviewCount: dbGame.review_count,
      coverImg: igdbGame.cover?.url
        ? igdbGame.cover.url.split("/").pop().split(".")[0]
        : "nocover",
      year: igdbGame.first_release_date
        ? new Date(igdbGame.first_release_date * 1000).getFullYear()
        : "N/A",
    };
  });
}

export function useTopRatedGames() {
  const platformsQuery = useQuery({
    queryKey: ["platforms"],
    queryFn: getPlatforms,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const gamesQuery = useQuery({
    queryKey: ["topRatedGames"],
    queryFn: fetchTopRatedGames,
    staleTime: 1000 * 60 * 5,
  });

  const data = useMemo(() => {
    if (!gamesQuery.data || !platformsQuery.data) return null;

    return {
      games: gamesQuery.data.map((game) => ({
        ...game,
        platformNames: game.platforms
          ? game.platforms.map((platformId) => {
              const platform = platformsQuery.data.find(
                (p) => p.id === platformId
              );
              return platform?.name || `Unknown Platform (ID: ${platformId})`;
            })
          : [],
      })),
      platforms: platformsQuery.data,
    };
  }, [gamesQuery.data, platformsQuery.data]);

  return {
    data,
    isLoading: gamesQuery.isLoading || platformsQuery.isLoading,
    error: gamesQuery.error || platformsQuery.error,
  };
}
