import { useEffect, useState } from "react";
import { HiStar } from "react-icons/hi";
import styled from "styled-components";
import FormRowVertical from "../../ui/FormRowVertical";
import Textarea from "../../ui/Textarea";
import Button from "../../ui/Button";
import { useReviewMutation } from "../../hooks/useReviewMutation";
import { useUser } from "../authentication/useUser";
import { useReviews } from "../../hooks/useReviews";

const ReviewFormContainer = styled.div`
  background-color: var(--color-grey-100);
  padding: 3.2rem;
  border-radius: var(--border-radius-md);
  margin-top: 3.2rem;
`;

const FormTitle = styled.h3`
  font-size: 2rem;
  margin-bottom: 2.4rem;
  color: var(--color-grey-800);
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 2.4rem;
`;

const RatingLabel = styled.span`
  font-weight: 500;
  color: var(--color-grey-700);
`;

const StarsContainer = styled.div`
  display: flex;
  gap: 0.8rem;
`;

const StarButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${(props) =>
    props.$active ? "var(--color-yellow-700)" : "var(--color-grey-400)"};
  font-size: 2.4rem;
  transition: all 0.2s;
`;

const CharacterCount = styled.div`
  text-align: right;
  font-size: 1.2rem;
  color: var(--color-grey-500);
  margin-top: 0.4rem;
`;

const ErrorMessage = styled.div`
  color: var(--color-red-700);
  font-size: 1.4rem;
  margin-top: 0.8rem;
`;

const ReviewContent = styled.p`
  color: var(--color-grey-700);
  line-height: 1.6;
`;

function ReviewForm({ igdbId, gameName }) {
  const { user } = useUser();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  const { data: reviews } = useReviews(igdbId);
  const { mutateReview, deleteReview, isLoading } = useReviewMutation();

  useEffect(() => {
    if (reviews && user) {
      const userReview = reviews.find((r) => r.user_id === user.id);
      setExistingReview(userReview || null);
    }
  }, [reviews, user]);

  const maxCharacters = 500;
  const characterCount = reviewText.length;

  const handleEditClick = () => {
    setIsEditing(true);
    setRating(existingReview.rating);
    setReviewText(existingReview.content);
  };

  const handleDeleteReview = async () => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteReview(existingReview.id, igdbId);
        setExistingReview(null);
        setIsEditing(false);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setRating(0);
    setReviewText("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to submit a review");
      return;
    }

    if (!rating || !reviewText.trim()) {
      setError("Please add a rating and review text");
      return;
    }

    if (reviewText.length > maxCharacters) {
      setError(`Review must be less than ${maxCharacters} characters`);
      return;
    }

    try {
      await mutateReview({
        igdbId,
        gameName,
        rating,
        content: reviewText,
        reviewId: existingReview?.id,
      });

      if (existingReview) {
        setIsEditing(false);
      } else {
        setRating(0);
        setHoverRating(0);
        setReviewText("");
        setError("");
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (existingReview && !isEditing) {
    return (
      <ReviewFormContainer>
        <FormTitle>Your Review</FormTitle>
        <div style={{ marginBottom: "2rem" }}>
          <RatingContainer>
            <RatingLabel>Your Rating:</RatingLabel>
            <StarsContainer>
              {[...Array(10)].map((_, i) => (
                <HiStar
                  key={i}
                  color={i < existingReview.rating ? "#fbbf24" : "#d1d5db"}
                />
              ))}
            </StarsContainer>
            <span style={{ marginLeft: "1rem" }}>
              {existingReview.rating}/10
            </span>
          </RatingContainer>
          <ReviewContent>{existingReview.content}</ReviewContent>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button size="small" variation="secondary" onClick={handleEditClick}>
            Edit Review
          </Button>
          <Button
            size="small"
            variation="danger"
            onClick={handleDeleteReview}
            disabled={isLoading}
          >
            Delete Review
          </Button>
        </div>
      </ReviewFormContainer>
    );
  }

  return (
    <ReviewFormContainer>
      <FormTitle>
        {existingReview ? "Edit Your Review" : "Write Your Review"}
      </FormTitle>

      <form onSubmit={handleSubmit}>
        <RatingContainer>
          <RatingLabel>Your Rating:</RatingLabel>
          <StarsContainer>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
              <StarButton
                key={star}
                type="button"
                $active={star <= (hoverRating || rating)}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`Rate ${star} out of 10`}
              >
                <HiStar />
              </StarButton>
            ))}
          </StarsContainer>
          <span style={{ marginLeft: "1rem" }}>{rating}/10</span>
        </RatingContainer>

        <FormRowVertical label="Your Review">
          <Textarea
            id="review"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            maxLength={maxCharacters}
            rows={5}
            placeholder="Share your thoughts about the game..."
            disabled={isLoading}
          />
          <CharacterCount>
            {characterCount}/{maxCharacters} characters
          </CharacterCount>
        </FormRowVertical>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <FormRowVertical>
          {existingReview && (
            <Button
              type="button"
              variation="secondary"
              onClick={handleCancelEdit}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button
            size="large"
            variation="primary"
            type="submit"
            disabled={isLoading || !user}
          >
            {isLoading
              ? "Submitting..."
              : existingReview
              ? "Update Review"
              : "Submit Review"}
          </Button>
        </FormRowVertical>
      </form>
    </ReviewFormContainer>
  );
}

export default ReviewForm;
