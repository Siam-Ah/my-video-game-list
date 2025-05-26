import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import supabase from "../services/supabase";

export function useReviewMutation() {
  const queryClient = useQueryClient();

  const createReview = async ({ igdbId, gameName, rating, content }) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("You must be logged in");

    const { data: game } = await supabase
      .from("games")
      .select("id")
      .eq("igdb_id", igdbId)
      .maybeSingle();

    let gameId = game?.id;
    if (!gameId) {
      const { data: newGame } = await supabase
        .from("games")
        .insert([{ igdb_id: igdbId, name: gameName }])
        .select()
        .single();
      gameId = newGame.id;
    }

    const { data: review } = await supabase
      .from("reviews")
      .insert([
        {
          user_id: userData.user.id,
          game_id: gameId,
          rating,
          content,
        },
      ])
      .select();

    return review;
  };

  const updateReview = async ({ reviewId, rating, content }) => {
    const { data } = await supabase
      .from("reviews")
      .update({ rating, content })
      .eq("id", reviewId)
      .select();
    return data;
  };

  const deleteReview = async (reviewId) => {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) throw error;
    return reviewId;
  };

  const { mutate: mutateReview, isLoading } = useMutation({
    mutationFn: async (values) => {
      if (values.action === "delete") {
        return await deleteReview(values.reviewId);
      }
      return values.reviewId
        ? await updateReview(values)
        : await createReview(values);
    },
    onSuccess: (data, variables) => {
      if (variables.action === "delete") {
        toast.success("Review deleted successfully");
      } else {
        toast.success(
          variables.reviewId ? "Review updated!" : "Review submitted!"
        );
      }
      queryClient.invalidateQueries(["reviews", variables.igdbId]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    mutateReview,
    deleteReview: (reviewId, igdbId) =>
      mutateReview({ action: "delete", reviewId, igdbId }),
    isLoading,
  };
}
