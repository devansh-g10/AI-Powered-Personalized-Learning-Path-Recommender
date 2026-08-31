import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { authApi, profileApi } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  isGoogleUser?: boolean;
}

export interface Session {
  access_token: string;
  refresh_token: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginDemoUser: () => void;
  register: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<{ requiresEmailConfirmation?: boolean; user?: User }>;
  loginWithGoogle: () => Promise<void>;
  handleGoogleCallback: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
  fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── JWT Payload Decoder ───────────────────────────────────────────────────────

function decodeJwtUser(token: string): User | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    const userId = payload.sub || payload.id || "google-user";
    const email = payload.email || "";
    const meta = payload.user_metadata || {};
    const fullName =
      meta.full_name ||
      meta.name ||
      payload.name ||
      (email ? email.split("@")[0] : "Learner");
    const avatarUrl = meta.avatar_url || meta.picture || null;

    return {
      id: userId,
      email,
      fullName,
      avatarUrl,
      isGoogleUser: true,
    };
  } catch {
    return null;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!session && !!user;

  // Persist session helpers
  const saveSession = (sess: Session, usr: User) => {
    localStorage.setItem("session", JSON.stringify(sess));
    localStorage.setItem("user", JSON.stringify(usr));
    setSession(sess);
    setUser(usr);
  };

  const clearSession = () => {
    localStorage.removeItem("session");
    localStorage.removeItem("user");
    setSession(null);
    setUser(null);
  };

  // ─── Fetch profile ────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await profileApi.getMe();
      const profile = data?.profile;
      if (profile) {
        const loadedUser: User = {
          id: profile.id || profile.userId,
          email: profile.email || "",
          fullName: profile.profile?.fullName || profile.fullName || "User",
          avatarUrl: profile.profile?.avatarUrl || profile.avatarUrl,
          bio: profile.profile?.bio || profile.bio,
          isGoogleUser: profile.isGoogleUser ?? true,
        };
        setUser(loadedUser);
        localStorage.setItem("user", JSON.stringify(loadedUser));
        return;
      }
    } catch {
      // If backend is unreachable or sleeping, preserve local user or decode JWT
      const storedSession = localStorage.getItem("session");
      if (storedSession) {
        try {
          const sess = JSON.parse(storedSession);
          if (sess.access_token && !sess.access_token.startsWith("demo-")) {
            const decoded = decodeJwtUser(sess.access_token);
            if (decoded) {
              setUser(decoded);
              localStorage.setItem("user", JSON.stringify(decoded));
              return;
            }
          }
        } catch {
          // ignore
        }
      }

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // ─── Initialize from storage ──────────────────────────────────────────────
  useEffect(() => {
    const storedSession = localStorage.getItem("session");
    const storedUser = localStorage.getItem("user");

    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setSession(parsedSession);

        let initialUser: User | null = null;
        if (storedUser) {
          try {
            initialUser = JSON.parse(storedUser);
          } catch {
            initialUser = null;
          }
        }

        if (!initialUser && parsedSession.access_token) {
          initialUser = decodeJwtUser(parsedSession.access_token);
        }

        if (initialUser) {
          setUser(initialUser);
        }

        fetchProfile().finally(() => setIsLoading(false));
      } catch {
        clearSession();
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  // ─── 1-Click Demo Login ───────────────────────────────────────────────────
  const loginDemoUser = () => {
    const demoUser: User = {
      id: "demo-user-101",
      email: "learner@pathai.dev",
      fullName: "Alex Rivera",
      avatarUrl: null,
      bio: "Aspiring Full-Stack & AI Engineer | Building interactive web apps",
    };
    const demoSession: Session = {
      access_token: "demo-jwt-token",
      refresh_token: "demo-refresh-token",
    };
    saveSession(demoSession, demoUser);
  };

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    if (email === "demo@pathai.dev" && password === "demopassword") {
      loginDemoUser();
      return;
    }
    const { data } = await authApi.login({ email, password });
    saveSession(data.session, {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.fullName || "User",
      avatarUrl: data.user.avatarUrl,
    });
  };

  // ─── Register ─────────────────────────────────────────────────────────────
  const register = async (
    fullName: string,
    email: string,
    password: string
  ) => {
    const { data } = await authApi.register({ fullName, email, password });
    if (data.session) {
      saveSession(data.session, {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.fullName || fullName,
        avatarUrl: data.user.avatarUrl,
      });
    }
    return {
      requiresEmailConfirmation: !!data.requiresEmailConfirmation,
      user: data.user,
    };
  };

  // ─── Update Profile ───────────────────────────────────────────────────────
  const updateUserProfile = (updates: Partial<User>) => {
    setUser((prev) => {
      const base: User = prev || {
        id: "demo-user-101",
        email: "learner@pathai.dev",
        fullName: "Alex Rivera",
        avatarUrl: null,
        bio: null,
      };
      const updated = { ...base, ...updates };
      try {
        localStorage.setItem("user", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // ─── Google OAuth ─────────────────────────────────────────────────────────
  const loginWithGoogle = async () => {
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const { data } = await authApi.getGoogleOAuthUrl(redirectUri);
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      // Demo fallback if backend is offline
      loginDemoUser();
    }
  };

  // ─── Handle Google callback ───────────────────────────────────────────────
  const handleGoogleCallback = async (accessToken: string, refreshToken: string) => {
    const sess: Session = {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
    localStorage.setItem("session", JSON.stringify(sess));
    setSession(sess);

    // Immediately decode user from JWT token so isAuthenticated is true immediately
    const initialUser = decodeJwtUser(accessToken) || {
      id: "google-user",
      email: "learner@google.com",
      fullName: "Learner",
      avatarUrl: null,
      isGoogleUser: true,
    };
    setUser(initialUser);
    localStorage.setItem("user", JSON.stringify(initialUser));

    try {
      await authApi.syncGoogleProfile();
    } catch {
      // non-fatal
    }

    await fetchProfile();
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated,
        isLoading,
        login,
        loginDemoUser,
        register,
        loginWithGoogle,
        handleGoogleCallback,
        logout,
        updateUserProfile,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
