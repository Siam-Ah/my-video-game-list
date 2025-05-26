import { HiOutlineEmojiSad, HiStar } from "react-icons/hi";
import styled from "styled-components";
import Button from "../ui/Button";

import { useTopRatedGames } from "../hooks/useTopRatedGames";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useWindowSize from "../hooks/useWindowSize";
import Spinner from "../ui/Spinner";

const PageHeader = styled.h1`
  text-align: center;
  margin: 2.4rem 0;
  font-size: 3.2rem;
  font-weight: 700;
  color: var(--color-grey-900);
  letter-spacing: -0.05rem;
  line-height: 1.2;
  position: relative;
  padding-bottom: 1.2rem;

  @media (max-width: 768px) {
    font-size: 2.4rem;
    margin: 1.6rem 0;
    &::after {
      width: 3rem;
    }
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 4rem;
    height: 0.4rem;
    background: var(--color-brand-500);
    border-radius: 0.2rem;
    transition: all 0.3s ease;
  }

  &:hover::after {
    width: 8rem;
    background: var(--color-brand-600);
  }

  &:focus {
    outline: 2px solid var(--color-brand-500);
    outline-offset: 0.5rem;
    border-radius: 0.3rem;
  }

  @media (max-width: 768px) {
    letter-spacing: -0.03rem;
    padding-bottom: 1rem;
  }
`;

const StyledEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.6rem;
  text-align: center;
  padding: 4.8rem;
  min-height: 60vh;
`;

const Icon = styled(HiOutlineEmojiSad)`
  font-size: 4.8rem;
  color: var(--color-grey-400);
  transition: transform 0.3s;
  &:hover {
    transform: scale(1.1);
  }
`;

const Heading = styled.h2`
  font-size: 2.4rem;
  font-weight: 600;
  color: var(--color-grey-800);
`;

const Message = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-600);
  max-width: 50rem;
  line-height: 1.6;
`;

const CTAButton = styled.button`
  padding: 1.2rem 2.4rem;
  background-color: var(--color-brand-500);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: var(--color-brand-600);
  }
  &:focus {
    outline: 2px solid var(--color-brand-600);
    outline-offset: 2px;
  }
`;

const GamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(
    ${({ $columns }) => $columns},
    minmax(16rem, 1fr)
  );
  gap: 1.6rem;
  padding: 1.2rem;

  @media (min-width: 768px) {
    gap: 2rem;
    padding: 1.6rem 2.4rem;
    grid-template-columns: repeat(
      ${({ $columns }) => $columns},
      minmax(20rem, 1fr)
    );
  }
`;

const GameCard = styled.div`
  background-color: var(--color-grey-100);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: translateY(-0.3rem);
    box-shadow: var(--shadow-sm);
  }
`;

const GameCover = styled.div`
  aspect-ratio: 2/3;
  width: 100%;
  background-image: ${(props) =>
    `url(https://images.igdb.com/igdb/image/upload/t_cover_big/${props.$imageId}.jpg)`};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  max-height: 35vh;
`;

const GameInfo = styled.div`
  padding: 1.2rem;
`;

const GameTitle = styled.h3`
  font-size: 1.6rem;
  margin-bottom: 0.6rem;
  color: var(--color-grey-800);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const GameMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
`;

const GameRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--color-yellow-700);
  font-weight: 600;
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

function Homepage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const { width } = useWindowSize();
  const { data, isLoading } = useTopRatedGames();

  const calculateColumns = () => {
    if (width >= 2000) return 7;
    if (width >= 1800) return 6;
    if (width >= 1500) return 5;
    if (width >= 1200) return 4;
    if (width >= 900) return 3;
    if (width >= 600) return 2;
    return 1;
  };

  const columns = calculateColumns();
  const rowsPerPage = 3;
  const gamesPerPage = columns * rowsPerPage;

  const { currentGames, totalPages } = useMemo(() => {
    if (!data) return { currentGames: [], totalPages: 0 };

    const indexOfLastGame = currentPage * gamesPerPage;
    const indexOfFirstGame = indexOfLastGame - gamesPerPage;
    const currentGames = data.games.slice(indexOfFirstGame, indexOfLastGame);
    const totalPages = Math.ceil(data.games.length / gamesPerPage);

    return { currentGames, totalPages };
  }, [data, currentPage, gamesPerPage]);

  const paginate = (pageNumber) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentPage(pageNumber);
  };

  const handleGameClick = (slug) => {
    navigate(`/games/${slug}`);
  };

  if (isLoading) return <Spinner />;

  if (!data?.games?.length) {
    return (
      <StyledEmptyState>
        <Icon />
        <Heading>No Games Rated Yet</Heading>
        <Message>
          No games have been rated yet. Become the first to rate games!
        </Message>
        <CTAButton onClick={() => handleGameClick("")}>Browse Games</CTAButton>
      </StyledEmptyState>
    );
  }

  return (
    <div>
      <PageHeader>Top Rated Games</PageHeader>

      <GamesGrid $columns={columns}>
        {currentGames.map((game) => (
          <GameCard key={game.id} onClick={() => handleGameClick(game.slug)}>
            <GameCover $imageId={game.coverImg} />
            <GameInfo>
              <GameTitle>{game.name}</GameTitle>
              <GameMeta>
                <GameRating>
                  <HiStar />
                  <span>
                    {game.userRating}/10 ({game.reviewCount})
                  </span>
                </GameRating>
                <span>{game.year}</span>
              </GameMeta>
            </GameInfo>
          </GameCard>
        ))}
      </GamesGrid>

      {data.games.length > gamesPerPage && (
        <PaginationContainer>
          <PageButton
            variation="secondary"
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
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
    </div>
  );
}
export default Homepage;
