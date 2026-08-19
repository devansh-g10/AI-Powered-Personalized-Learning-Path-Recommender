import prisma from "../configs/prisma.js";

/**
 * Get the full profile for the authenticated Supabase user.
 * Auto-creates a profile row if one doesn't exist yet (handles Google OAuth users).
 * @param {object} supabaseUser - the user object from req.user (set by auth middleware)
 */
export const getUserProfile = async (supabaseUser) => {
  const userId = supabaseUser.id;

  // Auto-create profile if missing (first login via Google OAuth or unconfirmed email)
  let profile = await prisma.profile.findUnique({ where: { userId } });

  if (!profile) {
    const fullName =
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.user_metadata?.name ||
      "User";
    const avatarUrl =
      supabaseUser.user_metadata?.avatar_url ||
      supabaseUser.user_metadata?.picture ||
      null;

    profile = await prisma.profile.create({
      data: { userId, fullName, avatarUrl },
    });
  }

  return {
    id: userId,
    email: supabaseUser.email,
    isGoogleUser: !!supabaseUser.app_metadata?.providers?.includes("google"),
    emailConfirmed: !!supabaseUser.confirmed_at,
    createdAt: supabaseUser.created_at,
    profile: {
      id: profile.id,
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
    },
  };
};
