import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateCurrentUser } from "../../services/apiAuth";

export function useUpdateUser() {
  const queryClient = useQueryClient();

  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: (user, variables, context) => {
      toast.success("User account successfully updated");
      queryClient.setQueryData(["user"], user);
      context?.onSuccess?.(user);
    },
    onError: (err, variables, context) => {
      toast.error(err.message);
      context?.onError?.(err);
    },
    onSettled: (data, error, variables, context) => {
      context?.onSettled?.();
    },
  });

  return { updateUser, isUpdating };
}
