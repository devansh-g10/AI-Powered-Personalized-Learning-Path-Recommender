import { supabase, supabaseAdmin } from "../configs/supabase.config.js";
import prisma from "../configs/prisma.js";

// ─── Register (email + password) ──────────────────────────────────────────────

export const registerUser = async ({ fullName, email, password }) => {
  // Register with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }, // stored in auth.users.raw_user_meta_data
    },
  });

  if (error) throw new Error(error.message);

  const userId = data.user.id;

  // Create profile row in our Prisma profiles table
  const profile = await prisma.profile.upsert({
    where: { userId },
    create: { userId, fullName },
    update: {},
  });

  return {
    session: data.session, // contains access_token, refresh_token
    user: {
      id: userId,
      email: data.user.email,
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
      emailConfirmed: !!data.user.confirmed_at,
    },
  };
};

// ─── Login (email + password) ─────────────────────────────────────────────────

export const loginUser = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw new Error(error.message);

  const userId = data.user.id;

  // Fetch profile from Prisma
  const profile = await prisma.profile.findUnique({ where: { userId } });

  return {
    session: data.session, // contains access_token, refresh_token
    user: {
      id: userId,
      email: data.user.email,
      fullName: profile?.fullName,
      avatarUrl: profile?.avatarUrl,
    },
  };
};

// ─── Google OAuth — returns redirect URL ─────────────────────────────────────
// Frontend redirects user to this URL; Supabase handles the OAuth flow.

export const getGoogleOAuthUrl = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: process.env.GOOGLE_REDIRECT_URL, // e.g. http://localhost:5173/auth/callback
      skipBrowserRedirect: true, // prevents server from being redirected — returns URL instead
    },
  });

  if (error) throw new Error(error.message);

  return data.url;
};

// ─── Sync Profile after Google OAuth ─────────────────────────────────────────
// Called from the frontend after Google OAuth completes and it has a valid token.
// Ensures our Prisma profile table is populated with Google user data.

export const syncGoogleProfile = async (supabaseUser) => {
  const userId = supabaseUser.id;
  const fullName =
    supabaseUser.user_metadata?.full_name ||
    supabaseUser.user_metadata?.name ||
    "User";
  const avatarUrl =
    supabaseUser.user_metadata?.avatar_url ||
    supabaseUser.user_metadata?.picture ||
    null;

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: { userId, fullName, avatarUrl },
    update: { avatarUrl: avatarUrl ?? undefined },
  });

  return {
    id: userId,
    email: supabaseUser.email,
    fullName: profile.fullName,
    avatarUrl: profile.avatarUrl,
  };
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
// Supabase sends the reset email automatically with a magic link.

export const forgotPassword = async ({ email }) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.CLIENT_URL}/reset-password`, // frontend reset page
  });

  // Do not surface errors to prevent email enumeration
  if (error) console.error("Forgot password error:", error.message);
};

// ─── Reset Password (token from Supabase reset email link) ───────────────────
// After the user clicks the email link, the frontend exchanges the token for a
// session and sends the access_token + new password to this endpoint.

export const resetPassword = async ({ accessToken, newPassword }) => {
  // Verify the token is valid first
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData?.user) {
    throw new Error("Invalid or expired reset token. Please request a new password reset.");
  }

  // Use admin client to update password without needing a session cookie
  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    userData.user.id,
    { password: newPassword }
  );

  if (error) throw new Error(error.message);
};

// ─── Change Password (authenticated user) ────────────────────────────────────
// Requires a valid Supabase access_token (Bearer token in Authorization header).
// Since Supabase validates the token on getUser, we use admin to update by ID.

export const changePassword = async ({ userId, newPassword }) => {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) throw new Error(error.message);
};
