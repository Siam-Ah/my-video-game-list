import { useState, useEffect, useCallback } from "react";

export function useAvatar(initialAvatar = null) {
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(initialAvatar);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  useEffect(() => {
    if (avatar) {
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(avatar);
    }
  }, [avatar]);

  const handleAvatarChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }

    setAvatar(file);
    setRemoveAvatar(false);
  }, []);

  const handleRemoveAvatar = useCallback(() => {
    setAvatar(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
  }, []);

  const resetAvatar = useCallback(() => {
    setAvatar(null);
    setAvatarPreview(initialAvatar);
    setRemoveAvatar(false);
  }, [initialAvatar]);

  return {
    avatar,
    avatarPreview,
    removeAvatar,
    handleAvatarChange,
    handleRemoveAvatar,
    resetAvatar,
    setAvatarPreview,
  };
}
