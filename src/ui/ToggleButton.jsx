import styled from "styled-components";
import IconButton from "./IconButton";

const ToggleButton = styled(IconButton)`
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.6rem;
  background: none;
  color: var(--color-grey-500);
  z-index: 1;

  &:hover {
    color: var(--color-grey-700);
    background: none;
  }
`;

export default ToggleButton;
