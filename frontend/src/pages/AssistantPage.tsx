import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  Plus,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Route,
  Trash2,
  Zap,
  Code2,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { messagesApi, conversationsApi } from "@/lib/api";
import {
  fetchLiveDashboardData,
  dispatchProgressUpdate,
  type LearningPathItem,
  type SkillCompetency,
} from "@/lib/learning-data";
import MarkdownRenderer from "@/components/chat/MarkdownRenderer";
import { type ChatSession } from "@/components/chat/TutorSessionsSidebar";
import { generateContextualTutorResponse } from "@/lib/tutor-engine";

export interface MessageItem {
  id?: string;
  role: "HUMAN" | "AI";
  content: string;
  createdAt?: string;
  topicTag?: string;
  codeSnippet?: string;
  isVerified?: boolean;
}

export default function AssistantPage() {
  const { id: routeConvId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const topicParam = searchParams.get("topic");
  const navigate = useNavigate();

  // ─── Live Learning Context State ──────────────────────────────────────────────
  const [activePath, setActivePath] = useState<LearningPathItem | null>(null);
  const [allPaths, setAllPaths] = useState<LearningPathItem[]>([]);
  const [skillCompetencies, setSkillCompetencies] = useState<SkillCompetency[]>([]);
  const [activeTopic, setActiveTopic] = useState<string>(topicParam || "React 19 & Full-Stack Architecture");

  // ─── Chat & Sessions State ────────────────────────────────────────────────────
  const [conversationId, setConversationId] = useState<string>(routeConvId || "session-default");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedMode, setSelectedMode] = useState<"general" | "code" | "deep" | "practice">("general");

  const [messages, setMessages] = useState<MessageItem[]>([]);

  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, scrollToBottom]);

  // ─── 1. Load Live Context from Learning Engine & Backend Conversations ──────
  useEffect(() => {
    const loadLiveContextAndSessions = async () => {
      try {
        setIsLoading(true);

        // Fetch live dashboard & learning paths data
        const fullData = await fetchLiveDashboardData();
        setAllPaths(fullData.learningPaths);
        setSkillCompetencies(fullData.skillCompetencies);

        // Determine active path
        let current = fullData.learningPaths[0] || null;
        if (routeConvId) {
          const match = fullData.learningPaths.find((p) => p.id === routeConvId);
          if (match) current = match;
        } else if (fullData.continueLearning) {
          current = fullData.continueLearning;
        }

        if (current) {
          setActivePath(current);
          const currentTopic = topicParam || current.currentMilestone || current.title;
          setActiveTopic(currentTopic);
        }

        // Load sessions: Check user-saved localStorage sessions first
        const saved = localStorage.getItem("pathai_chat_sessions");
        let initialSessions: ChatSession[] = [];

        if (saved !== null) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              initialSessions = parsed;
            }
          } catch {
            initialSessions = [];
          }
        } else {
          // Brand new user: try backend conversations first
          try {
            const { data: convData } = await conversationsApi.list();
            if (convData?.conversations && Array.isArray(convData.conversations) && convData.conversations.length > 0) {
              initialSessions = convData.conversations.map((c: { id: string; title: string; updatedAt?: string; createdAt?: string }) => ({
                id: c.id,
                title: c.title,
                topicTag: "Live Mentorship",
                lastMessage: "Connected to live roadmap.",
                updatedAt: c.updatedAt || c.createdAt || new Date().toISOString(),
                pathId: c.id,
              }));
            }
          } catch {
            // Backend offline
          }
          localStorage.setItem("pathai_chat_sessions", JSON.stringify(initialSessions));
        }

        setSessions(initialSessions);
        if (initialSessions.length > 0) {
          if (!routeConvId && !conversationId) {
            setConversationId(initialSessions[0].id);
          }
        } else {
          setConversationId("");
          setMessages([]);
        }
      } catch (err) {
        console.error("Failed to load live learning context:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLiveContextAndSessions();
  }, [routeConvId, topicParam]);

  // ─── 2. Load Messages for Active Conversation from Backend or Local Store ───
  useEffect(() => {
    const loadMessagesForSession = async () => {
      const activeId = conversationId || (sessions[0]?.id) || "live-session";
      if (!activeId) return;

      const stored = localStorage.getItem(`messages_${activeId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        } catch {
          // Ignore
        }
      }

      // If real UUID or server conversation ID, fetch from backend API
      try {
        setIsLoading(true);
        const { data } = await messagesApi.list(activeId);
        if (data?.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
          localStorage.setItem(`messages_${activeId}`, JSON.stringify(data.messages));
          return;
        }
      } catch {
        // Conversation might not have backend messages yet
      } finally {
        setIsLoading(false);
      }

      // If empty, set clean state
      if (!stored) {
        setMessages([]);
      }
    };

    loadMessagesForSession();
  }, [conversationId, sessions]);

  const persistMessages = (newMsgs: MessageItem[], targetId = conversationId) => {
    if (!targetId) return;
    localStorage.setItem(`messages_${targetId}`, JSON.stringify(newMsgs));

    setSessions((prev) => {
      const last = newMsgs[newMsgs.length - 1];
      const updated = prev.map((s) => {
        if (s.id === targetId) {
          return {
            ...s,
            lastMessage: last?.content.slice(0, 80) || s.lastMessage,
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      });
      localStorage.setItem("pathai_chat_sessions", JSON.stringify(updated));
      return updated;
    });
  };

  // ─── 4. Quick Clean Prompt Starters (Only 2 Main Actions) ───────────────────
  const cleanPromptSuggestions = [
    {
      label: "Explain Concepts",
      prompt: `Please explain the core concepts, mental model, and production best practices for "${activeTopic}". Include a clean TypeScript code example.`,
      icon: Zap,
    },
    {
      label: "Review Code",
      prompt: `Can you review my code for "${activeTopic}"? I want feedback on architecture, type safety, and edge-case resilience.`,
      icon: Code2,
    },
  ];

  // ─── 5. Message Sender ───────────────────────────────────────────────────────
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    setInputMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const tempUserMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      role: "HUMAN",
      content: text,
      createdAt: new Date().toISOString(),
      topicTag: activeTopic,
    };

    const updatedWithUser = [...messages, tempUserMsg];
    setMessages(updatedWithUser);
    persistMessages(updatedWithUser);
    setIsSending(true);

    let currentConvId = conversationId;
    let remoteSuccess = false;

    if (currentConvId && !currentConvId.startsWith("session-") && !currentConvId.startsWith("conv-")) {
      try {
        const { data } = await messagesApi.send(currentConvId, text);
        if (data?.message) {
          const aiMsg: MessageItem = {
            id: data.messageId || `ai-${Date.now()}`,
            role: "AI",
            content: data.message,
            createdAt: new Date().toISOString(),
            topicTag: activeTopic,
          };
          const updatedWithAi = [...updatedWithUser, aiMsg];
          setMessages(updatedWithAi);
          persistMessages(updatedWithAi);
          remoteSuccess = true;
        }
      } catch (err) {
        console.warn("Backend AI endpoint unreachable, switching to grounded contextual mentor engine.", err);
      }
    }

    if (!remoteSuccess) {
      setTimeout(() => {
        const tutorResult = generateContextualTutorResponse(
          text,
          activeTopic,
          activePath,
          skillCompetencies
        );

        const aiMsg: MessageItem = {
          id: `ai-${Date.now()}`,
          role: "AI",
          content: tutorResult.content,
          createdAt: new Date().toISOString(),
          topicTag: activeTopic,
          codeSnippet: tutorResult.codeSnippet,
        };

        const updatedWithAi = [...updatedWithUser, aiMsg];
        setMessages(updatedWithAi);
        persistMessages(updatedWithAi);
        setIsSending(false);
      }, 450);
    } else {
      setIsSending(false);
    }
  };

  // ─── 6. Action Handlers ──────────────────────────────────────────────────────
  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleMarkMilestoneUnderstood = (topicTitle: string) => {
    if (!activePath) return;

    const storageKey = `completed_topics_${activePath.id}`;
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");

    const allTopics = activePath.roadmap?.phases?.flatMap((p) => p.topics) || [];
    const matched = allTopics.find((t) => t.title.toLowerCase().includes(topicTitle.toLowerCase())) || allTopics[0];

    const topicId = matched?.topicId || `topic-${Date.now()}`;
    if (!existing.includes(topicId)) {
      const updated = [...existing, topicId];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      dispatchProgressUpdate({ action: "mark_understood", pathId: activePath.id, topicId });
    }

    const confirmMsg: MessageItem = {
      id: `ai-${Date.now()}`,
      role: "AI",
      content: `**Milestone Verified: ${topicTitle}**\n\nProgress has been saved to your learning roadmap for **${activePath.title}**. You can track verified competencies in the **Skills** matrix or continue to your next phase.`,
      createdAt: new Date().toISOString(),
      isVerified: true,
    };
    const updated = [...messages, confirmMsg];
    setMessages(updated);
    persistMessages(updated);
  };

  const handleNewSession = async () => {
    let newId = `session-${Date.now()}`;
    let newTitle = activeTopic || activePath?.title || "New Mentorship";

    try {
      const { data } = await conversationsApi.create(newTitle);
      if (data?.conversation?.id || data?.id) {
        newId = data.conversation?.id || data.id;
        newTitle = data.conversation?.title || newTitle;
      }
    } catch {
      // Local fallback
    }

    const newSession: ChatSession = {
      id: newId,
      title: newTitle,
      topicTag: activePath?.category || "Live Mentorship",
      lastMessage: "New live mentorship session started.",
      updatedAt: new Date().toISOString(),
      pathId: activePath?.id,
    };

    const updatedSessions = [newSession, ...sessions.filter((s) => s.id !== newId)];
    setSessions(updatedSessions);
    localStorage.setItem("pathai_chat_sessions", JSON.stringify(updatedSessions));

    setConversationId(newId);
    setMessages([]);
    persistMessages([], newId);
  };

  const handleSelectSession = (session: ChatSession) => {
    setConversationId(session.id);
    if (session.pathId) {
      const match = allPaths.find((p) => p.id === session.pathId);
      if (match) {
        setActivePath(match);
        setActiveTopic(match.currentMilestone || session.title);
      }
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!window.confirm("Delete this mentorship session?")) return;

    try {
      await conversationsApi.delete(sessionId);
    } catch {
      // Local deletion
    }

    const filtered = sessions.filter((s) => s.id !== sessionId);
    setSessions(filtered);
    localStorage.setItem("pathai_chat_sessions", JSON.stringify(filtered));
    localStorage.removeItem(`messages_${sessionId}`);
    if (conversationId === sessionId) {
      if (filtered.length > 0) {
        handleSelectSession(filtered[0]);
      } else {
        setConversationId("");
        setMessages([]);
      }
    }
  };

  const isInitialState = messages.length === 0;

  return (
    <div className="w-full flex h-[calc(100vh-65px)] bg-slate-50 text-zinc-900 overflow-hidden font-sans select-none relative" data-lenis-prevent="true">
      {/* ─── 1. Left Light Sidebar (Clean Pattern) ─────────────────────── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="h-full bg-white border-r border-zinc-200 flex flex-col shrink-0 overflow-hidden z-20 shadow-xs"
          >
            {/* Top Row: New Chat + Collapse Sidebar Toggle */}
            <div className="p-3 pb-2 flex items-center gap-2 border-b border-zinc-200/60">
              <button
                type="button"
                onClick={handleNewSession}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[#2b7fff] font-bold bg-blue-50/90 hover:bg-blue-100 transition-colors cursor-pointer border border-[#2b7fff]/20 text-xs shadow-2xs group"
              >
                <Plus className="size-4 text-[#2b7fff] stroke-[2.5]" />
                <span>New chat</span>
              </button>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer border-0 bg-transparent shrink-0"
                title="Close sidebar"
              >
                <PanelLeftClose className="size-4" />
              </button>
            </div>

            {/* Recents Section */}
            <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 [scrollbar-width:thin] overscroll-contain" data-lenis-prevent="true">
              <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider select-none">
                <span>Recents</span>
                {sessions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!window.confirm("Clear all chat history?")) return;
                      setSessions([]);
                      setConversationId("");
                      setMessages([]);
                      localStorage.setItem("pathai_chat_sessions", JSON.stringify([]));
                    }}
                    className="text-[10px] text-zinc-400 hover:text-red-500 transition-colors cursor-pointer border-0 bg-transparent font-normal normal-case"
                  >
                    clear all
                  </button>
                )}
              </div>

              {sessions.length === 0 ? (
                <div className="py-12 px-3 text-center text-xs text-zinc-400 font-medium">
                  No chat history
                </div>
              ) : (
                sessions.map((s) => {
                  const isActive = s.id === conversationId;
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSelectSession(s)}
                      className={`group relative px-3 py-2 rounded-xl text-left cursor-pointer transition-colors flex items-center justify-between gap-2 ${isActive
                        ? "bg-blue-50/90 text-[#2b7fff] font-bold border-l-2 border-[#2b7fff] shadow-2xs"
                        : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                        }`}
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs truncate">{s.title}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(e, s.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-600 transition-opacity cursor-pointer border-0 bg-transparent"
                        title="Delete chat"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ─── 2. Main Canvas ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white h-full relative text-zinc-900 z-10">
        {/* Floating Sidebar Open Trigger if Sidebar is Hidden */}
        {!sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="absolute top-3 left-3 z-30 p-1.5 rounded-lg bg-white shadow-sm border border-zinc-200 text-[#2b7fff] hover:bg-blue-50 transition-colors cursor-pointer"
            title="Open sidebar"
          >
            <PanelLeft className="size-4" />
          </button>
        )}

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 space-y-6 [scrollbar-width:thin] overscroll-contain select-text" data-lenis-prevent="true">
          <div className="w-full flex flex-col space-y-6 min-h-full">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-zinc-400 py-20">
                <Loader2 className="size-5 text-[#2b7fff] animate-spin" />
                <span className="text-xs">Connecting to learning context...</span>
              </div>
            ) : (
              <>
                {/* Initial Blank State (Centered Welcome with Animated Floating 3D Mascot) */}
                {isInitialState && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-8 sm:py-12 select-none max-w-xl mx-auto">
                    {/* Animated 3D Mascot Character */}
                    <div className="relative flex flex-col items-center justify-center">

                      {/* Floating Robot Body (High-Res Transparent Mascot) */}
                      <motion.div
                        animate={{
                          y: [0, -12, 0],
                          rotate: [0, 1.2, -1.2, 0],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 3.8,
                          ease: "easeInOut",
                        }}
                        className="relative size-44 sm:size-52 z-10 flex items-center justify-center pointer-events-none select-none"
                      >
                        <img
                          src="/ai_robot_mascot.png"
                          alt="PathAI Robot Mascot"
                          className="size-full object-contain drop-shadow-[0_16px_28px_rgba(43,127,255,0.22)]"
                        />
                      </motion.div>

                      {/* Ambient Blue Glowing Ring Pulse beneath the Robot */}
                      <motion.div
                        animate={{
                          scale: [1, 1.18, 1],
                          opacity: [0.5, 0.2, 0.5],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 2.2,
                          ease: "easeInOut",
                        }}
                        className="w-24 sm:w-32 h-3.5 bg-sky-400/40 rounded-full blur-md -mt-4"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 pt-1">
                      <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#2b7fff] tracking-tight">
                        How can I help you today?
                      </h2>

                    </div>

                    {/* Quick Starter Chips */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2 max-w-lg">
                      {cleanPromptSuggestions.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(item.prompt)}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-blue-50/70 hover:bg-[#2b7fff] text-[#2b7fff] hover:text-white text-xs font-semibold transition-all cursor-pointer border border-[#2b7fff]/20 shadow-2xs hover:shadow-sm"
                          >
                            <Icon className="size-3.5" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Chat Messages */}
                {messages.map((msg, index) => {
                  const isUser = msg.role === "HUMAN";
                  const msgId = msg.id || `msg-${index}`;

                  return (
                    <motion.div
                      key={msgId}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                      className={`flex flex-col ${isUser ? "items-end ml-auto" : "items-start mr-auto"} gap-1 w-full`}
                    >
                      {/* Message Content Bubble */}
                      <div
                        className={`text-sm leading-relaxed ${isUser
                          ? "bg-[#2b7fff] text-white px-4 py-2.5 rounded-2xl rounded-tr-xs max-w-xl self-end shadow-sm"
                          : "text-zinc-900 py-1 w-full"
                          }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap font-normal">{msg.content}</p>
                        ) : (
                          <MarkdownRenderer content={msg.content} darkTheme={false} />
                        )}
                      </div>

                      {/* Icon Utilities Under AI Message */}
                      {!isUser && (
                        <div className="flex items-center gap-1 mt-1 px-1 text-zinc-400 select-none">
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msgId, msg.content)}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 hover:text-[#2b7fff] transition-colors cursor-pointer border-0 bg-transparent"
                            title="Copy"
                          >
                            {copiedMessageId === msgId ? (
                              <Check className="size-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSendMessage(`Can you give me another practical example and test case for "${activeTopic}"?`)}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 hover:text-[#2b7fff] transition-colors cursor-pointer border-0 bg-transparent"
                            title="Retry / Follow-up"
                          >
                            <RefreshCw className="size-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMarkMilestoneUnderstood(activeTopic)}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 hover:text-emerald-600 transition-colors cursor-pointer border-0 bg-transparent"
                            title="Mark Understood"
                          >
                            <CheckCircle2 className="size-3.5" />
                          </button>

                          {activePath && (
                            <button
                              type="button"
                              onClick={() => navigate(`/conversations/${activePath.id}/roadmap`)}
                              className="p-1.5 rounded-lg hover:bg-zinc-100 hover:text-[#2b7fff] transition-colors cursor-pointer border-0 bg-transparent"
                              title="Roadmap"
                            >
                              <Route className="size-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Generating Indicator */}
                {isSending && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-start gap-1 w-full mr-auto py-1"
                  >
                    <div className="flex items-center gap-2 py-1 text-xs text-[#2b7fff]">
                      <span className="flex gap-1 items-center">
                        <span className="size-1.5 rounded-full bg-[#2b7fff] animate-pulse" />
                        <span className="size-1.5 rounded-full bg-[#2b7fff] animate-pulse [animation-delay:0.2s]" />
                        <span className="size-1.5 rounded-full bg-[#2b7fff] animate-pulse [animation-delay:0.4s]" />
                      </span>
                      <span className="font-semibold text-[#2b7fff]">Thinking...</span>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ─── 3. Floating Bottom Composer (Clean Light Pill Pattern) ───── */}
        <div className="px-4 sm:px-8 pb-3 pt-1 bg-gradient-to-t from-slate-50/90 via-slate-50/50 to-transparent shrink-0 relative z-20">
          <div className="max-w-3xl mx-auto flex flex-col items-center gap-2">
            {/* Light Pill Composer */}
            <div className="w-full bg-white/95 backdrop-blur-xl rounded-3xl border border-zinc-200/90 p-3 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col gap-1.5 focus-within:border-[#2b7fff] focus-within:ring-4 focus-within:ring-[#2b7fff]/10 transition-all">
              {/* Auto-expanding Input Area */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex flex-col gap-1"
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask anything..."
                  className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none resize-none max-h-36 leading-relaxed border-0 font-sans"
                />

                {/* Bottom Controls Row */}
                <div className="flex items-center justify-between pt-1">
                  {/* Left Attachment / Mode buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      title="Add code snippet"
                      onClick={() => {
                        setInputMessage((prev) =>
                          prev ? `${prev}\n\n\`\`\`typescript\n// Paste code here\n\`\`\`` : "```typescript\n// Paste code here\n```"
                        );
                        textareaRef.current?.focus();
                      }}
                      className="size-7 rounded-full bg-zinc-50 hover:bg-zinc-100 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer border border-zinc-200 shadow-2xs"
                    >
                      <Plus className="size-4" />
                    </button>

                    {/* Mode Pills */}
                    <div className="flex items-center gap-1">
                      {[
                        { id: "general", label: "Chat" },
                        { id: "code", label: "Code" },
                        { id: "deep", label: "Deep Dive" },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setSelectedMode(mode.id as typeof selectedMode)}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer border-0 ${selectedMode === mode.id
                            ? "bg-[#2b7fff] text-white font-bold shadow-xs"
                            : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 bg-transparent"
                            }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={!inputMessage.trim() || isSending}
                      className="size-8 rounded-full bg-[#2b7fff] disabled:bg-zinc-200 text-white disabled:text-zinc-400 flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed hover:bg-[#2563eb] shadow-xs border-0"
                    >
                      {isSending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <ArrowUp className="size-4 stroke-[2.5]" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
