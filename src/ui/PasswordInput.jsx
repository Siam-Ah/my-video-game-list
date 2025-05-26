import styled from "styled-components";
import Input from "./Input";
import ToggleButton from "./ToggleButton";
import { HiEyeOff } from "react-icons/hi";
import { HiEye } from "react-icons/hi2";
import { useState } from "react";

const PasswordWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledPasswordInput = styled(Input)`
  width: 100%;
  padding-right: 4rem;
`;

function PasswordInput({
  id,
  disabled = false,
  autoComplete = "current-password",
  register,
  showPasswordInitially = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(showPasswordInitially);

  return (
    <PasswordWrapper>
      <StyledPasswordInput
        type={showPassword ? "text" : "password"}
        id={id}
        disabled={disabled}
        autoComplete={autoComplete}
        {...props}
        {...(register && register(id))}
      />
      <ToggleButton
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <HiEyeOff /> : <HiEye />}
      </ToggleButton>
    </PasswordWrapper>
  );
}

export default PasswordInput;
