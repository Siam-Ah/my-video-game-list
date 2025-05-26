import { useForm } from "react-hook-form";
import styled from "styled-components";
import { useResetPassword } from "../features/authentication/useResetPassword";
import Form from "../ui/Form";
import HomeButton from "../ui/HomeButton";
import Heading from "../ui/Heading";
import FormRowVertical from "../ui/FormRowVertical";
import Input from "../ui/Input";
import Button from "../ui/Button";
import SpinnerMini from "../ui/SpinnerMini";

const ForgotPasswordLayout = styled.main`
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(30rem, 48rem);
  align-content: center;
  justify-content: center;
  gap: 3.2rem;
  background-color: var(--color-grey-50);
  padding: 2.4rem;
`;

export default function ForgotPassword() {
  const { register, handleSubmit, formState } = useForm();
  const { errors } = formState;
  const { resetPassword, isPending } = useResetPassword();

  function onSubmit({ email }) {
    resetPassword(email);
  }

  return (
    <ForgotPasswordLayout>
      <HomeButton />
      <Heading as="h4">Reset your password</Heading>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormRowVertical label="Email address" error={errors?.email?.message}>
          <Input
            type="email"
            id="email"
            disabled={isPending}
            {...register("email", {
              required: "This field is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Please provide a valid email address",
              },
            })}
          />
        </FormRowVertical>
        <FormRowVertical>
          <Button size="large" variation="primary" disabled={isPending}>
            {!isPending ? "Send reset link" : <SpinnerMini />}
          </Button>
        </FormRowVertical>
      </Form>
    </ForgotPasswordLayout>
  );
}
