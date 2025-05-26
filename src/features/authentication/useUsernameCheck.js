import { useCallback, useState } from "react";
import supabase from "../../services/supabase";

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

export const useUsernameCheck = () => {
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameValid, setUsernameValid] = useState(true);

  const checkUsername = useCallback(async (username, currentUsername = "") => {
    if (!username || username === currentUsername) {
      setUsernameAvailable(null);
      return;
    }

    if (!USERNAME_REGEX.test(username)) {
      setUsernameValid(false);
      setUsernameAvailable(null);
      return;
    }

    setUsernameValid(true);
    setCheckingUsername(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .maybeSingle();

      if (error) throw error;
      setUsernameAvailable(!data);
    } catch (error) {
      console.error("Username check failed:", error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  }, []);

  return {
    usernameAvailable,
    checkingUsername,
    usernameValid,
    checkUsername,
  };
};
