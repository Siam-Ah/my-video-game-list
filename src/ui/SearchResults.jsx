import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const SearchResultsContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 40rem;
  max-height: 60vh;
  overflow-y: auto;
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  z-index: 1000;
  margin-top: 0.5rem;
`;

const ResultItem = styled.div`
  padding: 1rem 1.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-grey-100);
  }
`;

const GameCover = styled.div`
  width: 4rem;
  height: 5.3rem;
  background-image: ${(props) =>
    props.$imageId
      ? `url(https://images.igdb.com/igdb/image/upload/t_cover_small/${props.$imageId}.jpg)`
      : "none"};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: var(--color-grey-200);
`;

const GameTitle = styled.div`
  font-size: 1.4rem;
  color: var(--color-grey-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

function SearchResults({ games, onSelect }) {
  const navigate = useNavigate();

  if (!games || games.length === 0) return null;

  return (
    <SearchResultsContainer>
      {games.map((game) => (
        <ResultItem
          key={game.id}
          onClick={() => {
            navigate(`/games/${game.slug}`);
            onSelect();
          }}
        >
          <GameCover $imageId={game.coverImg} />
          <GameTitle>{game.name}</GameTitle>
        </ResultItem>
      ))}
    </SearchResultsContainer>
  );
}

export default SearchResults;
