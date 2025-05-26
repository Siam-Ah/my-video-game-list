import supabase, { supabaseUrl } from "./supabase";

export async function signup({ username, email, password }) {
  const { data: existingProfile, error: usernameError } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .maybeSingle();

  if (usernameError) throw new Error(usernameError.message);
  if (existingProfile) throw new Error("Username already taken");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        avatar: "",
      },
    },
  });
  if (error?.message.includes("User already registered")) {
    throw new Error("User already registered");
  }

  if (error) throw new Error(error.message);

  return data;
}

export async function login({ email, password }) {
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getCurrentUser() {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null;

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(userError.message);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single();

  if (profileError) throw new Error(profileError.message);

  return {
    ...userData.user,
    profile,
    role: profile.role,
  };
}

export async function updateCurrentUser({
  password,
  newPassword,
  username,
  avatar,
  removeAvatar = false,
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No authenticated user");

  if (username && username !== user.user_metadata?.username) {
    const { data: existingUser, error: fetchError } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (existingUser) {
      throw new Error("username-taken");
    }
  }

  if (newPassword) {
    if (!password) throw new Error("Current password is required");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password,
    });

    if (authError) throw new Error("Current password is incorrect");
  }

  if (newPassword) {
    const { error: passwordError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (passwordError) throw new Error(passwordError.message);
  }

  let avatarUrl = user.user_metadata?.avatar;

  if (removeAvatar) {
    avatarUrl = null;
  } else if (avatar) {
    const fileName = `avatar-${user.id}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    const { error: storageError } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatar);
    if (storageError) throw new Error(storageError.message);
    avatarUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${fileName}`;
  }

  const updates = {};
  if (username) updates.username = username;
  if (avatarUrl !== undefined) updates.avatar = avatarUrl;

  const { error: authUpdateError } = await supabase.auth.updateUser({
    data: updates,
  });
  if (authUpdateError) throw new Error(authUpdateError.message);

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      username: username || user.user_metadata?.username,
      avatar_url: avatarUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) throw new Error(profileError.message);

  return { ...user, user_metadata: { ...user.user_metadata, ...updates } };
}

export async function resetPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw new Error(error.message);
  return data;
}
