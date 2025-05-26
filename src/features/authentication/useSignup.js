import { useMutation } from "@tanstack/react-query";
import { signup as signupApi } from "../../services/apiAuth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function useSignup() {
  const navigate = useNavigate();
  const { mutate: signup, isPending } = useMutation({
    mutationFn: signupApi,
    onSuccess: () => {
      navigate("/homepage", { replace: true });
    },
    onError: (error) => {
      if (error.message.includes("User already registered")) {
        toast.error(
          "This email is already registered. Please use a different email or log in."
        );
      } else {
        toast.error(error.message);
      }
    },
  });

  return { signup, isPending };
}
