import { useState } from "react";
import { useComments } from "../hooks/useComments";
import { useUser } from "../features/authentication/useUser";
import styled from "styled-components";
import Comment from "./Comment";
import CommentForm from "./CommentForm";
import Button from "./Button";

const ViewCommentsButton = styled.button`
  background: none;
  border: none;
  color: var(--color-grey-600);
  font-size: 1.4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0;
  margin-bottom: 1.2rem;

  &:hover {
    color: var(--color-grey-800);
  }
`;

const LoadMoreButton = styled(Button)`
  margin: 1.6rem auto;
  display: block;
`;

export default function ReviewDiscussion({ reviewId }) {
  const [showComments, setShowComments] = useState(false);
  const [visibleComments, setVisibleComments] = useState(5);
  const { comments, isLoading } = useComments(reviewId);
  const { user } = useUser();

  const toggleComments = () => {
    setShowComments(!showComments);
    setVisibleComments(5);
  };

  const loadMoreComments = () => {
    setVisibleComments((prev) => prev + 5);
  };

  const showLessComments = () => {
    setVisibleComments(5);
    document
      .getElementById(`comments-${reviewId}`)
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div id={`comments-${reviewId}`}>
      <ViewCommentsButton onClick={toggleComments}>
        {showComments
          ? "Hide comments"
          : `View comments (${comments?.length || 0})`}
      </ViewCommentsButton>

      {showComments && (
        <>
          {isLoading ? (
            <div>Loading comments...</div>
          ) : (
            <>
              {comments?.slice(0, visibleComments).map((comment) => (
                <Comment key={comment.id} comment={comment} />
              ))}

              {comments?.length > 5 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "1.2rem",
                  }}
                >
                  {visibleComments < (comments?.length || 0) ? (
                    <LoadMoreButton
                      variation="secondary"
                      size="small"
                      onClick={loadMoreComments}
                    >
                      Load More Comments
                    </LoadMoreButton>
                  ) : visibleComments > 5 ? (
                    <LoadMoreButton
                      variation="secondary"
                      size="small"
                      onClick={showLessComments}
                    >
                      Show Less
                    </LoadMoreButton>
                  ) : null}
                </div>
              )}
            </>
          )}
          {user && <CommentForm reviewId={reviewId} />}
        </>
      )}
    </div>
  );
}
