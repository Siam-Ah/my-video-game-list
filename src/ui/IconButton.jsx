import styled from "styled-components";

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0.6rem;
  border-radius: var(--border-radius-sm);
  transition: all 0.2s;
  color: var(--color-grey-600);

  &:hover {
    background-color: var(--color-grey-100);
    color: var(--color-grey-800);
  }

  &:focus {
    outline: 2px solid var(--color-brand-600);
    outline-offset: -1px;
  }

  & svg {
    width: 1.6rem;
    height: 1.6rem;
  }
`;

export default IconButton;
