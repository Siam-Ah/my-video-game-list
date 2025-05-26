import styled from "styled-components";

const Avatar = styled.div`
  width: ${(props) =>
    props.size === "large"
      ? "12rem"
      : props.size === "medium"
      ? "3.6rem"
      : "3.2rem"};
  height: ${(props) =>
    props.size === "large"
      ? "12rem"
      : props.size === "medium"
      ? "3.6rem"
      : "3.2rem"};
  border-radius: 50%;
  background-color: var(--color-grey-200);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarPlaceholder = styled.div`
  font-size: ${(props) =>
    props.size === "large"
      ? "2rem"
      : props.size === "medium"
      ? "1.6rem"
      : "1.4rem"};
  color: var(--color-grey-500);
`;

export default function UserAvatar({
  user,
  size = "small",
  avatarUrl,
  showPreview = false,
}) {
  const username =
    user?.user_metadata?.username ||
    user?.profile?.username ||
    user?.profiles?.username;
  const defaultAvatar =
    user?.user_metadata?.avatar ||
    user?.profile?.avatar_url ||
    user?.profiles?.avatar_url;
  const displayAvatar = showPreview ? avatarUrl : defaultAvatar;

  return (
    <Avatar size={size}>
      {displayAvatar ? (
        <img src={displayAvatar} alt="User avatar" />
      ) : (
        <AvatarPlaceholder size={size}>
          {username?.charAt(0).toUpperCase() || "?"}
        </AvatarPlaceholder>
      )}
    </Avatar>
  );
}
