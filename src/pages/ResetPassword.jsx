import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import HomeButton from "../ui/HomeButton";
import Form from "../ui/Form";
import FormRowVertical from "../ui/FormRowVertical";
import Input from "../ui/Input";
import Button from "../ui/Button";
import supabase from "../services/supabase";
import styled from "styled-components";
import Heading from "../ui/Heading";
import SpinnerMini from "../ui/SpinnerMini";
import {
  confirmPasswordValidation,
  passwordValidation,
} from "../utils/validation";
import PasswordInput from "../ui/PasswordInput";

const ResetPasswordLayout = styled.main`
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(30rem, 48rem);
  align-content: center;
  justify-content: center;
  gap: 3.2rem;
  background-color: var(--color-grey-50);
  padding: 2.4rem;
`;

export default function ResetPassword() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState, getValues } = useForm();
  const { errors } = formState;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          throw error || new Error("No user found");
        }

        setLoading(false);
      } catch (error) {
        toast.error("Invalid or expired reset link");
        console.error("Password reset error:", error);
        navigate("/login");
      }
    };

    handleAuth();
  }, [navigate]);

  async function onSubmit({ password }) {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password updated successfully!");
    navigate("/login");
  }

  if (loading) return <SpinnerMini />;

  return (
    <ResetPasswordLayout>
      <HomeButton />
      <Heading as="h4">Set a new password</Heading>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormRowVertical label="New password" error={errors?.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            {...register("password", passwordValidation)}
          />
        </FormRowVertical>
        <FormRowVertical
          label="Confirm new password"
          error={errors?.passwordConfirm?.message}
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            {...register(
              "passwordConfirm",
              confirmPasswordValidation(getValues, "password")
            )}
          />
        </FormRowVertical>
        <FormRowVertical>
          <Button size="large" variation="primary">
            Update password
          </Button>
        </FormRowVertical>
      </Form>
    </ResetPasswordLayout>
  );
}
