import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor: attach Bearer token ─────────────────────────────────
api.interceptors.request.use((config) => {
  const session = localStorage.getItem("session");
  if (session) {
    try {
      const parsed = JSON.parse(session);
      if (parsed.access_token) {
        config.headers.Authorization = `Bearer ${parsed.access_token}`;
      }
    } catch {
      // ignore parse errors
    }
  }
  return config;
});

// ─── Response interceptor: handle 401 ─────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Only force-redirect if the user has a real stored session (expired token).
      // Guest/demo users or unauthenticated requests should NOT be redirected.
      const storedSession = localStorage.getItem("session");
      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession);
          // Don't redirect demo users
          if (parsed.access_token && !parsed.access_token.startsWith("demo-") && !parsed.access_token.startsWith("token-")) {
            localStorage.removeItem("session");
            localStorage.removeItem("user");
            if (window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
          }
        } catch {
          // ignore
        }
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { fullName: string; email: string; password: string }) =>
    api.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  getGoogleOAuthUrl: () => api.get("/auth/google"),

  syncGoogleProfile: () => api.post("/auth/google/sync"),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  resetPassword: (data: { accessToken: string; newPassword: string }) =>
    api.post("/auth/reset-password", data),

  changePassword: (newPassword: string) =>
    api.post("/auth/change-password", { newPassword }),
};

// ─── Profile API ──────────────────────────────────────────────────────────────

export const profileApi = {
  getMe: () => api.get("/profile/me"),
};

// ─── Conversations API ────────────────────────────────────────────────────────

export const conversationsApi = {
  create: (title?: string) =>
    api.post("/ai/conversations", { title: title || "New Learning Path" }),

  list: () => api.get("/ai/conversations"),

  get: (conversationId: string) =>
    api.get(`/ai/conversations/${conversationId}`),

  delete: (conversationId: string) =>
    api.delete(`/ai/conversations/${conversationId}`),
};

// ─── Messages API ─────────────────────────────────────────────────────────────

export const messagesApi = {
  list: (conversationId: string) =>
    api.get(`/ai/conversations/${conversationId}/messages`),

  send: (conversationId: string, message: string) =>
    api.post(`/ai/conversations/${conversationId}/messages`, { message }),

  sendStream: async (
    conversationId: string,
    message: string,
    onChunk: (accumulated: string, delta: string) => void,
    signal?: AbortSignal
  ) => {
    const session = localStorage.getItem("session");
    let token = "";
    if (session) {
      try {
        token = JSON.parse(session).access_token || "";
      } catch {
        // ignore
      }
    }

    const response = await fetch(
      `${API_BASE_URL}/ai/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message }),
        signal,
      }
    );

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.message || `Request failed with status ${response.status}`);
    }

    if (!response.body) {
      throw new Error("Response body not readable");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = "";
    let messageId = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;
        const dataStr = trimmed.slice(5).trim();
        if (!dataStr) continue;

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.type === "metadata" && parsed.messageId) {
            messageId = parsed.messageId;
          } else if (parsed.type === "chunk" && parsed.content) {
            accumulated += parsed.content;
            onChunk(accumulated, parsed.content);
          } else if (parsed.type === "done") {
            // Done
          }
        } catch {
          // ignore parse errors on individual SSE frames
        }
      }
    }

    return { message: accumulated, messageId };
  },
};

// ─── Learning Context API ─────────────────────────────────────────────────────

export interface LearningContextData {
  learningGoal: string;
  motivation?: string;
  currentLevel: string;
  existingSkills?: string[];
  currentlyLearning?: string;
  nextToLearn?: string;
  depthPreference?: string;
  weeklyHours?: number;
  targetOutcome?: string;
  preferences?: string;
}

export const contextApi = {
  save: (conversationId: string, data: LearningContextData) =>
    api.post(`/ai/conversations/${conversationId}/context`, data),

  get: (conversationId: string) =>
    api.get(`/ai/conversations/${conversationId}/context`),
};

// ─── Roadmap API ──────────────────────────────────────────────────────────────

export const roadmapApi = {
  generate: (conversationId: string, modificationRequest?: string) =>
    api.post(`/ai/conversations/${conversationId}/roadmap`, {
      ...(modificationRequest ? { modificationRequest } : {}),
    }),

  get: (conversationId: string) =>
    api.get(`/ai/conversations/${conversationId}/roadmap`),
};

// ─── Topic Questions API ──────────────────────────────────────────────────────

export const topicApi = {
  askQuestion: (conversationId: string, topicId: string, question: string) =>
    api.post(
      `/ai/conversations/${conversationId}/topics/${topicId}/questions`,
      { question }
    ),
};

export default api;
