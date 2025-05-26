import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { resetPassword } from "../../services/apiAuth";

export function useResetPassword() {
  const { mutate, isPending } = useMutation({
    mutationFn: (email) => resetPassword(email),
    onSuccess: () => {
      toast.success("Password reset link sent to your email!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { resetPassword: mutate, isPending };
}
