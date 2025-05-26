import styled from "styled-components";
import { useCallback, useEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import Form from "../ui/Form";
import FormRowVertical from "../ui/FormRowVertical";
import Input from "../ui/Input";
import SpinnerMini from "../ui/SpinnerMini";
import Spinner from "../ui/Spinner";
import Heading from "../ui/Heading";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
} from "react-icons/hi";
import { useUpdateUser } from "../features/authentication/useUpdateUser";
import HomeButton from "../ui/HomeButton";
import useDebouncedCallback from "../hooks/useDebouncedCallback";
import { useAuth } from "../features/authentication/useAuth";
import UserAvatar from "../ui/UserAvatar";
import PasswordInput from "../ui/PasswordInput";
import { useUsernameCheck } from "../features/authentication/useUsernameCheck";
import UsernameStatus from "../ui/UsernameStatus";
import { useAvatar } from "../features/authentication/useAvatar";

const ProfileContainer = styled.div`
  max-width: 80rem;
  margin: 0 auto;
  padding: 4rem;
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-bottom: 4rem;
`;

const AvatarUpload = styled.div`
  display: flex;
  gap: 1.6rem;
`;

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  margin-right: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1.2rem;
  margin-top: 2.4rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CancelButton = styled(Button)`
  background-color: var(--color-grey-200);
  color: var(--color-grey-800);

  &:hover {
    background-color: var(--color-grey-300);
  }
`;

export default function UserProfile() {
  const { user, isLoading } = useAuth();
  const { updateUser, isUpdating } = useUpdateUser();
  const { usernameAvailable, checkingUsername, usernameValid, checkUsername } =
    useUsernameCheck();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    avatar,
    avatarPreview,
    removeAvatar,
    handleAvatarChange,
    handleRemoveAvatar,
    resetAvatar,
  } = useAvatar(user?.profile?.avatar_url || user?.user_metadata?.avatar);

  const inputRef = useRef();

  const currentUsername =
    user?.profile?.username || user?.user_metadata?.username || "";
  const [username, setUsername] = useState(currentUsername);

  useEffect(() => {
    if (user) {
      setUsername(currentUsername);
      setEmail(user?.email || "");
      resetAvatar();
    }
  }, [user, currentUsername, resetAvatar]);

  const debouncedCheck = useDebouncedCallback(
    (newUsername) => checkUsername(newUsername, currentUsername),
    500
  );

  const handleUsernameChange = (newUsername) => {
    setUsername(newUsername);
    debouncedCheck(newUsername);
  };

  const resetForm = useCallback(() => {
    setUsername(currentUsername);
    setEmail(user?.email || "");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    resetAvatar();
    setPasswordError("");
    setIsSubmitting(false);
  }, [user, currentUsername, resetAvatar]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting || isUpdating) return;

    setIsSubmitting(true);
    setPasswordError("");

    if (newPassword && newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      setIsSubmitting(false);
      return;
    }

    if (newPassword && !password) {
      setPasswordError("Please enter your current password");
      setIsSubmitting(false);
      return;
    }

    if (username !== currentUsername && usernameAvailable === false) {
      setPasswordError("Username is already taken");
      setIsSubmitting(false);
      return;
    }

    updateUser(
      {
        username: username !== currentUsername ? username : undefined,
        avatar,
        removeAvatar,
        ...(newPassword && { password, newPassword }),
      },
      {
        onSettled: () => setIsSubmitting(false),
        onError: (err) => {
          if (err.message === "username-taken") {
            setPasswordError(
              "Username is already taken. Please choose another."
            );
          } else {
            setPasswordError(err.message);
          }
        },
      }
    );
  };

  const handleCancel = () => {
    if (
      username !== user?.profile?.username ||
      password ||
      newPassword ||
      confirmPassword ||
      avatar
    ) {
      if (window.confirm("Are you sure you want to discard your changes?")) {
        resetForm();
      }
    } else {
      resetForm();
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <ProfileContainer>
      <HomeButton />
      <Heading as="h2">Your Profile</Heading>

      <AvatarSection>
        <UserAvatar
          user={user}
          size="large"
          avatarUrl={avatarPreview}
          showPreview={!!avatar || removeAvatar}
        />
        <AvatarUpload>
          <Button
            as="label"
            variation="secondary"
            size="small"
            style={{ cursor: "pointer" }}
          >
            Change Avatar
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
              disabled={isUpdating}
              ref={inputRef}
            />
          </Button>
          <Button
            variation="danger"
            size="small"
            onClick={handleRemoveAvatar}
            disabled={
              (!user?.profile?.avatar_url && !user?.user_metadata?.avatar) ||
              isUpdating ||
              isSubmitting
            }
          >
            Remove
          </Button>
        </AvatarUpload>
      </AvatarSection>

      <Form onSubmit={handleSubmit}>
        <FormRowVertical label="Username">
          <Input
            type="text"
            id="username"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            disabled={isUpdating}
            prefix={
              <IconWrapper>
                <HiOutlineUser />
              </IconWrapper>
            }
          />
          <UsernameStatus
            checking={checkingUsername}
            valid={usernameValid}
            available={usernameAvailable}
            changed={username !== currentUsername}
          />
        </FormRowVertical>

        <FormRowVertical label="Email">
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled
            prefix={
              <IconWrapper>
                <HiOutlineMail />
              </IconWrapper>
            }
          />
        </FormRowVertical>

        {newPassword && (
          <FormRowVertical label="Current Password">
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isUpdating}
              prefix={
                <IconWrapper>
                  <HiOutlineLockClosed />
                </IconWrapper>
              }
            />
          </FormRowVertical>
        )}

        <FormRowVertical label="New Password">
          <PasswordInput
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isUpdating}
            prefix={
              <IconWrapper>
                <HiOutlineLockClosed />
              </IconWrapper>
            }
          />
        </FormRowVertical>

        {newPassword && (
          <FormRowVertical label="Confirm New Password">
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isUpdating}
              prefix={
                <IconWrapper>
                  <HiOutlineLockClosed />
                </IconWrapper>
              }
            />
          </FormRowVertical>
        )}

        {passwordError && (
          <FormRowVertical>
            <p style={{ color: "var(--color-red-700)" }}>{passwordError}</p>
          </FormRowVertical>
        )}

        <FormRowVertical>
          <ButtonGroup>
            <Button
              type="submit"
              size="large"
              variation="primary"
              disabled={isUpdating || isSubmitting}
            >
              {!isUpdating ? "Update Profile" : <SpinnerMini />}
            </Button>
            <CancelButton
              type="button"
              size="large"
              variation="secondary"
              onClick={handleCancel}
              disabled={isUpdating || isSubmitting}
            >
              Cancel
            </CancelButton>
          </ButtonGroup>
        </FormRowVertical>
      </Form>
    </ProfileContainer>
  );
}
