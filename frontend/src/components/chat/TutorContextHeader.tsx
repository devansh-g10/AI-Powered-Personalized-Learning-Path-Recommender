import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Route,
  Trash2,
  ExternalLink,
  ChevronDown,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-2xl glass-card border border-zinc-200/80 shadow-sm bg-white/90">
      {/* Top Row: Title, Grounded Status, and Action Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-[#2b7fff] text-white flex items-center justify-center shadow-md shadow-[#2b7fff]/25 shrink-0">
            <Sparkles className="size-5" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-bold text-lg sm:text-xl text-zinc-950">PathAI Tutor</h1>
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] px-2 py-0 font-semibold flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Grounded in Roadmap
              </Badge>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-500">
              Context-aware engineering mentor calibrated to your verified milestones
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleHistory}
            className={`h-8 text-xs gap-1.5 rounded-xl border-zinc-200 cursor-pointer ${
              historyOpen ? "bg-[#2b7fff]/10 border-[#2b7fff]/30 text-[#2b7fff]" : "text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            <History className="size-3.5" />
            <span className="hidden sm:inline">Sessions</span>
          </Button>

          {activePath && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/conversations/${activePath.id}/roadmap`)}
              className="h-8 text-xs gap-1.5 rounded-xl border-zinc-200 text-zinc-700 hover:text-[#2b7fff] hover:border-[#2b7fff]/30 cursor-pointer"
            >
              <Route className="size-3.5 text-[#2b7fff]" />
              <span className="hidden sm:inline">Roadmap</span>
              <ExternalLink className="size-3" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearChat}
            className="h-8 text-xs text-zinc-400 hover:text-red-600 gap-1 rounded-xl cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Bottom Row: Active Learning Path Info & Progress Bar */}
      {activePath && (
        <div className="pt-3 border-t border-zinc-200/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs">
          {/* Path Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-zinc-100/80 hover:bg-zinc-200/70 border border-zinc-200 text-zinc-900 font-semibold cursor-pointer text-xs transition-colors"
            >
              <Badge variant="outline" className="bg-white text-[10px] font-bold text-[#2b7fff] border-zinc-200">
                {activePath.category}
              </Badge>
              <span className="font-bold line-clamp-1 max-w-[200px] sm:max-w-[280px]">{activePath.title}</span>
              <ChevronDown className="size-3.5 text-zinc-500" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-72 rounded-2xl bg-white shadow-xl border border-zinc-200 p-2 z-50 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 px-2 py-1">
                  Switch Active Learning Path
                </span>
                {allPaths.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPath(p);
                      setDropdownOpen(false);
                    }}
                    className={`p-2.5 rounded-xl text-left text-xs flex items-center justify-between transition-colors border-0 cursor-pointer ${
                      p.id === activePath.id
                        ? "bg-[#2b7fff]/10 text-[#2b7fff] font-bold"
                        : "hover:bg-zinc-100 text-zinc-700 bg-transparent font-medium"
                    }`}
                  >
                    <span className="line-clamp-1">{p.title}</span>
                    <span className="text-[11px] font-semibold text-zinc-500">{p.progress}%</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current Milestone & Progress Bar */}
          <div className="flex items-center gap-4 w-full md:w-auto flex-wrap md:flex-nowrap justify-between md:justify-end">
            <div className="flex items-center gap-1.5 text-zinc-700">
              <span className="text-zinc-500">Milestone:</span>
              <span className="font-bold text-zinc-950 line-clamp-1 max-w-[240px]">
                {currentMilestone || activePath.currentMilestone}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="font-bold text-[#2b7fff] text-xs">{activePath.progress}%</span>
              <Progress value={activePath.progress} className="w-24 h-2" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
