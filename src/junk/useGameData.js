import { useEffect, useState } from "react";
import { useIgdb } from "./useIgdb";

function useGameData({ name, slug }) {
  const [gamesWithPlatforms, setGamesWithPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log(name);

  const query = slug
    ? `fields name,slug,cover.url,rating,first_release_date,summary,storyline; where slug = "${slug}";`
    : `fields name,slug,cover.url,rating,platforms,first_release_date;
    ${name ? `search "${name}";` : ""}
    where version_parent = null & category = 0;
    limit 50;`;

  const {
    data: games,
    loading: gamesLoading,
    error: gamesError,
  } = useIgdb("games", query);

  const {
    data: platforms,
    loading: platformsLoading,
    error: platformsError,
  } = useIgdb("platforms", "fields id,name; limit 500;");

  useEffect(() => {
    if (games && platforms) {
      const enrichedGames = games.map((game) => {
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

      setGamesWithPlatforms(slug ? enrichedGames[0] || null : enrichedGames);
      setLoading(false);
    }
  }, [games, platforms, slug]);

  useEffect(() => {
    if (gamesError || platformsError) {
      setError(gamesError || platformsError);
      setLoading(false);
    }
  }, [gamesError, platformsError]);

  return {
    data: gamesWithPlatforms,
    loading: gamesLoading || platformsLoading || loading,
    error,
  };
}

export default useGameData;
