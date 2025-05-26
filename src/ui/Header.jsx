import { useNavigate } from "react-router-dom";

import styled from "styled-components";
import Search from "./Search";
import Button from "./Button";

import Logout from "../features/authentication/Logout";
import { useAuth } from "../features/authentication/useAuth";
import UserAvatar from "./UserAvatar";

const StyledHeader = styled.header`
  background-color: var(--color-grey-0);
  padding: 1.2rem 4.8rem;
  border-bottom: 1px solid var(--color-grey-100);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const AuthButtonsContainer = styled.div`
  display: flex;
  gap: 1.2rem;
  position: absolute;
  right: 4.8rem;
`;

const UserProfileContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  position: absolute;
  right: 4.8rem;
  cursor: pointer;
`;

const Username = styled.span`
  font-weight: 500;
  color: var(--color-grey-800);
`;

const AdminBadge = styled.span`
  background-color: var(--color-brand-600);
  color: white;
  font-size: 1rem;
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
  margin-left: 0.8rem;
  font-weight: 600;
`;

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
  };

  if (isLoading) return null;

  return (
    <StyledHeader>
      <Search />

      {isAuthenticated ? (
        <UserProfileContainer onClick={() => handleNavigation("/profile")}>
          <UserAvatar user={user} size="small" />
          <Username>
            {user?.user_metadata?.username || user?.email?.split("@")[0]}
            {user?.profile?.role === "admin" && <AdminBadge>ADMIN</AdminBadge>}
          </Username>
          <Logout />
        </UserProfileContainer>
      ) : (
        <AuthButtonsContainer>
          <Button
            size="large"
            variation="primary"
            onClick={() => handleNavigation("/login")}
          >
            Log in
          </Button>
          <Button
            size="large"
            variation="secondary"
            onClick={() => handleNavigation("/signup")}
          >
            Sign up
          </Button>
        </AuthButtonsContainer>
      )}
    </StyledHeader>
  );
}
