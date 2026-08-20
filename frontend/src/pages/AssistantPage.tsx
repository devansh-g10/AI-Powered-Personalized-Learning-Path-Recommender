import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  Loader2,
  Code2,
  HelpCircle,
  Zap,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Compass,
  Route,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { messagesApi } from "@/lib/api";
import {
  fetchLiveDashboardData,
  dispatchProgressUpdate,
  type LearningPathItem,
  type SkillCompetency,
} from "@/lib/learning-data";
import MarkdownRenderer from "@/components/chat/MarkdownRenderer";
import TutorContextHeader from "@/components/chat/TutorContextHeader";
import TutorSessionsSidebar, { type ChatSession } from "@/components/chat/TutorSessionsSidebar";
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
  const [activeTopic, setActiveTopic] = useState<string>(topicParam || "React 19 Hooks & State Architecture");

  // ─── Chat & Sessions State ────────────────────────────────────────────────────
  const [conversationId, setConversationId] = useState<string>(routeConvId || "session-default");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "init-1",
      role: "AI",
      content:
        `### 👋 Welcome to PathAI Tutor\n\n` +
        `I am your personalized AI engineering mentor. I am tuned to your **${topicParam || "React 19 & Full-Stack"}** learning journey.\n\n` +
        `- Ask me to break down architectural patterns & mental models\n` +
        `- Request production-ready TypeScript code blueprints\n` +
        `- Practice with hands-on coding challenges and mock technical interviews\n` +
        `- Ask **"What should I learn next?"** to diagnose your skill gaps!`,
      createdAt: new Date().toISOString(),
      topicTag: activeTopic,
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, scrollToBottom]);

  // ─── 1. Load Live Context from Learning Engine ───────────────────────────────
  useEffect(() => {
    const loadContext = async () => {
      try {
        const fullData = await fetchLiveDashboardData();
        setAllPaths(fullData.learningPaths);
        setSkillCompetencies(fullData.skillCompetencies);

        // Find matching or default active path
        let current = fullData.learningPaths[0] || null;
        if (routeConvId) {
          const match = fullData.learningPaths.find((p) => p.id === routeConvId);
          if (match) current = match;
        } else if (fullData.continueLearning) {
          current = fullData.continueLearning;
        }

        if (current) {
          setActivePath(current);
          if (topicParam) {
            setActiveTopic(topicParam);
          } else if (current.currentMilestone) {
            setActiveTopic(current.currentMilestone);
          }
        }
      } catch (err) {
        console.error("Failed to load learning context for tutor:", err);
      }
    };

    loadContext();
  }, [routeConvId, topicParam]);

  // ─── 2. Load Sessions List ───────────────────────────────────────────────────
  useEffect(() => {
    const savedSessions = localStorage.getItem("pathai_chat_sessions");
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch {
        setSessions([]);
      }
    } else {
      const defaultSessions: ChatSession[] = [
        {
          id: "session-fe",
          title: "React 19 Hooks & Concurrency",
          topicTag: "Frontend",
          lastMessage: "Clean code blueprint for memoized state architecture.",
          updatedAt: new Date().toISOString(),
          pathId: "fe-roadmap-01",
        },
        {
          id: "session-ai",
          title: "LangChain Agents & Function Calling",
          topicTag: "AI & LLM",
          lastMessage: "Vector embeddings and hybrid similarity search pipeline.",
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          pathId: "ai-roadmap-02",
        },
      ];
      setSessions(defaultSessions);
      localStorage.setItem("pathai_chat_sessions", JSON.stringify(defaultSessions));
    }
  }, []);

  // ─── 3. Load Messages for Active Conversation ────────────────────────────────
  useEffect(() => {
    const loadMessagesForSession = async () => {
      const activeId = conversationId || "session-default";
      const stored = localStorage.getItem(`messages_${activeId}`);
      if (stored) {
        try {
          setMessages(JSON.parse(stored));
          return;
        } catch {
          // fallback
        }
      }

      // Try API if it's a remote conversation
      if (activeId && !activeId.startsWith("session-") && !activeId.startsWith("conv-")) {
        try {
          setIsLoading(true);
          const { data } = await messagesApi.list(activeId);
          if (data?.messages && data.messages.length > 0) {
            setMessages(data.messages);
            localStorage.setItem(`messages_${activeId}`, JSON.stringify(data.messages));
          }
        } catch {
          // offline
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadMessagesForSession();
  }, [conversationId]);

  // Save messages to local storage & update session preview
  const persistMessages = (newMsgs: MessageItem[], targetId = conversationId) => {
    localStorage.setItem(`messages_${targetId}`, JSON.stringify(newMsgs));

    // Update session snippet in list
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

  // ─── 4. Dynamic Contextual Action Chips ───────────────────────────────────────
  const contextualActionChips = [
    {
      label: `Explain ${activeTopic.length > 25 ? activeTopic.slice(0, 22) + "..." : activeTopic}`,
      prompt: `Please explain the core mental model, architectural principle, and production best practices for "${activeTopic}". Include a clean TypeScript example.`,
      icon: Sparkles,
    },
    {
      label: "Practice Challenge",
      prompt: `Give me a hands-on 1-hour coding challenge to practice "${activeTopic}". Include starter code and test criteria.`,
      icon: Zap,
    },
    {
      label: "Mock Interview",
      prompt: `Ask me a realistic senior technical interview question about "${activeTopic}".`,
      icon: HelpCircle,
    },
    {
      label: "What should I learn next?",
      prompt: "What should I learn next based on my current roadmap progress and skill gaps?",
      icon: Compass,
    },
    {
      label: "Review My Code",
      prompt: `Here is a component I built for "${activeTopic}". Can you review it for architectural trade-offs, type safety, and performance?`,
      icon: Code2,
    },
  ];

  // ─── 5. Message Sender with Real API & Fallback Mentor Engine ────────────────
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    setInputMessage("");

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

    // Try backend API call first if valid remote conversation
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
      // Use grounded learning-oriented mentor engine
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
      }, 600);
    } else {
      setIsSending(false);
    }
  };

  // ─── 6. Action Handlers on AI Messages ────────────────────────────────────────

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleMarkMilestoneUnderstood = (topicTitle: string) => {
    if (!activePath) return;

    // Check off the topic in local completed topics
    const storageKey = `completed_topics_${activePath.id}`;
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");

    // Find topicId from activePath roadmap
    const allTopics = activePath.roadmap?.phases?.flatMap((p) => p.topics) || [];
    const matched = allTopics.find((t) => t.title.toLowerCase().includes(topicTitle.toLowerCase())) || allTopics[0];

    const topicId = matched?.topicId || `topic-${Date.now()}`;
    if (!existing.includes(topicId)) {
      const updated = [...existing, topicId];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      dispatchProgressUpdate({ action: "mark_understood", pathId: activePath.id, topicId });
    }

    // Add confirmation message
    const confirmMsg: MessageItem = {
      id: `ai-${Date.now()}`,
      role: "AI",
      content: `🎉 **Milestone Verified!**\n\nI have updated your roadmap progress for **${activePath.title}**. You can view your refreshed competency matrix in the **Skills** tab or continue to your next milestone!`,
      createdAt: new Date().toISOString(),
      isVerified: true,
    };
    const updated = [...messages, confirmMsg];
    setMessages(updated);
    persistMessages(updated);
  };

  const handleClearChat = () => {
    if (!window.confirm("Clear conversation history for this session?")) return;
    const initialMsg: MessageItem = {
      id: `init-${Date.now()}`,
      role: "AI",
      content: `### 🔄 Session Cleared\n\nWhat concept or engineering topic would you like to explore for **${activeTopic}**?`,
      createdAt: new Date().toISOString(),
      topicTag: activeTopic,
    };
    setMessages([initialMsg]);
    persistMessages([initialMsg]);
  };

  const handleNewSession = async () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: `${activeTopic} Deep Dive`,
      topicTag: activePath?.category || "Engineering",
      lastMessage: "New mentorship session started.",
      updatedAt: new Date().toISOString(),
      pathId: activePath?.id,
    };

    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    localStorage.setItem("pathai_chat_sessions", JSON.stringify(updatedSessions));

    setConversationId(newId);
    const initialMsg: MessageItem = {
      id: `init-${Date.now()}`,
      role: "AI",
      content: `### 🎯 New Session: ${activeTopic}\n\nI'm ready to assist with code examples, mock interviews, or architectural evaluations. How would you like to start?`,
      createdAt: new Date().toISOString(),
      topicTag: activeTopic,
    };
    setMessages([initialMsg]);
    persistMessages([initialMsg], newId);
    setHistoryOpen(false);
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
    setHistoryOpen(false);
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!window.confirm("Delete this mentorship session?")) return;
    const filtered = sessions.filter((s) => s.id !== sessionId);
    setSessions(filtered);
    localStorage.setItem("pathai_chat_sessions", JSON.stringify(filtered));
    localStorage.removeItem(`messages_${sessionId}`);
    if (conversationId === sessionId) {
      if (filtered.length > 0) {
        handleSelectSession(filtered[0]);
      } else {
        handleNewSession();
      }
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-130px)] min-h-[640px] gap-3.5 relative pb-2">
      {/* ─── 1. Context-Aware Header ────────────────────────────────────────── */}
      <TutorContextHeader
        activePath={activePath}
        allPaths={allPaths}
        currentMilestone={activeTopic}
        onSelectPath={(path) => {
          setActivePath(path);
          setActiveTopic(path.currentMilestone || path.title);
        }}
        onClearChat={handleClearChat}
        onToggleHistory={() => setHistoryOpen(!historyOpen)}
        historyOpen={historyOpen}
      />

      {/* ─── 2. Sessions History Drawer (Collapsible) ────────────────────────── */}
      <AnimatePresence>
        {historyOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-20 bottom-4 z-40"
          >
            <TutorSessionsSidebar
              sessions={sessions}
              activeSessionId={conversationId}
              onSelectSession={handleSelectSession}
              onNewSession={handleNewSession}
              onDeleteSession={handleDeleteSession}
              onClose={() => setHistoryOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 3. Main Chat Container ─────────────────────────────────────────── */}
      <Card className="flex-1 p-4 sm:p-6 overflow-y-auto glass-card border border-zinc-200/80 shadow-lg shadow-[#2b7fff]/5 flex flex-col gap-5 rounded-3xl bg-white/80">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 text-[#2b7fff] animate-spin" />
            <p className="text-xs sm:text-sm text-zinc-500 font-medium">Connecting to your learning context...</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === "HUMAN";
            const msgId = msg.id || `msg-${index}`;

            return (
              <motion.div
                key={msgId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 sm:gap-3.5 items-start ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`size-8 sm:size-9 rounded-2xl shrink-0 flex items-center justify-center text-xs font-semibold ${
                    isUser
                      ? "bg-gradient-to-tr from-[#2563eb] to-[#2b7fff] text-white shadow-md shadow-[#2b7fff]/25"
                      : "bg-white border border-zinc-200/90 text-[#2b7fff] shadow-sm"
                  }`}
                >
                  {isUser ? <UserIcon className="size-4" /> : <Bot className="size-4.5" />}
                </div>

                {/* Message Content Bubble */}
                <div
                  className={`flex flex-col gap-2 max-w-[92%] sm:max-w-[84%] ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`p-4 sm:p-5 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-[#2b7fff] text-white rounded-tr-none shadow-md shadow-[#2b7fff]/15"
                        : "bg-white/95 border border-zinc-200/80 text-zinc-950 rounded-tl-none shadow-sm font-sans"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <MarkdownRenderer content={msg.content} />
                    )}
                  </div>

                  {/* Actions Inside AI Response */}
                  {!isUser && (
                    <div className="flex items-center gap-1.5 flex-wrap pl-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyMessage(msgId, msg.content)}
                        className="h-6 px-2 text-[11px] text-zinc-500 hover:text-zinc-900 rounded-lg gap-1 cursor-pointer"
                      >
                        {copiedMessageId === msgId ? (
                          <>
                            <Check className="size-3 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkMilestoneUnderstood(activeTopic)}
                        className="h-6 px-2 text-[11px] text-emerald-700 hover:bg-emerald-50 rounded-lg gap-1 cursor-pointer font-medium"
                      >
                        <CheckCircle2 className="size-3 text-emerald-600" />
                        <span>Mark Understood</span>
                      </Button>

                      {activePath && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/conversations/${activePath.id}/roadmap`)}
                          className="h-6 px-2 text-[11px] text-[#2b7fff] hover:bg-blue-50 rounded-lg gap-1 cursor-pointer font-medium"
                        >
                          <Route className="size-3" />
                          <span>View in Roadmap</span>
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSendMessage(`Can you give me another example and practice challenge for "${activeTopic}"?`)}
                        className="h-6 px-2 text-[11px] text-zinc-500 hover:text-zinc-900 rounded-lg gap-1 cursor-pointer"
                      >
                        <RefreshCw className="size-3" />
                        <span>Ask Follow-up</span>
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}

        {/* Typing / Formulating Indicator */}
        {isSending && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 items-start"
          >
            <div className="size-8 rounded-2xl shrink-0 bg-white border border-zinc-200 text-[#2b7fff] flex items-center justify-center shadow-sm">
              <Bot className="size-4.5" />
            </div>

            <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 rounded-tl-none shadow-sm flex items-center gap-2.5 text-xs text-zinc-600">
              <span className="flex gap-1 items-center">
                <span className="size-1.5 rounded-full bg-[#2b7fff] animate-bounce" />
                <span className="size-1.5 rounded-full bg-[#2b7fff] animate-bounce [animation-delay:0.2s]" />
                <span className="size-1.5 rounded-full bg-[#2b7fff] animate-bounce [animation-delay:0.4s]" />
              </span>
              <span className="font-medium text-zinc-700">PathAI is formulating learning blueprint...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </Card>

      {/* ─── 4. Contextual Quick Action Chips ──────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 select-none">
        {contextualActionChips.map((chip, idx) => {
          const Icon = chip.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(chip.prompt)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-zinc-200/80 bg-white hover:bg-zinc-50 hover:border-[#2b7fff]/40 text-xs font-semibold text-zinc-700 shadow-sm transition-all cursor-pointer whitespace-nowrap hover:scale-[1.02] active:scale-[0.98]"
            >
              <Icon className="size-3.5 text-[#2b7fff]" />
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* ─── 5. Message Input Form ─────────────────────────────────────────── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-2.5 items-center"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask a question on "${activeTopic}", request code, or type "What should I learn next?"...`}
            className="w-full h-12 pl-4 pr-10 rounded-2xl border border-zinc-200/80 bg-white/95 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff] shadow-sm transition-all text-zinc-950 placeholder:text-zinc-400"
          />
        </div>

        <Button
          type="submit"
          disabled={!inputMessage.trim() || isSending}
          className="h-12 px-6 bg-[#2b7fff] text-white hover:bg-[#2563eb] rounded-2xl font-bold text-xs sm:text-sm gap-2 shadow-lg shadow-[#2b7fff]/25 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          {isSending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Send className="size-4" />
              <span className="hidden sm:inline">Send</span>
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
