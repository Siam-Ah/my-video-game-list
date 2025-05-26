import styled from "styled-components";
import Heading from "../ui/Heading";
import SignupForm from "../features/authentication/SignupForm";
import HomeButton from "../ui/HomeButton";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

const SignupLayout = styled.main`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 48rem;
  align-content: center;
  justify-content: center;
  gap: 3.2rem;
  background-color: var(--color-grey-50);
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: -2rem;
`;

export default function Signup() {
  return (
    <SignupLayout>
      <HomeButton />
      <Heading as="h4">Create your account</Heading>
      <SignupForm />
      <LoginLink>
        <span>Already have an account? </span>
        <Button variation="secondary" size="small" as={Link} to="/login">
          Sign in
        </Button>
      </LoginLink>
    </SignupLayout>
  );
}
