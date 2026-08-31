import { Plus, MessageSquare, Trash2, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="w-full sm:w-80 h-full flex flex-col gap-3 p-3.5 bg-white border border-zinc-200/90 rounded-xl shadow-lg z-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-zinc-700" />
          <span className="font-semibold text-xs text-zinc-900">Mentorship Sessions</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="size-6 text-zinc-400 hover:text-zinc-700 rounded-md cursor-pointer"
        >
          <X className="size-3.5" />
        </Button>
      </div>

      {/* New Session Button */}
      <Button
        onClick={onNewSession}
        className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-lg h-8 text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs"
      >
        <Plus className="size-3.5" />
        New Mentorship Session
      </Button>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        <span className="text-[10px] uppercase font-semibold text-zinc-400 px-1 tracking-wider">Recent Sessions</span>

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
                className={`group p-2.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col gap-1 ${
                  isActive
                    ? "bg-blue-50/70 border-blue-200 shadow-2xs"
                    : "bg-white border-zinc-200/70 hover:bg-zinc-50 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className={`font-semibold text-xs truncate ${isActive ? "text-blue-700" : "text-zinc-900"}`}>
                    {sess.title}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => onDeleteSession(e, sess.id)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-600 p-0.5 rounded transition-opacity bg-transparent border-0 cursor-pointer"
                    title="Delete session"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>

                <p className="text-[11px] text-zinc-500 line-clamp-1 leading-normal">
                  {sess.lastMessage || "No messages yet"}
                </p>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-100">
                  <span className="px-1.5 py-0.2 bg-zinc-50 border border-zinc-200/80 rounded text-[10px] font-medium text-zinc-600">
                    {sess.topicTag || "Engineering"}
                  </span>
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

