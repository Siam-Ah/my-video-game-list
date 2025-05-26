import { useQuery } from "@tanstack/react-query";
import supabase from "../services/supabase";

export function useReviews(igdbId) {
  return useQuery({
    queryKey: ["reviews", igdbId],
    queryFn: async () => {
      const { data: game } = await supabase
        .from("games")
        .select("id")
        .eq("igdb_id", igdbId)
        .maybeSingle();

      if (!game) return [];

      const { data: reviews } = await supabase
        .from("reviews")
        .select(`*, profiles(username, avatar_url, role)`)
        .eq("game_id", game.id)
        .order("created_at", { ascending: false });

      return reviews || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}
