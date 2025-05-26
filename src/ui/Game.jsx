import styled from "styled-components";
import { HiStar, HiOutlineHeart, HiHeart } from "react-icons/hi";
import Button from "../ui/Button";
import { useParams } from "react-router-dom";
import { useGameDetails } from "../hooks/useGameDetails";
import { useGameRatings } from "../hooks/useGameRatings";
import Spinner from "./Spinner";

const GameHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4.8rem;
  margin-bottom: 4.8rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const GameCover = styled.img`
  width: 100%;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
`;

const GameInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GameTitle = styled.h1`
  font-size: 3.6rem;
  font-weight: 700;
  color: var(--color-grey-800);
`;

const FavoriteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-red-700);
  font-size: 2.4rem;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.8rem;
  color: var(--color-yellow-700);
`;

const Metadata = styled.div`
  display: flex;
  gap: 2.4rem;
  font-size: 1.4rem;
  color: var(--color-grey-600);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const Description = styled.p`
  font-size: 1.6rem;
  line-height: 1.6;
  color: var(--color-grey-700);
`;

const GenreContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin: 1.2rem 0;
`;

const GenreTag = styled.span`
  background-color: var(--color-blue-100);
  color: var(--color-blue-800);
  padding: 0.4rem 0.8rem;
  border-radius: var(--border-radius-sm);
  font-size: 1.2rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.4rem;
  font-weight: 600;
  color: var(--color-grey-800);
  margin: 3.2rem 0 1.6rem;
`;

export default function Game() {
  const isFavorite = false;
  const { slug } = useParams();
  const { data, isLoading, error } = useGameDetails(slug);
  const { data: ratingsData } = useGameRatings(data?.game?.id);

  if (isLoading) return <Spinner />;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.game) return <div>Game not found</div>;

  const { game, companies, genres } = data;

  return (
    <>
      <GameHeader>
        <GameCover
          src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${game.coverImg}.jpg`}
          alt={`${game.name} Cover Art`}
        />
        <GameInfo>
          <TitleRow>
            <GameTitle>{game.name}</GameTitle>
            <FavoriteButton>
              {isFavorite ? <HiHeart /> : <HiOutlineHeart />}
            </FavoriteButton>
          </TitleRow>

          <Rating>
            <HiStar />
            {ratingsData?.averageRating ? (
              <span>
                {ratingsData.averageRating}/10 ({ratingsData.reviewCount} review
                {ratingsData.reviewCount !== 1 ? "s" : ""})
              </span>
            ) : (
              <span>No ratings yet</span>
            )}
          </Rating>

          <Metadata>
            {companies?.map((company, index) => (
              <MetaItem key={index}>{company}</MetaItem>
            ))}
            <MetaItem>{game.releaseDate}</MetaItem>
          </Metadata>

          {game.summary && <Description>{game.summary}</Description>}

          {genres?.length > 0 && (
            <GenreContainer>
              {genres.map((genre) => (
                <GenreTag key={genre}>{genre}</GenreTag>
              ))}
            </GenreContainer>
          )}

          {/* <Button size="large" variation="primary">
            View game
          </Button> */}
        </GameInfo>
      </GameHeader>

      <div>
        {game.storyline ? <SectionTitle>About</SectionTitle> : ""}
        <Description>{game.storyline}</Description>
      </div>
    </>
  );
}
