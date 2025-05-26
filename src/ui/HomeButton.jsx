import styled from "styled-components";
import Button from "./Button";
import { useNavigate } from "react-router-dom";

const BackButton = styled(Button)`
  position: absolute;
  top: 2rem;
  left: 2rem;
`;

export default function HomeButton() {
  const navigate = useNavigate();

  return (
    <BackButton
      variation="secondary"
      size="small"
      onClick={() => navigate("/")}
    >
      ← Back to Home
    </BackButton>
  );
}
