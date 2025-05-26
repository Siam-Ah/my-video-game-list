import { useQuery } from "@tanstack/react-query";
import { fetchGameList } from "../services/games";
import { getPlatforms } from "../services/platformService";
import { useEffect, useMemo, useState } from "react";
import supabase from "../services/supabase";

async function fetchGamesWithRatings(games) {
  const { data: dbGames } = await supabase.from("games").select("id, igdb_id");

  if (!dbGames || dbGames.length === 0) {
    return games.map((game) => ({
      ...game,
      userRating: null,
      reviewCount: 0,
    }));
  }

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

  return games.map((game) => {
    const dbGame = dbGames.find((g) => g.igdb_id === game.id);
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

export function useGameList({ name }) {
  const [debouncedName, setDebouncedName] = useState(name);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedName(name);
    }, 300);

    return () => clearTimeout(timer);
  }, [name]);

  const platformsQuery = useQuery({
    queryKey: ["platforms"],
    queryFn: getPlatforms,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const gamesQuery = useQuery({
    queryKey: ["games", debouncedName],
    queryFn: async () => {
      if (!debouncedName) return [];
      const games = await fetchGameList({ name: debouncedName });
      return await fetchGamesWithRatings(games);
    },
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
              return platform
                ? platform.name
                : `Unknown Platform (ID: ${platformId})`;
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
