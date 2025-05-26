export const passwordValidation = {
  required: "This field is required",
  minLength: {
    value: 8,
    message: "Password needs at least 8 characters",
  },
};

export const confirmPasswordValidation = (
  getValues,
  fieldName = "password"
) => ({
  required: "Please confirm your password",
  validate: (value) =>
    value === getValues()[fieldName] || "Passwords do not match",
});

export const emailValidation = {
  required: "This field is required",
  pattern: {
    value: /\S+@\S+\.\S+/,
    message: "Please provide a valid email address",
  },
};

export const usernameValidation = {
  required: "This field is required",
  minLength: {
    value: 3,
    message: "Username must be at least 3 characters",
  },
  maxLength: {
    value: 20,
    message: "Username must be less than 20 characters",
  },
  pattern: {
    value: /^[a-zA-Z0-9_]+$/,
    message: "Only letters, numbers and underscores allowed",
  },
  validate: {
    noSpaces: (value) =>
      !value.includes(" ") || "Username cannot contain spaces",
  },
};
