import { useQuery } from "@tanstack/react-query";
import { fetchGameDetails } from "../services/games";

export function useGameDetails(slug) {
  return useQuery({
    queryKey: ["gameDetails", slug],
    queryFn: () => fetchGameDetails(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
    select: (data) => ({
      ...data,
    }),
  });
}
