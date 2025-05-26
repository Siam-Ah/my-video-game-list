import Form from "../../ui/Form";
import FormRowVertical from "../../ui/FormRowVertical";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { useForm } from "react-hook-form";
import { useSignup } from "./useSignup";
import SpinnerMini from "../../ui/SpinnerMini";
import PasswordInput from "../../ui/PasswordInput";
import useDebouncedCallback from "../../hooks/useDebouncedCallback";
import { useUsernameCheck } from "./useUsernameCheck";
import { useEffect } from "react";
import UsernameStatus from "../../ui/UsernameStatus";
import {
  confirmPasswordValidation,
  emailValidation,
  passwordValidation,
  usernameValidation,
} from "../../utils/validation";

export default function SignupForm() {
  const { signup, isPending } = useSignup();
  const {
    register,
    formState: { errors },
    handleSubmit,
    getValues,
    reset,
    watch,
    trigger,
  } = useForm({
    mode: "onChange",
  });

  const { usernameAvailable, checkingUsername, usernameValid, checkUsername } =
    useUsernameCheck();

  const username = watch("username");

  const debouncedCheck = useDebouncedCallback(checkUsername, 500);

  useEffect(() => {
    if (username) {
      debouncedCheck(username);
      trigger("username");
    }
  }, [username, debouncedCheck, trigger]);

  const onSubmit = ({ username, email, password }) => {
    if (usernameAvailable === false) return;

    signup(
      { username, email, password },
      {
        onSettled: () => reset(),
      }
    );
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} type="regular">
      <FormRowVertical label="Username" error={errors?.username?.message}>
        <Input
          type="text"
          id="username"
          disabled={isPending}
          autoComplete="username"
          {...register("username", {
            ...usernameValidation,
            validate: {
              ...usernameValidation.validate,
              isAvailable: () => usernameAvailable !== false || "",
            },
          })}
        />
        <UsernameStatus
          checking={checkingUsername}
          valid={usernameValid}
          available={usernameAvailable}
        />
      </FormRowVertical>

      <FormRowVertical label="Email address" error={errors?.email?.message}>
        <Input
          type="email"
          id="email"
          disabled={isPending}
          autoComplete="email"
          {...register("email", emailValidation)}
        />
      </FormRowVertical>

      <FormRowVertical label="Password" error={errors?.password?.message}>
        <PasswordInput
          id="password"
          disabled={isPending}
          autoComplete="new-password"
          {...register("password", passwordValidation)}
        />
      </FormRowVertical>

      <FormRowVertical
        label="Confirm Password"
        error={errors?.confirmPassword?.message}
      >
        <PasswordInput
          id="confirmPassword"
          disabled={isPending}
          autoComplete="new-password"
          {...register("confirmPassword", confirmPasswordValidation(getValues))}
        />
      </FormRowVertical>

      <FormRowVertical>
        <Button
          type="submit"
          size="large"
          variation="primary"
          disabled={isPending}
        >
          {!isPending ? "Create Account" : <SpinnerMini />}
        </Button>
      </FormRowVertical>
    </Form>
  );
}
