import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
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
  }, [topicParam]);

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
        const { data } = await messagesApi.send(targetConvId, text);
        const aiMsg: MessageItem = {
          id: data.messageId,
          role: "AI",
          content: data.message,
          createdAt: new Date().toISOString(),
        };
        const updatedWithAi = [...updatedWithUser, aiMsg];
        setMessages(updatedWithAi);
        saveMessagesLocally(updatedWithAi);
        setIsSending(false);
        return;
      }
    } catch (e) {
      console.warn("Message send remote call failed, using intelligent offline tutor", e);
    }

    // Intelligent Offline Tutor response engine
    setTimeout(() => {
      let aiResponseContent = "";
      const lower = text.toLowerCase();

      if (lower.includes("code") || lower.includes("example")) {
        aiResponseContent =
          `Here is a production-ready example for **${activeTopic}**:\n\n` +
          "```tsx\n" +
          "import React, { useState, useEffect, useMemo } from 'react';\n\n" +
          "interface DataItem {\n" +
          "  id: string;\n" +
          "  title: string;\n" +
          "  active: boolean;\n" +
          "}\n\n" +
          "export function TopicMasteryComponent({ topic }: { topic: string }) {\n" +
          "  const [items, setItems] = useState<DataItem[]>([]);\n" +
          "  const [loading, setLoading] = useState(true);\n\n" +
          "  // Memoized filter for performance optimization\n" +
          "  const activeItems = useMemo(() => {\n" +
          "    return items.filter((item) => item.active);\n" +
          "  }, [items]);\n\n" +
          "  return (\n" +
          "    <div className='p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950'>\n" +
          "      <h3 className='font-bold text-lg'>{topic}</h3>\n" +
          "      <p className='text-sm text-zinc-600 dark:text-zinc-400'>Active items: {activeItems.length}</p>\n" +
          "    </div>\n" +
          "  );\n" +
          "}\n" +
          "```\n\n" +
          "**Key Architectural Highlights:**\n" +
          "- Uses `useMemo` to prevent redundant recalculations on renders.\n" +
          "- Fully typed with strict TypeScript interfaces.\n" +
          "- Modular component structure aligned with clean code standards.";
      } else if (lower.includes("project") || lower.includes("mini")) {
        aiResponseContent =
          `🛠️ **Hands-on Capstone Challenge for ${activeTopic}:**\n\n` +
          "**Project Title:** Interactive Metric Tracker with Local Persistence\n\n" +
          "**Requirements:**\n" +
          "1. Build a multi-step checklist where state updates trigger optimistic UI changes.\n" +
          "2. Store user progress in `localStorage` and handle edge cases when storage is full.\n" +
          "3. Add a debounced search filter with real-time feedback.\n\n" +
          "**Expected Learning Outcome:**\n" +
          "Deep mastery of state management, custom hook encapsulation, and DOM performance.";
      } else if (lower.includes("interview") || lower.includes("question")) {
        aiResponseContent =
          `🎯 **Top 3 Interview Questions for ${activeTopic}:**\n\n` +
          "1. **How does the Virtual DOM diffing algorithm work, and why are keys important?**\n" +
          "   *Tip:* Explain heuristic O(n) diffing, fiber reconciliation, and avoiding array index keys.\n\n" +
          "2. **What is the difference between microtasks and macrotasks in the event loop?**\n" +
          "   *Tip:* Mention `Promise.then` vs `setTimeout` execution order.\n\n" +
          "3. **How do you prevent unnecessary re-renders in deep React component trees?**\n" +
          "   *Tip:* Compare `React.memo`, `useCallback`, `useMemo`, and state colocation.";
      } else {
        aiResponseContent =
          `Regarding **"${text}"** in the context of **${activeTopic}**:\n\n` +
          `1. **Core Principle:** In modern full-stack architectures, focus on separation of concerns and clear data flow contracts.\n` +
          `2. **Best Practice:** Keep state as close as possible to where it is used (state colocation), and avoid premature abstraction.\n` +
          `3. **Next Step:** Check off the corresponding milestone on your **Roadmap** and verify the verified competency in the **Skills** tab!`;
      }

      const aiMsg: MessageItem = {
        id: `ai-${Date.now()}`,
        role: "AI",
        content: aiResponseContent,
        createdAt: new Date().toISOString(),
        topicTag: activeTopic,
      };

      const finalMsgs = [...updatedWithUser, aiMsg];
      setMessages(finalMsgs);
      saveMessagesLocally(finalMsgs);
      setIsSending(false);
    }, 700);
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
                  className={`p-4 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? "bg-[#2b7fff] text-white rounded-tr-none shadow-md shadow-[#2b7fff]/15"
                      : "bg-white dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800/70 text-zinc-900 dark:text-zinc-50 rounded-tl-none shadow-sm font-sans"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}

        {isSending && (
          <div className="flex gap-3 items-start">
            <div className="size-8 rounded-xl shrink-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
              <Bot className="size-4 text-[#2b7fff]" />
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800/70 rounded-tl-none shadow-sm flex items-center gap-2 text-xs text-[#71717b]">
              <Loader2 className="size-3.5 text-[#2b7fff] animate-spin" />
              PathAI is formulating response...
            </div>
          </div>
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
