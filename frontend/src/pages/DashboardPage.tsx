import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Route,
  Sparkles,
  ArrowRight,
  Trash2,
  BookOpen,
  Calendar,
  Layers,
  Loader2,
  Search,
  Clock,
  Compass,
  Award,
  TrendingUp,
  Target,
  Flame,
  Brain,
  Code2,
  Server,
  Cpu,
  RefreshCw,
  AlertCircle,
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

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ─── Load Dashboard Data ──────────────────────────────────────────────────────
  const loadData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true);
      else setIsRefreshing(true);
      setErrorMessage(null);

      const fullData = await fetchLiveDashboardData();
      setData(fullData);
    } catch (err: any) {
      console.error("Failed to fetch live dashboard data:", err);
      setErrorMessage("Could not load latest progress. Please check your connection and retry.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load + subscribe to real-time progress updates from anywhere
  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToProgressUpdates(() => {
      loadData(true);
    });
    return () => unsubscribe();
  }, [loadData]);

  // ─── Handlers ─────────────────────────────────────────────────────────────────

  const handleCreateNew = async () => {
    try {
      setIsCreating(true);
      const localId = `conv-${Date.now()}`;
      try {
        const { data: respData } = await conversationsApi.create("New Learning Path");
        if (respData?.conversation?.id) {
          navigate(`/conversations/${respData.conversation.id}/questionnaire`);
          return;
        }
      } catch {
        // offline fallback
      }
      navigate(`/conversations/${localId}/questionnaire`);
    } catch (err) {
      console.error("Failed to create conversation", err);
      navigate(`/conversations/custom-${Date.now()}/questionnaire`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePath = async (e: React.MouseEvent, pathId: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this learning path?")) return;

    // Optimistic UI update
    const previousData = data;
    if (data) {
      const updatedPaths = data.learningPaths.filter((p) => p.id !== pathId);
      setData({
        ...data,
        learningPaths: updatedPaths,
        stats: {
          ...data.stats,
          totalPaths: updatedPaths.length,
          activePaths: updatedPaths.filter((p) => p.status === "ACTIVE").length,
          completedPaths: updatedPaths.filter((p) => p.status === "COMPLETED").length,
        },
      });
    }

    try {
      // Delete from backend if real ID
      if (pathId && !pathId.startsWith("fe-") && !pathId.startsWith("ai-") && !pathId.startsWith("devops-")) {
        await conversationsApi.delete(pathId).catch(() => {});
      }

      // Remove from local storage
      const storedLocal = localStorage.getItem("local_conversations");
      if (storedLocal) {
        const parsed = JSON.parse(storedLocal);
        const filtered = parsed.filter((p: any) => p.id !== pathId);
        localStorage.setItem("local_conversations", JSON.stringify(filtered));
      }
      localStorage.removeItem(`roadmap_${pathId}`);
      localStorage.removeItem(`completed_topics_${pathId}`);
      localStorage.removeItem(`context_${pathId}`);

      dispatchProgressUpdate({ action: "delete_path", pathId });
    } catch (err) {
      console.error("Failed to delete path:", err);
      // Rollback on error
      setData(previousData);
      alert("Could not remove learning path. Please try again.");
    }
  };

  // ─── Filtered Learning Paths ──────────────────────────────────────────────────
  const filteredPaths = useMemo(() => {
    if (!data?.learningPaths) return [];
    return data.learningPaths.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (p.currentMilestone || "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (p.learningContext?.learningGoal || "").toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "ACTIVE"
          ? p.status === "ACTIVE"
          : p.status === "COMPLETED";

      return matchesSearch && matchesStatus;
    });
  }, [data?.learningPaths, debouncedSearch, statusFilter]);

  // Skill category icons helper
  const getSkillIcon = (cat: string) => {
    switch (cat) {
      case "Frontend":
        return <Code2 className="size-4 text-[#2b7fff]" />;
      case "Backend":
        return <Server className="size-4 text-emerald-600" />;
      case "AI & LLM":
        return <Brain className="size-4 text-purple-600" />;
      case "DevOps":
        return <Cpu className="size-4 text-amber-600" />;
      default:
        return <Layers className="size-4 text-cyan-600" />;
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-9 pb-16 w-full">
      {/* ─── Hero Header Bar ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="font-medium rounded-full bg-[#2b7fff]/10 text-[#2b7fff] text-xs leading-4 px-3 py-1 gap-1.5 w-fit"
            >
              <Sparkles className="size-3.5" />
              Live AI Learning Hub
            </Badge>
            {isRefreshing && (
              <span className="text-[11px] text-zinc-400 flex items-center gap-1 animate-pulse">
                <RefreshCw className="size-3 animate-spin" /> Syncing live progress...
              </span>
            )}
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-4xl text-zinc-950 tracking-tight">
            Welcome back, {user?.fullName?.split(" ")[0] || "Learner"}!
          </h1>
          <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed max-w-2xl">
            {data
              ? `You have ${data.stats.totalCompletedMilestones} verified milestones completed across ${data.stats.totalPaths} learning paths with ${data.stats.totalLearningHours} hours of deep practice.`
              : "Synthesize personalized curriculums and track real-time milestone competencies."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            onClick={handleCreateNew}
            disabled={isCreating}
            className="w-full sm:w-auto bg-[#2b7fff] text-white hover:bg-[#2563eb] gap-2 rounded-xl shadow-lg shadow-[#2b7fff]/25 px-5 h-11 text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isCreating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <Plus className="size-4" />
                New Learning Path
              </>
            )}
          </Button>
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

      {/* ─── Stats Summary Cards Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading || !data ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5 backdrop-blur-xl bg-white/60 border border-zinc-200/60 shadow-sm animate-pulse h-24" />
          ))
        ) : (
          <>
            <Card className="glass-card glass-card-hover rounded-2xl p-5 border border-zinc-200/60 shadow-sm flex items-center gap-4 transition-all">
              <div className="size-12 rounded-xl bg-[#2b7fff]/10 text-[#2b7fff] flex items-center justify-center shrink-0">
                <Route className="size-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-display font-bold text-zinc-950">{data.stats.totalPaths}</span>
                <span className="text-xs text-zinc-600 font-medium">Total Learning Paths</span>
                <span className="text-[11px] text-[#2b7fff] font-semibold mt-0.5">
                  {data.stats.activePaths} Active • {data.stats.completedPaths} Completed
                </span>
              </div>
            </Card>

            <Card className="glass-card glass-card-hover rounded-2xl p-5 border border-zinc-200/60 shadow-sm flex items-center gap-4 transition-all">
              <div className="size-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <BookOpen className="size-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-display font-bold text-zinc-950">{data.stats.totalCompletedMilestones}</span>
                <span className="text-xs text-zinc-600 font-medium">Completed Milestones</span>
                <span className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  Verified in live roadmap
                </span>
              </div>
            </Card>

            <Card className="glass-card glass-card-hover rounded-2xl p-5 border border-zinc-200/60 shadow-sm flex items-center gap-4 transition-all">
              <div className="size-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Clock className="size-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-display font-bold text-zinc-950">{data.stats.totalLearningHours} hrs</span>
                <span className="text-xs text-zinc-600 font-medium">Learning Time Spent</span>
                <span className="text-[11px] text-purple-600 font-semibold mt-0.5">
                  Estimated deliberate practice
                </span>
              </div>
            </Card>

            <Card className="glass-card glass-card-hover rounded-2xl p-5 border border-zinc-200/60 shadow-sm flex items-center gap-4 transition-all">
              <div className="size-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Compass className="size-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-display font-bold text-zinc-950">{data.stats.matchScore}</span>
                <span className="text-xs text-zinc-600 font-medium">Curriculum Match Score</span>
                <span className="text-[11px] text-amber-600 font-semibold mt-0.5">
                  Calibrated to your goals
                </span>
              </div>
            </Card>
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

      {/* ─── 2-Column: AI Insight & Weekly Learning Activity ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): PathAI Insight Card */}
        <div className="lg:col-span-7">
          <Card className="glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between gap-6 border border-zinc-200/70 shadow-sm h-full">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-[#2b7fff]/10 text-[#2b7fff] flex items-center justify-center">
                    <Sparkles className="size-4" />
                  </div>
                  <span className="font-display font-bold text-lg text-zinc-950">PathAI Diagnostic Insight</span>
                </div>

                <Badge className="bg-[#2b7fff]/10 text-[#2b7fff] border-0 text-xs px-2.5 py-0.5 font-semibold">
                  {data?.aiInsight.badgeText || "Live Analysis"}
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                {data?.aiInsight.summary ||
                  "Analyzing your verified milestones and pacing against industry engineering benchmarks..."}
              </p>

              {/* Dynamic Strength & Gap Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 flex items-center gap-1">
                    <TrendingUp className="size-3" /> Strongest Area
                  </span>
                  <span className="text-xs font-bold text-emerald-950">
                    {data?.aiInsight.strongestArea || "Frontend Architecture"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-blue-700 flex items-center gap-1">
                    <Target className="size-3" /> Largest Skill Gap
                  </span>
                  <span className="text-xs font-bold text-blue-950">
                    {data?.aiInsight.largestSkillGap || "System Design & Caching"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <span className="text-zinc-600 font-medium">
                💡 <span className="font-semibold text-zinc-800">Recommendation:</span> {data?.aiInsight.actionRecommendation}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/assistant")}
                className="rounded-xl text-xs font-semibold shrink-0 gap-1 text-[#2b7fff] border-[#2b7fff]/30 hover:bg-[#2b7fff]/10"
              >
                Ask AI Tutor <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Right (5 cols): Weekly Activity Visualization */}
        <div className="lg:col-span-5">
          <Card className="glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between gap-5 border border-zinc-200/70 shadow-sm h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Calendar className="size-4" />
                </div>
                <span className="font-display font-bold text-lg text-zinc-950">Weekly Activity</span>
              </div>
              <span className="text-xs font-semibold text-zinc-500">Last 7 Days</span>
            </div>

            {/* 7-Day Activity Bars */}
            <div className="flex items-end justify-between gap-2 h-28 pt-4 px-2">
              {data?.weeklyActivity.map((day) => {
                const maxHours = 4;
                const heightPercent = Math.min(100, Math.max(12, Math.round((day.hours / maxHours) * 100)));
                return (
                  <div key={day.dayName} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-semibold text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.hours}h
                    </span>
                    <div
                      className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                        day.isToday
                          ? "bg-[#2b7fff] shadow-sm shadow-[#2b7fff]/30"
                          : day.hours > 0
                          ? "bg-[#2b7fff]/40 hover:bg-[#2b7fff]/60"
                          : "bg-zinc-100"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className={`text-[11px] font-semibold ${day.isToday ? "text-[#2b7fff] font-bold" : "text-zinc-500"}`}>
                      {day.dayName}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Summary Counters */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-200/60 text-center">
              <div className="flex flex-col">
                <span className="font-bold text-sm text-zinc-900">
                  {data?.weeklyActivity.reduce((acc, d) => acc + d.hours, 0).toFixed(1)}h
                </span>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Logged</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-emerald-600">
                  {data?.weeklyActivity.reduce((acc, d) => acc + d.milestones, 0)}
                </span>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Milestones</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-[#2b7fff]">
                  {data?.weeklyActivity.filter((d) => d.hours > 0).length}/7
                </span>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Active Days</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ─── Skill Competency Matrix ──────────────────────────────────────── */}
      <Card className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col gap-6 border border-zinc-200/70 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-[#2b7fff]/10 text-[#2b7fff] flex items-center justify-center">
              <Award className="size-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-zinc-950">Engineering Competency Matrix</h2>
              <p className="text-xs text-zinc-600">Quantified proficiency based on verified roadmap milestones.</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/skills")}
            className="rounded-xl text-xs font-semibold gap-1.5 text-zinc-700 hover:text-[#2b7fff] hover:border-[#2b7fff]/30 cursor-pointer"
          >
            Explore Full Radar <ArrowRight className="size-3.5" />
          </Button>
        </div>

        {/* Competencies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {data?.skillCompetencies.map((comp) => (
            <div
              key={comp.id}
              className="p-4 rounded-2xl bg-white/70 border border-zinc-200/70 shadow-sm flex flex-col justify-between gap-3 hover:border-[#2b7fff]/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getSkillIcon(comp.category)}
                  <span className="font-bold text-xs text-zinc-900">{comp.category}</span>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-2 py-0.5 font-semibold ${
                    comp.level === "Mastered"
                      ? "bg-emerald-100 text-emerald-800 border-0"
                      : comp.level === "In Progress"
                      ? "bg-[#2b7fff]/10 text-[#2b7fff] border-0"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {comp.level}
                </Badge>
              </div>

              <div>
                <div className="flex justify-between items-center text-[11px] mb-1.5">
                  <span className="text-zinc-500 font-medium">Proficiency</span>
                  <span className="font-bold text-zinc-900">{comp.score}%</span>
                </div>
                <Progress value={comp.score} className="h-1.5" />
              </div>

              <span className="text-[11px] text-zinc-500">
                {comp.completedCount} / {comp.totalCount} milestones verified
              </span>
            </div>
          ))}
        </div>
      </Card>

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
                    className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border-0 cursor-pointer z-10 ${
                      statusFilter === st
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
              <Card key={i} className="p-6 backdrop-blur-xl bg-white/60 border border-zinc-200/60 shadow-sm animate-pulse h-64" />
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
                className="bg-[#2b7fff] text-white hover:bg-[#2563eb] gap-2 rounded-xl text-xs font-semibold"
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
                  transition={{ duration: 0.25 }}
                >
                  <Card
                    onClick={() => navigate(`/conversations/${conv.id}/roadmap`)}
                    className="group relative cursor-pointer glass-card glass-card-hover rounded-2xl p-6 border border-zinc-200/70 shadow-sm flex flex-col justify-between gap-5 h-full transition-all duration-300"
                  >
                    <CardHeader className="p-0 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <Badge
                          variant="outline"
                          className="bg-zinc-50/80 text-[10px] uppercase font-bold text-zinc-700 border-zinc-200"
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
                      <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex flex-col gap-0.5 text-left">
                        <span className="text-[10px] font-bold uppercase text-[#2b7fff] tracking-wider">
                          Current Focus
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
                        <Progress value={conv.progress} className="h-1.5" />
                      </div>

                      {/* Meta Tags */}
                      <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                        <span className="capitalize px-2 py-0.5 rounded-md bg-zinc-100 font-semibold text-zinc-700 text-[11px]">
                          {conv.learningContext?.currentLevel || "Intermediate"}
                        </span>
                        <span className="flex items-center gap-1 text-[11px]">
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
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
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
