import styled from "styled-components";

const Textarea = styled.textarea`
  width: 100%;
  padding: 1.2rem;
  border: 1px solid var(--color-grey-300);
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
  font-family: inherit;
  font-size: 1.6rem;
  resize: vertical;
  min-height: 15rem;

  &:focus {
    outline: 2px solid var(--color-brand-600);
    outline-offset: -1px;
  }
`;

export default Textarea;
