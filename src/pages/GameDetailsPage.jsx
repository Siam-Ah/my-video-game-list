import styled from "styled-components";
import Game from "../ui/Game";
import ReviewList from "../features/reviews/ReviewList";
import { useGameDetails } from "../hooks/useGameDetails";
import { useParams } from "react-router-dom";
import HomeButton from "../ui/HomeButton";

const GameContainer = styled.div`
  max-width: 120rem;
  margin: 0 auto;
  padding: 3.2rem;
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
`;

function GameDetailsPage() {
  const { slug } = useParams();
  const { data } = useGameDetails(slug);

  return (
    <GameContainer>
      <HomeButton />
      <Game />
      {data?.game && (
        <ReviewList igdbId={data.game.id} gameName={data.game.name} />
      )}
    </GameContainer>
  );
}

export default GameDetailsPage;
