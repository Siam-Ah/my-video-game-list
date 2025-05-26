import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import supabase from "../services/supabase";

export function useComments(reviewId) {
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", reviewId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(`*, profiles(username, avatar_url, role)`)
        .eq("review_id", reviewId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!reviewId,
  });

  const { mutate: addComment, isLoading: isAdding } = useMutation({
    mutationFn: async ({ reviewId, content }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("You must be logged in");

      const { data, error } = await supabase
        .from("comments")
        .insert([{ review_id: reviewId, user_id: userData.user.id, content }])
        .select(`*, profiles(username, avatar_url)`);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["comments"]);
      toast.success("Comment added!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: deleteComment } = useMutation({
    mutationFn: async (commentId) => {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["comments"]);
      toast.success("Comment deleted");
    },
  });

  const { mutate: updateComment, isLoading: isUpdating } = useMutation({
    mutationFn: async ({ commentId, content }) => {
      const { data, error } = await supabase
        .from("comments")
        .update({ content, updated_at: new Date().toISOString() })
        .eq("id", commentId)
        .select(`*, profiles(username, avatar_url)`);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["comments"]);
      toast.success("Comment updated!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    comments,
    isLoading,
    addComment,
    isAdding,
    deleteComment,
    updateComment,
    isUpdating,
  };
}
