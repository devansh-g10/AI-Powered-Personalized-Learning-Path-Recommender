import { Plus, MessageSquare, Trash2, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ChatSession {
  id: string;
  title: string;
  topicTag: string;
  lastMessage: string;
  updatedAt: string;
  pathId?: string;
}

interface TutorSessionsSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (session: ChatSession) => void;
  onNewSession: () => void;
  onDeleteSession: (e: React.MouseEvent, sessionId: string) => void;
  onClose: () => void;
}

export default function TutorSessionsSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onClose,
}: TutorSessionsSidebarProps) {
  return (
    <div className="w-full sm:w-80 h-full flex flex-col gap-4 p-4 bg-white/95 backdrop-blur-2xl border border-zinc-200/80 rounded-2xl shadow-xl z-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200/70">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-[#2b7fff]" />
          <span className="font-display font-bold text-sm text-zinc-950">Mentorship Sessions</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="size-7 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* New Session Button */}
      <Button
        onClick={onNewSession}
        className="w-full bg-[#2b7fff] text-white hover:bg-[#2563eb] rounded-xl h-10 text-xs font-semibold gap-2 shadow-sm shadow-[#2b7fff]/20 cursor-pointer"
      >
        <Plus className="size-4" />
        New Mentorship Session
      </Button>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        <span className="text-[10px] uppercase font-bold text-zinc-400 px-1">Recent Sessions</span>

        {sessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-400">
            No previous sessions. Start asking questions to build your mentorship log!
          </div>
        ) : (
          sessions.map((sess) => {
            const isActive = sess.id === activeSessionId;
            return (
              <div
                key={sess.id}
                onClick={() => onSelectSession(sess)}
                className={`group p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-1.5 ${
                  isActive
                    ? "bg-[#2b7fff]/10 border-[#2b7fff]/30 shadow-sm"
                    : "bg-zinc-50/70 border-zinc-200/70 hover:bg-zinc-100 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className={`font-bold text-xs line-clamp-1 ${isActive ? "text-[#2b7fff]" : "text-zinc-900"}`}>
                    {sess.title}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => onDeleteSession(e, sess.id)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 p-0.5 rounded transition-opacity bg-transparent border-0 cursor-pointer"
                    title="Delete session"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>

                <p className="text-[11px] text-zinc-500 line-clamp-1 leading-snug">
                  {sess.lastMessage || "No messages yet"}
                </p>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-200/40">
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-white border-zinc-200 text-zinc-600">
                    {sess.topicTag || "Engineering"}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Clock className="size-2.5" />
                    {new Date(sess.updatedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
