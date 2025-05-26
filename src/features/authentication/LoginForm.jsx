import { useForm } from "react-hook-form";
import Form from "../../ui/Form";
import FormRowVertical from "../../ui/FormRowVertical";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { useLogin } from "./useLogin";
import SpinnerMini from "../../ui/SpinnerMini";
import PasswordInput from "../../ui/PasswordInput";
import { emailValidation } from "../../utils/validation";

export default function LoginForm({ onSubmitting }) {
  const { register, handleSubmit, formState } = useForm();
  const { errors } = formState;
  const { login, isPending } = useLogin();

  function onSubmit({ email, password }) {
    onSubmitting?.(true);
    login(
      { email, password },
      {
        onSettled: () => {
          onSubmitting?.(false);
        },
      }
    );
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} type="regular">
      <FormRowVertical label="Email address" error={errors?.email?.message}>
        <Input
          type="email"
          id="email"
          autoComplete="username"
          disabled={isPending}
          {...register("email", emailValidation)}
        />
      </FormRowVertical>

      <FormRowVertical label="Password" error={errors?.password?.message}>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          disabled={isPending}
          register={register}
        />
      </FormRowVertical>

      <FormRowVertical>
        <Button
          type="submit"
          size="large"
          variation="primary"
          disabled={isPending}
        >
          {!isPending ? "Log in" : <SpinnerMini />}
        </Button>
      </FormRowVertical>
    </Form>
  );
}
