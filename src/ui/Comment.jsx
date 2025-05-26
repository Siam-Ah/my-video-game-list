import styled from "styled-components";
import { useUser } from "../features/authentication/useUser";
import { useComments } from "../hooks/useComments";
import Button from "./Button";
import { useState } from "react";
import Textarea from "./Textarea";
import UserAvatar from "./UserAvatar";

const CommentContainer = styled.div`
  padding: 1.2rem;
  margin-top: 1.2rem;
  background-color: var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  border-bottom: 1px solid var(--color-grey-200);
  margin-bottom: 1.2rem;

  &:last-child {
    border-bottom: none;
  }
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
`;

const CommenterInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const Avatar = styled.div`
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 50%;
  background-color: var(--color-grey-300);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-700);
  font-weight: 600;
`;

const CommenterName = styled.div`
  font-weight: 500;
  color: var(--color-grey-800);
`;

const CommentDate = styled.div`
  font-size: 1.1rem;
  color: var(--color-grey-500);
`;

const CommentContent = styled.p`
  color: var(--color-grey-700);
  line-height: 1.5;
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

export default function Comment({ comment }) {
  const { user } = useUser();
  const { deleteComment, updateComment, isUpdating } = useComments(
    comment.review_id
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);

  const handleDelete = async () => {
    if (window.confirm("Delete this comment?")) {
      try {
        await deleteComment(comment.id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEdit = async () => {
    try {
      await updateComment({
        commentId: comment.id,
        content: editedContent,
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(comment.content);
  };

  if (isEditing) {
    return (
      <CommentContainer>
        <Textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          rows={3}
          autoFocus
        />
        <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.8rem" }}>
          <Button
            size="small"
            variation="primary"
            onClick={handleEdit}
            disabled={isUpdating}
          >
            {isUpdating ? "Saving..." : "Save"}
          </Button>
          <Button size="small" variation="secondary" onClick={handleCancelEdit}>
            Cancel
          </Button>
        </div>
      </CommentContainer>
    );
  }

  return (
    <CommentContainer>
      <CommentHeader>
        <CommenterInfo>
          <UserAvatar
            user={comment}
            size="medium"
            avatarUrl={comment.profiles.avatar_url}
          />
          <div>
            <CommenterName>
              {comment.profiles.username}
              {comment.profiles.role === "admin" && (
                <AdminBadge>ADMIN</AdminBadge>
              )}
            </CommenterName>
            <CommentDate>
              {new Date(comment.created_at).toLocaleDateString()}
              {comment.updated_at > comment.created_at && " (edited)"}
            </CommentDate>
          </div>
        </CommenterInfo>
        {(user?.id === comment.user_id || user?.profile?.role === "admin") && (
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {user?.id === comment.user_id && (
              <Button
                size="small"
                variation="secondary"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            )}
            <Button size="small" variation="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        )}
      </CommentHeader>
      <CommentContent>{comment.content}</CommentContent>
    </CommentContainer>
  );
}
