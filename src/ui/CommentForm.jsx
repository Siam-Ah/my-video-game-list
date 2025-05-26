import { useState } from "react";
import styled from "styled-components";
import { useComments } from "../hooks/useComments";
import Textarea from "./Textarea";
import Button from "./Button";

const CommentFormContainer = styled.div`
  margin-top: 1.6rem;
  padding: 1.6rem;
  background-color: var(--color-grey-100);
  border-radius: var(--border-radius-sm);
`;

const CharacterCount = styled.div`
  text-align: right;
  font-size: 1.2rem;
  color: var(--color-grey-500);
  margin-top: 0.4rem;
`;

export default function CommentForm({ reviewId, onCommentAdded }) {
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const { addComment, isAdding } = useComments(reviewId);

  const maxCharacters = 500;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await addComment({ reviewId, content });
      setContent("");
      setIsExpanded(false);
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isExpanded) {
    return (
      <Button
        size="small"
        variation="secondary"
        onClick={() => setIsExpanded(true)}
      >
        Add a comment
      </Button>
    );
  }

  return (
    <CommentFormContainer>
      <form onSubmit={handleSubmit}>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your comment..."
          maxLength={maxCharacters}
          rows={3}
          autoFocus
        />
        <CharacterCount>{content.length}/500</CharacterCount>
        <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.8rem" }}>
          <Button
            size="small"
            variation="primary"
            type="submit"
            disabled={isAdding || !content.trim()}
          >
            {isAdding ? "Posting..." : "Post Comment"}
          </Button>
          <Button
            size="small"
            variation="secondary"
            type="button"
            onClick={() => setIsExpanded(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </CommentFormContainer>
  );
}
