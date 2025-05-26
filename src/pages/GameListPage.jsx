import { useMemo, useState } from "react";
import { HiStar } from "react-icons/hi";
import styled from "styled-components";
import Button from "../ui/Button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGameList } from "../hooks/useGameList";
import HomeButton from "../ui/HomeButton";
import useWindowSize from "../hooks/useWindowSize";
import Spinner from "../ui/Spinner";

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

const GamePlatforms = styled.div`
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  margin-top: 1.2rem;
`;

const PlatformTag = styled.span`
  background-color: var(--color-grey-200);
  padding: 0.4rem 0.8rem;
  border-radius: var(--border-radius-sm);
  font-size: 1.2rem;
  color: var(--color-grey-700);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4.8rem;
  color: var(--color-grey-500);
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

function GameListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  const [currentPage, setCurrentPage] = useState(1);
  const { width } = useWindowSize();

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

  const { data, isLoading } = useGameList({ name: searchTerm });

  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;

  const { enrichedGames, currentGames, totalPages } = useMemo(() => {
    if (!data) return { enrichedGames: [], currentGames: [], totalPages: 0 };

    const enrichedGames = data.games.map((game) => ({
      ...game,
      platformNames: game.platforms
        ? game.platforms.map((platformId) => {
            const platform = data.platforms.find((p) => p.id === platformId);
            return platform
              ? platform.name
              : `Unknown Platform (ID: ${platformId})`;
          })
        : [],
    }));

    const currentGames = enrichedGames.slice(indexOfFirstGame, indexOfLastGame);
    const totalPages = Math.ceil(enrichedGames.length / gamesPerPage);

    return { enrichedGames, currentGames, totalPages };
  }, [data, indexOfFirstGame, indexOfLastGame, gamesPerPage]);

  const paginate = (pageNumber) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentPage(pageNumber);
  };

  const handleGameClick = (slug) => {
    navigate(`/games/${slug}`);
  };

  if (isLoading) return <Spinner />;

  return (
    <>
      <HomeButton />
      {enrichedGames.length > 0 ? (
        <>
          <GamesGrid $columns={columns}>
            {currentGames.map((game) => (
              <GameCard
                key={game.id}
                onClick={() => handleGameClick(game.slug)}
              >
                <GameCover $imageId={game.coverImg} />
                <GameInfo>
                  <GameTitle>{game.name}</GameTitle>
                  <GameMeta>
                    <GameRating>
                      <HiStar />
                      {game.userRating !== null ? (
                        <span>
                          {game.userRating}/10
                          {game.reviewCount > 0 && ` (${game.reviewCount})`}
                        </span>
                      ) : (
                        <span>N/A</span>
                      )}
                    </GameRating>
                    <span>{game.year}</span>
                  </GameMeta>
                  <GamePlatforms>
                    {game.platformNames.map((platform) => (
                      <PlatformTag key={`${game.id}-${platform}`}>
                        {platform}
                      </PlatformTag>
                    ))}
                  </GamePlatforms>
                </GameInfo>
              </GameCard>
            ))}
          </GamesGrid>
          {enrichedGames.length > gamesPerPage && (
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
        <EmptyState>
          <h3>No games found</h3>
          <p>Try adjusting your search criteria</p>
        </EmptyState>
      )}
    </>
  );
}

export default GameListPage;
