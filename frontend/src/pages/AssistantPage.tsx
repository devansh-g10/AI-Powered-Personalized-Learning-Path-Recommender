import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  Loader2,
  Code2,
  HelpCircle,
  Trash2,
  Lightbulb,
  Zap,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { messagesApi, conversationsApi } from "@/lib/api";

interface MessageItem {
  id?: string;
  role: "HUMAN" | "AI";
  content: string;
  createdAt?: string;
  topicTag?: string;
  isStreaming?: boolean;
}

const quickPrompts = [
  { label: "Code Example", prompt: "Can you provide a clean, modern TypeScript/React code example demonstrating this concept?", icon: Code2 },
  { label: "Mini Project", prompt: "Suggest a 1-hour practical mini project to practice this topic thoroughly.", icon: Zap },
  { label: "Interview Prep", prompt: "What are the most common technical interview questions asked about this topic?", icon: HelpCircle },
  { label: "Best Practices", prompt: "What are the top architectural best practices and common anti-patterns to avoid?", icon: Lightbulb },
];

export default function AssistantPage() {
  const { id: routeConvId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const topicParam = searchParams.get("topic");

  const [conversationId, setConversationId] = useState<string | null>(routeConvId || null);
  const [activeTopic, setActiveTopic] = useState<string>(topicParam || "Frontend Engineering & Core React");
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      role: "AI",
      content:
        `Hello! I am your PathAI personalized tutor. I am currently tuned to your **${topicParam || "Frontend Engineering"}** learning path.\n\n` +
        "You can ask me to explain difficult concepts, review code architecture, generate mock interview questions, or provide hands-on practice challenges.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // If topicParam changed, update and send contextual welcome prompt
  useEffect(() => {
    if (topicParam && topicParam !== activeTopic) {
      setActiveTopic(topicParam);
      setMessages((prev) => [
        ...prev,
        {
          role: "AI",
          content: `🎯 **Focus Topic:** *${topicParam}*\n\nHow would you like to explore **${topicParam}**? Choose one of the quick prompts below or ask me any question directly!`,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, [topicParam, activeTopic]);

  // Load conversation & messages
  useEffect(() => {
    const initChat = async () => {
      let targetId = conversationId;

      if (!targetId) {
        try {
          const { data } = await conversationsApi.list();
          if (data.conversations && data.conversations.length > 0) {
            targetId = data.conversations[0].id;
            setConversationId(targetId);
          }
        } catch {
          // offline fallback
        }
      }

      if (targetId) {
        const stored = localStorage.getItem(`messages_${targetId}`);
        if (stored) {
          try {
            setMessages(JSON.parse(stored));
            return;
          } catch {
            // fallback
          }
        }

        try {
          setIsLoading(true);
          const { data } = await messagesApi.list(targetId);
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
            localStorage.setItem(`messages_${targetId}`, JSON.stringify(data.messages));
          }
        } catch {
          // use default
        } finally {
          setIsLoading(false);
        }
      }
    };

    initChat();
  }, [conversationId]);

  const saveMessagesLocally = (newMsgs: MessageItem[]) => {
    const targetId = conversationId || "default_chat";
    localStorage.setItem(`messages_${targetId}`, JSON.stringify(newMsgs));
  };

  const handleSendMessage = async (userTextToSend?: string) => {
    const text = (userTextToSend || inputMessage).trim();
    if (!text || isSending) return;

    // ── Demo user guard ──────────────────────────────────────────────────────
    const sessionStr = localStorage.getItem("session");
    const token = sessionStr ? JSON.parse(sessionStr)?.access_token : "";
    const isDemoToken = !token || token.startsWith("demo-") || token.startsWith("token-");
    if (isDemoToken) {
      setMessages((prev) => [
        ...prev,
        { role: "HUMAN", content: text, createdAt: new Date().toISOString() },
        {
          role: "AI",
          content:
            "🔒 **AI Chat requires a real account.**\n\nDemo mode doesn't support live AI responses. Please [sign in](/login) or [register](/register) to unlock the full AI tutor powered by Mistral AI.",
          createdAt: new Date().toISOString(),
        },
      ]);
      setInputMessage("");
      return;
    }

    setInputMessage("");

    const tempUserMsg: MessageItem = {
      role: "HUMAN",
      content: text,
      createdAt: new Date().toISOString(),
      topicTag: activeTopic,
    };

    const updatedWithUser = [...messages, tempUserMsg];
    setMessages(updatedWithUser);
    saveMessagesLocally(updatedWithUser);
    setIsSending(true);

    let targetConvId = conversationId;
    if (!targetConvId || targetConvId.startsWith("conv-")) {
      try {
        const { data: convData } = await conversationsApi.create(`Chat: ${activeTopic}`);
        if (convData?.conversation?.id) {
          targetConvId = convData.conversation.id;
          setConversationId(targetConvId);
        }
      } catch {
        // fallback to offline
      }
    }

    try {
      if (targetConvId && !targetConvId.startsWith("conv-")) {
        const sessionStr = localStorage.getItem("session");
        const token = sessionStr ? JSON.parse(sessionStr)?.access_token : "";
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

        const response = await fetch(`${apiUrl}/ai/conversations/${targetConvId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: text }),
        });

        if (!response.ok) throw new Error("Stream failed");

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder("utf-8");
        let done = false;
        let aiResponseContent = "";
        let lastUpdate = Date.now();

        // Add a placeholder message for the AI
        setMessages((prev) => [
          ...prev,
          { role: "AI", content: "", isStreaming: true },
        ]);

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunkString = decoder.decode(value, { stream: true });
            const lines = chunkString.split("\n\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const dataStr = line.replace("data: ", "");
                try {
                  const data = JSON.parse(dataStr);
                  if (data.type === "chunk") {
                    aiResponseContent += data.content;
                    const now = Date.now();
                    // Throttle updates to ~40ms to prevent React lag
                    if (now - lastUpdate > 40) {
                      setMessages((prev) => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1] = {
                          role: "AI",
                          content: aiResponseContent,
                          isStreaming: true,
                        };
                        return newMessages;
                      });
                      lastUpdate = now;
                    }
                  } else if (data.type === "done") {
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      newMessages[newMessages.length - 1] = {
                        role: "AI",
                        content: aiResponseContent, // Ensure final text is set
                        isStreaming: false,
                      };
                      saveMessagesLocally(newMessages);
                      return newMessages;
                    });
                  }
                } catch {
                  // partial chunk or non-json
                }
              }
            }
          }
        }
        setIsSending(false);
        return;
      }
    } catch (e) {
      console.warn("Message send remote call failed", e);
      const errMsg = (e as { status?: number; message?: string })?.status === 401 ||
        (e as { status?: number; message?: string })?.status === 403
        ? "🔒 **Session expired.** Please [sign in again](/login) to continue chatting."
        : "Sorry, I am currently unable to connect to the backend. Please check that the server is running.";
      setMessages((prev) => [
        ...prev,
        {
          role: "AI",
          content: errMsg,
          createdAt: new Date().toISOString(),
        },
      ]);
      setIsSending(false);
    }
  };

  const handleClearChat = () => {
    if (!window.confirm("Clear current conversation history?")) return;
    const initialMsg: MessageItem = {
      role: "AI",
      content: `Chat cleared. What topic or concept would you like to explore?`,
      createdAt: new Date().toISOString(),
    };
    setMessages([initialMsg]);
    saveMessagesLocally([initialMsg]);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[620px] gap-4">
      {/* Demo user banner */}
      {(() => {
        const sessionStr = localStorage.getItem("session");
        const token = sessionStr ? JSON.parse(sessionStr)?.access_token : "";
        const isDemo = !token || token.startsWith("demo-") || token.startsWith("token-");
        return isDemo ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
            <Lock className="size-4 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-300 flex-1">
              <strong>Demo mode</strong> — AI responses require a real account.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => navigate("/login")}
                className="h-7 text-xs bg-[#2b7fff] text-white hover:bg-[#2563eb] rounded-lg px-3">
                Sign In
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate("/register")}
                className="h-7 text-xs rounded-lg px-3">
                Register
              </Button>
            </div>
          </div>
        ) : null;
      })()}

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-[#2b7fff]/10 text-[#2b7fff] flex items-center justify-center">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg leading-6">PathAI Tutor</h1>
              <Badge className="bg-[#2b7fff]/10 text-[#2b7fff] border-0 text-[10px] px-2 py-0">
                {activeTopic}
              </Badge>
            </div>
            <p className="text-xs text-[#71717b]">
              Grounded in your personalized learning roadmap
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="h-8 text-xs text-zinc-400 dark:text-zinc-500 hover:text-red-600 gap-1.5 rounded-lg"
          >
            <Trash2 className="size-3.5" />
            Clear
          </Button>

          <Badge
            variant="secondary"
            className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1"
          >
            <span className="size-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse inline-block" />
            Online & Ready
          </Badge>
        </div>
      </div>

      {/* Messages Container */}
      <Card className="flex-1 p-6 overflow-y-auto backdrop-blur-xl bg-white/75 border-zinc-200/60 dark:border-zinc-800/60 shadow-xl shadow-[#2b7fff]/5 flex flex-col gap-4">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 text-[#2b7fff] animate-spin" />
            <p className="text-sm text-[#71717b]">Loading conversation...</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === "HUMAN";
            return (
              <div
                key={index}
                className={`flex gap-3 items-start ${
                  isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`size-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-semibold ${
                    isUser
                      ? "bg-[#2b7fff] text-white shadow-md shadow-[#2b7fff]/20"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  {isUser ? <UserIcon className="size-4" /> : <Bot className="size-4 text-[#2b7fff]" />}
                </div>

                {/* Bubble */}
                <div
                  className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? "bg-[#2b7fff] text-white rounded-tr-none shadow-md shadow-[#2b7fff]/15"
                      : "bg-white dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800/70 text-zinc-900 dark:text-zinc-50 rounded-tl-none shadow-sm font-sans"
                  }`}
                >
                  <div className={`break-words`}>
                    {msg.content}
                  </div>
                  {msg.isStreaming && <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-zinc-400 align-middle"></span>}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Card>

      {/* Quick Action Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {quickPrompts.map((qp) => {
          const Icon = qp.icon;
          return (
            <button
              key={qp.label}
              type="button"
              onClick={() => handleSendMessage(qp.prompt)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/90 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-[#2b7fff]/40 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Icon className="size-3 text-[#2b7fff]" />
              {qp.label}
            </button>
          );
        })}
      </div>

      {/* Input Box */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask anything about ${activeTopic} or request coding assistance...`}
          className="flex-1 h-12 px-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 text-sm outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff] shadow-sm transition-all"
        />
        <Button
          type="submit"
          disabled={!inputMessage.trim() || isSending}
          className="h-12 px-5 bg-[#2b7fff] text-white hover:bg-[#2563eb] rounded-xl font-semibold gap-2 shadow-lg shadow-[#2b7fff]/20 cursor-pointer"
        >
          <Send className="size-4" />
          Send
        </Button>
      </form>
    </div>
  );
}
