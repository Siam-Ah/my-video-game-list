import { useNavigate } from "react-router-dom";

import Button from "./Button";
import Search from "./Search";
import styled from "styled-components";

const StyledNavBar = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 7.2rem;
  padding: 0 3.2rem;
  background-color: var(--color-indigo-700);
  border-radius: 0.9rem;
`;

const StyledAuthButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  margin-left: 2rem;
`;

export default function Navbar() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <StyledNavBar>
      <Search />
      <StyledAuthButtons>
        <Button size="large" variation="primary" onClick={handleLoginClick}>
          Log in
        </Button>
        <Button size="large" variation="secondary">
          Sign up
        </Button>
      </StyledAuthButtons>
    </StyledNavBar>
  );
}
