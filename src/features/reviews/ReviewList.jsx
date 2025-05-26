import styled from "styled-components";
import { HiStar } from "react-icons/hi";
import Button from "../../ui/Button";
import { useNavigate } from "react-router-dom";
import ReviewForm from "./ReviewForm";
import { useReviews } from "../../hooks/useReviews";
import ReviewDiscussion from "../../ui/ReviewDiscussion";
import { useMemo, useState } from "react";
import UserAvatar from "../../ui/UserAvatar";
import { useAuth } from "../authentication/useAuth";
import { useReviewMutation } from "../../hooks/useReviewMutation";

const SectionTitle = styled.h2`
  font-size: 2.4rem;
  font-weight: 600;
  color: var(--color-grey-800);
  margin: 3.2rem 0 1.6rem;
`;

const ReviewSection = styled.div`
  margin-top: 4.8rem;
`;

const ReviewPlaceholder = styled.div`
  padding: 3.2rem;
  background-color: var(--color-grey-50);
  border-radius: var(--border-radius-sm);
  text-align: center;
  color: var(--color-grey-500);
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
`;

const ReviewCard = styled.div`
  background-color: var(--color-grey-100);
  padding: 2.4rem;
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.2rem;
`;

const ReviewerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const Avatar = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-color: var(--color-grey-300);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-700);
  font-weight: 600;
`;

const ReviewerName = styled.div`
  font-weight: 600;
  color: var(--color-grey-800);
`;

const ReviewDate = styled.div`
  font-size: 1.2rem;
  color: var(--color-grey-500);
`;

const ReviewRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--color-yellow-700);
`;

const ReviewContent = styled.p`
  color: var(--color-grey-700);
  line-height: 1.6;
`;

const DiscussionSection = styled.div`
  margin-top: 1.6rem;
  padding-top: 1.6rem;
  border-top: 1px solid var(--color-grey-200);
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.2rem;
  padding: 3.2rem 0;
`;

const PageButton = styled(Button)`
  min-width: 4rem;
  padding: 0.8rem;
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

export default function ReviewList({ igdbId, gameName }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(5);
  const { data: reviews, isLoading, error } = useReviews(igdbId);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const { currentReviews, totalPages } = useMemo(() => {
    if (!reviews) return { currentReviews: [], totalPages: 0 };

    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
    const totalPages = Math.ceil(reviews.length / reviewsPerPage);

    return { currentReviews, totalPages };
  }, [reviews, currentPage, reviewsPerPage]);

  const paginate = (pageNumber) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentPage(pageNumber);
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const { deleteReview } = useReviewMutation();

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteReview(reviewId, igdbId);
      } catch (error) {
        console.log(error);
      }
    }
  };

  if (isLoading) return <div>Loading reviews...</div>;
  if (error) return <div>Error loading reviews: {error.message}</div>;

  return (
    <ReviewSection>
      <SectionTitle>Reviews ({reviews?.length || 0})</SectionTitle>

      {reviews?.length > 0 ? (
        <>
          <ReviewsList>
            {currentReviews.map((review) => (
              <ReviewCard key={review.id}>
                <ReviewHeader>
                  <ReviewerInfo>
                    <UserAvatar
                      user={review}
                      size="medium"
                      avatarUrl={review.profiles.avatar_url}
                    />
                    <div>
                      <ReviewerName>
                        {review.profiles.username}
                        {review.profiles.role === "admin" && (
                          <AdminBadge>ADMIN</AdminBadge>
                        )}
                      </ReviewerName>
                      <ReviewDate>
                        {new Date(review.created_at).toLocaleDateString()}
                      </ReviewDate>
                    </div>
                  </ReviewerInfo>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.8rem",
                    }}
                  >
                    <ReviewRating>
                      <HiStar />
                      <span>{review.rating}/10</span>
                    </ReviewRating>
                    {(user?.id === review.user_id || isAdmin) && (
                      <Button
                        size="small"
                        variation="danger"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </ReviewHeader>
                <ReviewContent>{review.content}</ReviewContent>

                <DiscussionSection>
                  <ReviewDiscussion reviewId={review.id} />
                </DiscussionSection>
              </ReviewCard>
            ))}
          </ReviewsList>

          {reviews.length > reviewsPerPage && (
            <PaginationContainer>
              <PageButton
                variation="secondary"
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </PageButton>

              {[...Array(totalPages)].map((_, i) => (
                <PageButton
                  key={i}
                  variation={currentPage === i + 1 ? "primary" : "secondary"}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </PageButton>
              ))}

              <PageButton
                variation="secondary"
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </PageButton>
            </PaginationContainer>
          )}
        </>
      ) : (
        <ReviewPlaceholder>
          No reviews yet. Be the first to review!
        </ReviewPlaceholder>
      )}

      {user ? (
        <ReviewForm igdbId={igdbId} gameName={gameName} />
      ) : (
        <div style={{ marginTop: "3.2rem" }}>
          <Button size="large" variation="secondary" onClick={handleLoginClick}>
            Sign In to Add Your Review
          </Button>
        </div>
      )}
    </ReviewSection>
  );
}
