import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Terminal,
  Route,
  Trash2,
  ExternalLink,
  ChevronDown,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LearningPathItem } from "@/lib/learning-data";

interface TutorContextHeaderProps {
  activePath: LearningPathItem | null;
  allPaths: LearningPathItem[];
  currentMilestone: string;
  onSelectPath: (path: LearningPathItem) => void;
  onClearChat: () => void;
  onToggleHistory: () => void;
  historyOpen: boolean;
}

export default function TutorContextHeader({
  activePath,
  allPaths,
  currentMilestone,
  onSelectPath,
  onClearChat,
  onToggleHistory,
  historyOpen,
}: TutorContextHeaderProps) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const milestoneTitle = currentMilestone || activePath?.currentMilestone || "Engineering Core";
  const progressVal = activePath?.progress ?? 0;

  return (
    <div className="flex flex-col gap-2.5 p-3 sm:p-3.5 rounded-xl border border-zinc-200/90 bg-white shadow-2xs">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Identity & Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center shrink-0">
            <Terminal className="size-3.5" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-zinc-900 tracking-tight">PathAI Tutor</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Grounded in Roadmap
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 truncate hidden sm:inline">
              Context-aware engineering mentor
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleHistory}
            className={`h-7 px-2.5 text-xs gap-1.5 rounded-lg border-zinc-200 cursor-pointer font-medium ${
              historyOpen ? "bg-zinc-100 text-zinc-900 border-zinc-300" : "text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            <History className="size-3.5 text-zinc-500" />
            <span className="hidden sm:inline">Sessions</span>
          </Button>

          {activePath && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/conversations/${activePath.id}/roadmap`)}
              className="h-7 px-2.5 text-xs gap-1.5 rounded-lg border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 cursor-pointer font-medium"
            >
              <Route className="size-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Roadmap</span>
              <ExternalLink className="size-3 text-zinc-400" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearChat}
            className="h-7 px-2 text-zinc-400 hover:text-red-600 rounded-lg cursor-pointer"
            title="Clear Chat"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Integrated Milestone & Path Context Bar */}
      {activePath && (
        <div className="pt-2 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          {/* Path Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 font-medium text-xs transition-colors cursor-pointer"
            >
              <span className="text-zinc-500 text-[11px] font-normal">Path:</span>
              <span className="font-semibold text-zinc-900 truncate max-w-[160px] sm:max-w-[220px]">
                {activePath.title}
              </span>
              <ChevronDown className="size-3 text-zinc-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 mt-1 w-64 rounded-lg bg-white shadow-lg border border-zinc-200 p-1.5 z-50 flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 px-2 py-1">
                  Active Learning Paths
                </span>
                {allPaths.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelectPath(p);
                      setDropdownOpen(false);
                    }}
                    className={`px-2.5 py-1.5 rounded-md text-left text-xs flex items-center justify-between transition-colors border-0 cursor-pointer ${
                      p.id === activePath.id
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "hover:bg-zinc-50 text-zinc-700 bg-transparent"
                    }`}
                  >
                    <span className="truncate">{p.title}</span>
                    <span className="text-[11px] text-zinc-400 font-mono ml-2 shrink-0">{p.progress}%</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Compact Milestone Status & Thin Progress Bar */}
          <div className="flex items-center gap-3 text-zinc-600 sm:justify-end">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-zinc-400 text-[11px]">Current milestone:</span>
              <span className="font-semibold text-zinc-900 truncate max-w-[200px] sm:max-w-[260px]">
                {milestoneTitle}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-mono text-[11px] font-medium text-zinc-500">{progressVal}%</span>
              <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressVal}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

