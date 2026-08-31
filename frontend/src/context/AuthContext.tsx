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
      const profile = data.profile;
      const loadedUser: User = {
        id: profile.id,
        email: profile.email,
        fullName: profile.profile?.fullName || "User",
        avatarUrl: profile.profile?.avatarUrl,
        bio: profile.profile?.bio,
        isGoogleUser: profile.isGoogleUser,
      };
      setUser(loadedUser);
      localStorage.setItem("user", JSON.stringify(loadedUser));
    } catch {
      // If backend is unreachable but local user exists, preserve local session
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          clearSession();
        }
      }
    }
  }, []);

  // ─── Initialize from storage ──────────────────────────────────────────────
  useEffect(() => {
    const storedSession = localStorage.getItem("session");
    const storedUser = localStorage.getItem("user");

    if (storedSession && storedUser) {
      try {
        setSession(JSON.parse(storedSession));
        setUser(JSON.parse(storedUser));
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
      const { data } = await authApi.getGoogleOAuthUrl();
      window.location.href = data.url;
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
