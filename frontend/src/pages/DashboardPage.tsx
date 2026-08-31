import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Sparkles,
  ArrowRight,
  Trash2,
  Calendar,
  Layers,
  Loader2,
  Search,
  Clock,
  Target,
  Flame,
  RefreshCw,
  AlertCircle,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { conversationsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  fetchLiveDashboardData,
  subscribeToProgressUpdates,
  dispatchProgressUpdate,
  type DashboardFullData,
} from "@/lib/learning-data";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ─── Dashboard State ──────────────────────────────────────────────────────────
  const [data, setData] = useState<DashboardFullData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // ─── Search and Status Filters ────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ─── Live Data Fetching & Sync ────────────────────────────────────────────────

  const loadData = useCallback(async (showFullLoader = false) => {
    if (showFullLoader) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const fullData = await fetchLiveDashboardData();
      setData(fullData);
      setErrorMessage(null);
    } catch (err: any) {
      console.error("Dashboard live fetch failed:", err);
      setErrorMessage("Could not sync live learning metrics. Using cached progress.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
    const unsubscribe = subscribeToProgressUpdates(() => {
      loadData(false);
    });
    return () => unsubscribe();
  }, [loadData]);

  // ─── Action Handlers ──────────────────────────────────────────────────────────

  const handleCreateNew = async () => {
    setIsCreating(true);
    try {
      const { data: convData } = await conversationsApi.create("My Learning Path");
      const newId = convData?.conversation?.id;
      if (newId) {
        navigate(`/conversations/${newId}/questionnaire`);
      } else {
        navigate("/questionnaire");
      }
    } catch {
      navigate("/questionnaire");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePath = async (e: React.MouseEvent, pathId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this learning path?")) return;

    try {
      if (!pathId.startsWith("conv-") && !pathId.startsWith("course-") && !pathId.startsWith("fe-") && !pathId.startsWith("ai-") && !pathId.startsWith("devops-")) {
        await conversationsApi.delete(pathId);
      }
    } catch (err) {
      console.warn("Remote delete failed, clearing local record:", err);
    }

    const storedLocal = localStorage.getItem("local_conversations");
    if (storedLocal) {
      const list = JSON.parse(storedLocal);
      const filtered = list.filter((c: any) => c.id !== pathId);
      localStorage.setItem("local_conversations", JSON.stringify(filtered));
    }
    localStorage.removeItem(`roadmap_${pathId}`);
    localStorage.removeItem(`completed_topics_${pathId}`);
    localStorage.removeItem(`context_${pathId}`);

    dispatchProgressUpdate({ action: "learning_path_deleted", pathId });
    loadData(false);
  };

  // Filtered learning paths
  const filteredPaths = useMemo(() => {
    if (!data?.learningPaths) return [];
    return data.learningPaths.filter((p) => {
      const matchesSearch =
        debouncedSearch.trim() === "" ||
        p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (p.learningContext?.learningGoal &&
          p.learningContext.learningGoal.toLowerCase().includes(debouncedSearch.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "ACTIVE"
            ? p.status === "ACTIVE"
            : p.status === "COMPLETED";

      return matchesSearch && matchesStatus;
    });
  }, [data?.learningPaths, debouncedSearch, statusFilter]);

  // Live calculated summary across all active paths
  const liveStatsSummary = useMemo(() => {
    if (!data) return null;
    const totalPaths = data.stats.totalPaths || 0;
    const activePaths = data.stats.activePaths || 0;
    const completedPaths = data.stats.completedPaths || 0;
    const totalMilestonesCount = data.stats.totalMilestones !== undefined
      ? data.stats.totalMilestones
      : data.learningPaths.reduce((acc, p) => acc + (p.totalTopics || 0), 0);
    const completedMilestones = data.stats.totalCompletedMilestones || 0;
    const completionPercent = totalMilestonesCount > 0
      ? Math.min(100, Math.round((completedMilestones / totalMilestonesCount) * 100))
      : 0;
    const totalHours = data.stats.totalLearningHours || 0;
    const fitPercent = data.stats.fitPercent || 0;
    const avgScore = totalPaths > 0 ? (data.stats.matchScore || "—") : "—";

    return {
      totalPaths,
      activePaths,
      completedPaths,
      totalMilestonesCount,
      completedMilestones,
      completionPercent,
      totalHours,
      fitPercent,
      avgScore,
    };
  }, [data]);

  // Dynamic live streak & velocity metadata
  const streakData = useMemo(() => {
    if (!data?.weeklyActivity) {
      return { streakDays: 0, xpEarned: 0, weekStatus: [], todayMinutes: 0, weekLessons: 0 };
    }

    const weekActivity = data.weeklyActivity;
    let currentStreak = 0;
    
    const todayIndex = weekActivity.findIndex(d => d.isToday);
    
    // Calculate consecutive active days backwards from today
    for (let i = todayIndex; i >= 0; i--) {
      if (weekActivity[i].hours > 0 || weekActivity[i].milestones > 0) {
        currentStreak++;
      } else if (i !== todayIndex) {
        // Break if an earlier day in the week is inactive
        break;
      }
    }
    
    // Calculate total XP based on actual completions and hours
    const xpEarned = (liveStatsSummary?.completedMilestones || 0) * 150 + Math.round((liveStatsSummary?.totalHours || 0) * 100);
    
    const todayData = weekActivity.find(d => d.isToday);
    const todayMinutes = todayData ? Math.round(todayData.hours * 60) : 0;
    
    const weekLessons = weekActivity.reduce((acc, day) => acc + day.milestones, 0);

    return {
      streakDays: currentStreak,
      xpEarned,
      weekStatus: weekActivity,
      todayMinutes,
      weekLessons
    };
  }, [data, liveStatsSummary]);

  const firstName = useMemo(() => {
    if (!user?.fullName) {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.fullName) {
            const first = parsed.fullName.trim().split(/\s+/)[0];
            if (first) return first;
          }
        }
      } catch {
        // ignore
      }
      return "Learner";
    }
    const first = user.fullName.trim().split(/\s+/)[0];
    return first || "Learner";
  }, [user?.fullName]);

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-9 pb-16 w-full">
      {/* ─── Hero Header Bar ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {isRefreshing && (
              <span className="text-[11px] text-zinc-400 flex items-center gap-1 animate-pulse">
                <RefreshCw className="size-3 animate-spin" /> Syncing live progress...
              </span>
            )}
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#2b7fff] tracking-tight">
            Welcome back, {firstName}!
          </h1>
        </div>

        {/* Advanced Glassmorphic Button with Soft Pastel Luminous Glass Theme */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <motion.div
            whileHover={{ scale: 1.025, y: -2 }}
            whileTap={{ scale: 0.975 }}
            className="w-full sm:w-auto"
          >
            <button
              onClick={handleCreateNew}
              disabled={isCreating}
              className="relative group overflow-hidden w-full sm:w-auto px-6 h-12 rounded-2xl bg-gradient-to-r from-indigo-50/95 via-sky-50/90 to-purple-50/95 backdrop-blur-2xl border border-indigo-200/90 shadow-[0_6px_24px_rgba(99,102,241,0.12),inset_0_1.5px_1.5px_0_rgba(255,255,255,1),inset_0_-1px_2px_0_rgba(99,102,241,0.06)] hover:shadow-[0_12px_36px_rgba(99,102,241,0.22)] hover:border-indigo-400/90 hover:from-indigo-100/95 hover:via-sky-100/90 hover:to-purple-100/95 text-indigo-950 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
            >
              {/* Glass Inner Light Sweep / Shimmer Beam */}
              <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 transition-transform bg-gradient-to-r from-transparent via-white/90 to-transparent ease-in-out" />

              {/* Ambient soft iridescent refraction border glow on hover */}
              <div className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-sky-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 blur-xs transition-opacity duration-300" />

              {isCreating ? (
                <Loader2 className="size-4 animate-spin text-indigo-700 relative z-10" />
              ) : (
                <>
                  <div className="size-6 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 text-white flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:rotate-90 relative z-10">
                    <Plus className="size-3.5 stroke-[2.5]" />
                  </div>
                  <span className="relative z-10 tracking-tight text-indigo-950 font-extrabold text-sm">
                    New Learning Path
                  </span>
                  <ArrowRight className="size-4 text-indigo-500 group-hover:text-indigo-800 group-hover:translate-x-0.5 transition-all relative z-10" />
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>

      {/* ─── Error State Banner ───────────────────────────────────────────── */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 text-red-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData()}
            className="h-7 text-xs border-red-300 text-red-800 hover:bg-red-100"
          >
            Retry
          </Button>
        </div>
      )}

      {/* ─── Stats Summary Cards Grid (Soft Pastel Glass Theme + Enhanced Motion) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {isLoading || !data || !liveStatsSummary ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs animate-pulse h-36" />
          ))
        ) : (
          <>
            {/* Card 1: Total Learning Paths */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              whileHover={{ y: -5, scale: 1.015, transition: { duration: 0.2 } }}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-blue-50/90 via-white/85 to-sky-50/70 backdrop-blur-xl border border-blue-200/80 shadow-[0_4px_20px_-4px_rgba(43,127,255,0.1)] hover:shadow-[0_12px_32px_-4px_rgba(43,127,255,0.22)] hover:border-blue-400 transition-all duration-300 flex flex-col justify-between h-full min-h-[152px]">
                <div className="pointer-events-none absolute -top-10 -right-10 size-28 bg-blue-200/50 rounded-full blur-2xl group-hover:bg-blue-300/60 transition-all duration-500" />

                <div className="flex items-center justify-between gap-3 relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100/80 text-[#2b7fff] border border-blue-200">
                    <Sparkles className="size-3 text-[#2b7fff]" />
                    Roadmaps
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#2b7fff] text-white shadow-xs shadow-blue-500/30">
                    <span className="size-1.5 rounded-full bg-white animate-pulse" />
                    {liveStatsSummary.activePaths} Active
                  </span>
                </div>

                <div className="flex flex-col mt-3 relative z-10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-zinc-950">
                      {liveStatsSummary.totalPaths}
                    </span>
                    <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Paths</span>
                  </div>
                  <span className="text-xs text-zinc-600 font-medium mt-0.5">
                    {liveStatsSummary.totalPaths > 0 ? "Total Learning Paths" : "No active learning paths"}
                  </span>

                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 font-medium pt-2.5 border-t border-blue-100/80">
                    <span className="text-[#2b7fff] font-bold">{liveStatsSummary.activePaths} in progress</span>
                    <span className="text-zinc-500 font-medium">{liveStatsSummary.completedPaths} completed</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Completed Milestones */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              whileHover={{ y: -5, scale: 1.015, transition: { duration: 0.2 } }}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-emerald-50/90 via-white/85 to-teal-50/70 backdrop-blur-xl border border-emerald-200/80 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.1)] hover:shadow-[0_12px_32px_-4px_rgba(16,185,129,0.22)] hover:border-emerald-400 transition-all duration-300 flex flex-col justify-between h-full min-h-[152px]">
                <div className="pointer-events-none absolute -top-10 -right-10 size-28 bg-emerald-200/50 rounded-full blur-2xl group-hover:bg-emerald-300/60 transition-all duration-500" />

                <div className="flex items-center justify-between gap-3 relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                    <Target className="size-3 text-emerald-700" />
                    Milestones
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-xs shadow-emerald-500/30">
                    {liveStatsSummary.completionPercent}% Done
                  </span>
                </div>

                <div className="flex flex-col mt-3 relative z-10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-zinc-950">
                      {liveStatsSummary.completedMilestones}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">/ {liveStatsSummary.totalMilestonesCount} total</span>
                  </div>
                  <span className="text-xs text-zinc-600 font-medium mt-0.5">
                    {liveStatsSummary.totalMilestonesCount > 0 ? "Completed Milestones" : "Start your first path"}
                  </span>

                  {/* Smooth Animated Progress Bar */}
                  <div className="mt-3 pt-2.5 border-t border-emerald-100/80">
                    <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${liveStatsSummary.totalMilestonesCount > 0 ? Math.max(5, liveStatsSummary.completionPercent) : 0}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Deliberate Study Time */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              whileHover={{ y: -5, scale: 1.015, transition: { duration: 0.2 } }}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-purple-50/90 via-white/85 to-fuchsia-50/70 backdrop-blur-xl border border-purple-200/80 shadow-[0_4px_20px_-4px_rgba(147,51,234,0.1)] hover:shadow-[0_12px_32px_-4px_rgba(147,51,234,0.22)] hover:border-purple-400 transition-all duration-300 flex flex-col justify-between h-full min-h-[152px]">
                <div className="pointer-events-none absolute -top-10 -right-10 size-28 bg-purple-200/50 rounded-full blur-2xl group-hover:bg-purple-300/60 transition-all duration-500" />

                <div className="flex items-center justify-between gap-3 relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100/80 text-purple-800 border border-purple-200">
                    <Clock className="size-3 text-purple-700" />
                    Practice Time
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-600 text-white shadow-xs shadow-purple-500/30">
                    {liveStatsSummary.totalHours > 0 ? (
                      <>
                        <Flame className="size-3 fill-white" />
                        Live Logged
                      </>
                    ) : (
                      "0 hrs"
                    )}
                  </span>
                </div>

                <div className="flex flex-col mt-3 relative z-10">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-zinc-950">
                      {liveStatsSummary.totalHours}
                    </span>
                    <span className="text-sm font-bold text-purple-600">hrs</span>
                  </div>
                  <span className="text-xs text-zinc-600 font-medium mt-0.5">
                    {liveStatsSummary.totalHours > 0 ? "Deliberate Study Time" : "0 mins logged"}
                  </span>

                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 font-medium pt-2.5 border-t border-purple-100/80">
                    <span className="text-purple-600 font-bold">
                      {liveStatsSummary.totalHours > 0 ? `~${Math.round(liveStatsSummary.totalHours * 60)} mins practice` : "Start your first path"}
                    </span>
                    <span className="text-zinc-500 font-medium">Auto-synced</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 4: Daily Learning Streak & XP Velocity (Replaces Study Calendar) */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              whileHover={{ y: -5, scale: 1.015, transition: { duration: 0.3, ease: "easeOut" } }}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-orange-50/80 via-white to-amber-50/40 backdrop-blur-xl border border-orange-100/60 shadow-sm hover:shadow-[0_8px_30px_rgb(249,115,22,0.08)] hover:border-orange-200/80 transition-all duration-500 flex flex-col justify-between h-full min-h-[152px]">
                {/* Subtle animated background ambient glows */}
                <div className="pointer-events-none absolute -top-12 -right-12 size-36 bg-gradient-to-br from-orange-200/50 to-amber-200/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 ease-out" />
                <div className="pointer-events-none absolute -bottom-10 -left-10 size-28 bg-gradient-to-tr from-rose-100/40 to-orange-100/40 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-1000 ease-in-out" />

                <div className="flex items-center justify-between gap-3 relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100/60 text-orange-800 border border-orange-200/50 shadow-sm shadow-orange-500/5">
                    <Flame className={`size-3 transition-colors duration-300 ${streakData.streakDays > 0 ? "text-orange-500 fill-orange-500 animate-pulse" : "text-orange-300"}`} />
                    Daily Streak
                  </span>
                </div>

                <div className="flex flex-col mt-2.5 relative z-10">
                  <div className="flex items-baseline justify-between gap-1.5">
                    <div className="flex items-baseline gap-1.5">
                      <motion.span
                        key={streakData.streakDays}
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-zinc-900 drop-shadow-sm"
                      >
                        {streakData.streakDays}
                      </motion.span>
                      <span className="text-xs text-orange-800/80 font-bold uppercase tracking-wider">Days</span>
                    </div>
                    {streakData.xpEarned > 0 && (
                      <motion.span 
                        key={streakData.xpEarned}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-xs font-bold text-amber-600 px-2.5 py-1 rounded-xl bg-amber-50/80 border border-amber-200/60 flex items-center gap-1"
                      >
                        <Trophy className="size-3 text-amber-500" />
                        +{streakData.xpEarned} XP
                      </motion.span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500 font-medium mt-0.5">
                    Activity & Progress
                  </span>

                  {/* 7-Day Interactive Streak Tokens */}
                  <div className="grid grid-cols-7 gap-1 mt-2.5 pt-2 border-t border-zinc-100 text-center">
                    {streakData.weekStatus.map((item, idx) => {
                      const isActive = item.hours > 0 || item.milestones > 0;
                      return (
                      <div
                        key={idx}
                        title={`${item.dayName}: ${isActive ? `${item.milestones} lessons, ${Math.round(item.hours * 60)} mins` : "No activity"}`}
                        className={`group/day flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-default ${
                          item.isToday
                            ? isActive 
                              ? "bg-orange-50 text-orange-700 border border-orange-200 shadow-sm"
                              : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                            : isActive
                            ? "bg-orange-50/50 text-orange-600 hover:bg-orange-100"
                            : "text-zinc-400 hover:bg-zinc-50"
                        }`}
                      >
                        <span className="text-[9px] opacity-75 uppercase leading-tight mb-0.5">{item.dayName.substring(0, 1)}</span>
                        {isActive ? (
                          <Flame className={`size-3.5 text-orange-500 ${item.isToday ? "animate-pulse" : "group-hover/day:scale-110 transition-transform"}`} />
                        ) : (
                          <div className="size-3.5 rounded-full bg-zinc-200/60 my-0.5 group-hover/day:bg-zinc-300 transition-colors" />
                        )}
                      </div>
                    )})}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500 font-medium pt-2 border-t border-zinc-100">
                    <span className="text-zinc-600 font-medium flex items-center gap-1.5">
                      <Clock className="size-3 text-zinc-400" /> {streakData.todayMinutes} min today
                    </span>
                    <span className="text-zinc-600 font-medium flex items-center gap-1.5">
                      <Target className="size-3 text-zinc-400" /> {streakData.weekLessons} lessons
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* ─── Prominent "Continue Learning" Section ────────────────────────── */}
      {data?.continueLearning && (
        <Card className="glass-card relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-[#2b7fff]/30 bg-gradient-to-br from-white/95 via-[#2b7fff]/5 to-blue-50/20 shadow-md">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex flex-col gap-3 max-w-2xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#2b7fff] text-white">
                  <Flame className="size-3.5 fill-white" /> Continue Learning
                </span>
                <Badge variant="outline" className="text-xs font-semibold bg-white/80 border-zinc-200 text-zinc-700">
                  {data.continueLearning.category}
                </Badge>
                <span className="text-xs text-zinc-500 font-medium">
                  {data.continueLearning.currentPhaseTitle}
                </span>
              </div>

              <div>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-zinc-950 mb-1">
                  {data.continueLearning.title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {data.continueLearning.learningContext?.learningGoal ||
                    data.continueLearning.roadmap?.objective ||
                    "Master production engineering patterns."}
                </p>
              </div>

              {/* Current & Next Milestone Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-white/80 border border-[#2b7fff]/20 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-[#2b7fff] tracking-wider flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-[#2b7fff] animate-ping" /> Current Active Milestone
                  </span>
                  <span className="text-xs font-bold text-zinc-900 line-clamp-1">
                    {data.continueLearning.currentMilestone}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50/80 border border-zinc-200/60 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                    Next in Pipeline
                  </span>
                  <span className="text-xs font-medium text-zinc-700 line-clamp-1">
                    {data.continueLearning.nextMilestone}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Progress & Action CTA */}
            <div className="flex flex-col gap-4 w-full lg:w-72 shrink-0 p-5 rounded-2xl bg-white/90 border border-zinc-200/80 shadow-sm">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-700">Mastery Progress</span>
                <span className="font-bold text-base text-[#2b7fff]">{data.continueLearning.progress}%</span>
              </div>

              <Progress value={data.continueLearning.progress} className="h-2" />

              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>{data.continueLearning.completedTopicsCount} of {data.continueLearning.totalTopics} verified</span>
                <span>~{data.continueLearning.remainingHours}h remaining</span>
              </div>

              <Button
                onClick={() => navigate(`/conversations/${data.continueLearning?.id}/roadmap`)}
                className="w-full bg-[#2b7fff] text-white hover:bg-[#2563eb] rounded-xl h-11 text-xs font-bold gap-2 shadow-md shadow-[#2b7fff]/20 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Resume Learning
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}


      {/* ─── Search, Filter and All Learning Paths ─────────────────────────── */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-2xl text-zinc-950">Your Learning Paths</h2>
            <p className="text-xs text-zinc-600">Select any roadmap to view stages, check milestones, or ask the AI Tutor.</p>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-zinc-100/80 rounded-xl w-full sm:w-auto relative border border-zinc-200/60">
              {(["ALL", "ACTIVE", "COMPLETED"] as const).map((st) => {
                const count =
                  st === "ALL"
                    ? data?.stats.totalPaths || 0
                    : st === "ACTIVE"
                      ? data?.stats.activePaths || 0
                      : data?.stats.completedPaths || 0;

                return (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border-0 cursor-pointer z-10 ${statusFilter === st
                      ? "text-[#2b7fff]"
                      : "text-zinc-600 hover:text-zinc-950 bg-transparent"
                      }`}
                  >
                    {statusFilter === st && (
                      <motion.div
                        layoutId="dashboardFilterPill"
                        className="absolute inset-0 bg-white rounded-lg shadow-sm"
                        style={{ zIndex: -1 }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    {st === "ALL" ? `All Paths (${count})` : st === "ACTIVE" ? `Active (${count})` : `Completed (${count})`}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="size-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search paths or goals..."
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-zinc-200 bg-white text-xs outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Learning Paths Grid / Empty State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6 backdrop-blur-xl bg-white/60 border border-zinc-200/60 shadow-sm animate-pulse h-64 rounded-2xl" />
            ))}
          </div>
        ) : filteredPaths.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-white/40 border-dashed border-2 border-zinc-200 rounded-3xl">
            <div className="size-16 rounded-2xl bg-[#2b7fff]/10 text-[#2b7fff] flex items-center justify-center">
              <Layers className="size-8" />
            </div>
            <div className="max-w-md">
              <h3 className="font-display font-bold text-lg text-zinc-950 mb-1">
                {searchQuery || statusFilter !== "ALL" ? "No matching learning paths" : "No learning paths found"}
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {searchQuery || statusFilter !== "ALL"
                  ? "Try resetting your search query or selecting 'All Paths'."
                  : "Launch the AI profiler to craft your first personalized technical learning path."}
              </p>
            </div>
            {searchQuery || statusFilter !== "ALL" ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                }}
                className="rounded-xl text-xs font-semibold"
              >
                Clear Search & Filters
              </Button>
            ) : (
              <Button
                onClick={handleCreateNew}
                className="bg-[#2b7fff] text-white hover:bg-[#2563eb] gap-2 rounded-xl text-xs font-semibold px-5 h-10 shadow-sm shadow-[#2b7fff]/25 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="size-4" />
                Start Learning Path
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredPaths.map((conv) => (
                <motion.div
                  key={conv.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.25 }}
                >
                  <Card
                    onClick={() => navigate(`/conversations/${conv.id}/roadmap`)}
                    className="group relative cursor-pointer glass-card glass-card-hover rounded-3xl p-6 border border-zinc-200/80 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between gap-5 h-full bg-white/95"
                  >
                    <CardHeader className="p-0 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <Badge
                          variant="outline"
                          className="bg-indigo-50/80 text-[10px] uppercase font-bold text-indigo-700 border-indigo-200/80 px-2.5 py-0.5 rounded-full"
                        >
                          {conv.category || "General"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-zinc-400 hover:text-red-500 rounded-lg -mr-1 -mt-1 cursor-pointer transition-colors"
                          onClick={(e) => handleDeletePath(e, conv.id)}
                          title="Remove learning path"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>

                      <CardTitle className="text-base group-hover:text-[#2b7fff] transition-colors line-clamp-1 font-display font-bold text-zinc-950">
                        {conv.title}
                      </CardTitle>

                      <CardDescription className="line-clamp-2 text-xs leading-relaxed text-zinc-600">
                        {conv.learningContext?.learningGoal ||
                          conv.roadmap?.objective ||
                          "Personalized path powered by PathAI"}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-0 flex flex-col gap-3">
                      {/* Active Milestone Indicator */}
                      <div className="p-3 rounded-2xl bg-zinc-50/80 border border-zinc-100 flex flex-col gap-1 text-left">
                        <span className="text-[10px] font-bold uppercase text-[#2b7fff] tracking-wider flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-[#2b7fff] animate-pulse" /> Current Focus
                        </span>
                        <span className="text-xs font-semibold text-zinc-800 line-clamp-1">
                          {conv.currentMilestone}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500 font-medium">Mastery Progress</span>
                          <span className="font-bold text-[#2b7fff]">{conv.progress}%</span>
                        </div>
                        <Progress value={conv.progress} className="h-2 rounded-full" />
                      </div>

                      {/* Meta Tags */}
                      <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                        <span className="capitalize px-2.5 py-1 rounded-lg bg-zinc-100 font-semibold text-zinc-700 text-[11px]">
                          {conv.learningContext?.currentLevel || "Intermediate"}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-500">
                          <Calendar className="size-3.5" />
                          {new Date(conv.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </CardContent>

                    <CardFooter className="p-0 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-[#2b7fff]">
                      <span>Open Interactive Roadmap</span>
                      <ArrowRight className="size-4 group-hover:translate-x-1.5 transition-transform" />
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
