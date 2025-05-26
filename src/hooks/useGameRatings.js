import { useQuery } from "@tanstack/react-query";
import supabase from "../services/supabase";

export function useGameRatings(igdbId) {
  return useQuery({
    queryKey: ["gameRatings", igdbId],
    queryFn: async () => {
      const { data: game } = await supabase
        .from("games")
        .select("id")
        .eq("igdb_id", igdbId)
        .maybeSingle();

      if (!game) return { averageRating: null, reviewCount: 0 };

      const { data: reviews, count } = await supabase
        .from("reviews")
        .select("*", { count: "exact" })
        .eq("game_id", game.id);

      if (!reviews || reviews.length === 0) {
        return { averageRating: null, reviewCount: 0 };
      }

      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const averageRating =
        Math.round((totalRating / reviews.length) * 10) / 10;

      return {
        averageRating,
        reviewCount: count,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}
