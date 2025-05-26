import styled from "styled-components";
import Heading from "../ui/Heading";
import LoginForm from "../features/authentication/LoginForm";
import HomeButton from "../ui/HomeButton";
import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useState } from "react";

const LoginLayout = styled.main`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 48rem;
  align-content: center;
  justify-content: center;
  gap: 3.2rem;
  background-color: var(--color-grey-50);
`;

const SignupLink = styled.div`
  text-align: center;
  margin-top: -2rem;
`;

const SignupText = styled.span`
  color: var(--color-grey-500);
  margin-right: 0.8rem;
`;

const ForgotPasswordLink = styled(Link)`
  font-size: 1.2rem;
  color: var(--color-brand-600);
  text-align: right;
  display: block;
  margin-top: -1.5rem;
`;

export default function Login() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  return (
    <LoginLayout>
      <HomeButton />
      <Heading as="h4">Log in to your account</Heading>
      <LoginForm onSubmitting={setIsSubmitting} />
      <ForgotPasswordLink to="/forgot-password">
        Forgot password?
      </ForgotPasswordLink>
      <SignupLink>
        <SignupText>Don't have an account? </SignupText>
        <Button
          variation="secondary"
          size="small"
          onClick={() => navigate("/signup")}
          disabled={isSubmitting}
          // aria-label="Sign up for a new account"
        >
          Sign up
        </Button>
      </SignupLink>
    </LoginLayout>
  );
}
