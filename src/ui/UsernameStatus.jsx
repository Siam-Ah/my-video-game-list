import styled from "styled-components";
import SpinnerMini from "./SpinnerMini";

const StatusMessage = styled.div`
  font-size: 1.2rem;
  margin-top: 0.4rem;
`;

const ErrorMessage = styled(StatusMessage)`
  color: var(--color-red-700);
`;

const SuccessMessage = styled(StatusMessage)`
  color: var(--color-green-700);
`;

function UsernameStatus({ checking, valid, available, changed = true }) {
  if (!changed) return null;
  if (checking) return <SpinnerMini />;
  if (!valid) return <ErrorMessage>Invalid username format</ErrorMessage>;
  if (available === false)
    return <ErrorMessage>Username is taken</ErrorMessage>;
  if (available === true)
    return <SuccessMessage>Username available!</SuccessMessage>;
  return null;
}

export default UsernameStatus;
