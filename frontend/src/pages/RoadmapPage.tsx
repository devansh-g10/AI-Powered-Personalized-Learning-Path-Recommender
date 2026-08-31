import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  FolderGit2,
  Layers,
  Play,
  Sparkles,
  Trophy,
  Zap,
  HelpCircle,
  RefreshCw,
  Loader2,
  X,
  Share2,
  CheckCircle2,
  Download,
  ArrowRight,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { roadmapApi, topicApi } from "@/lib/api";
import { dispatchProgressUpdate, subscribeToProgressUpdates } from "@/lib/learning-data";
import {
  getRoadmapForCourseOrId,
  getCourseByIdOrSlug,
  type CourseRoadmapData,
  type RoadmapTopic,
} from "@/lib/courses-data";

const phaseIcons = [Check, Zap, Layers, FolderGit2, Trophy];

function getUserPathsFromStorage(): { id: string; title: string; category?: string }[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("local_conversations");
    if (stored) {
      const convs = JSON.parse(stored);
      if (Array.isArray(convs)) {
        return convs
          .filter((c: any) => c && c.id && c.title)
          .map((c: any) => ({
            id: c.id,
            title: c.title,
            category: c.category || "AI Learning Path",
          }));
      }
    }
  } catch {
    // ignore
  }
  return [];
}

export default function RoadmapPage() {
  const { id: routeConvId, courseId: routeCourseId } = useParams<{ id?: string; courseId?: string }>();
  const [searchParams] = useSearchParams();
  const queryCourseId = searchParams.get("courseId") || searchParams.get("course");
  const navigate = useNavigate();

  // User's custom learning paths from localStorage (reactive)
  const [userPaths, setUserPaths] = useState<{ id: string; title: string; category?: string }[]>(() => {
    return getUserPathsFromStorage();
  });

  useEffect(() => {
    const handleUpdate = () => {
      setUserPaths(getUserPathsFromStorage());
    };
    handleUpdate();
    const unsubscribe = subscribeToProgressUpdates(handleUpdate);
    return () => unsubscribe();
  }, []);

  // Target Course or Conversation Identifier
  const activeTargetId = useMemo(() => {
    if (routeCourseId) return routeCourseId;
    if (queryCourseId) return queryCourseId;
    if (routeConvId) return routeConvId;

    if (userPaths.length > 0 && userPaths[0]?.id) {
      return userPaths[0].id;
    }

    // No target if user has no courses in dashboard
    return null;
  }, [routeCourseId, queryCourseId, routeConvId, userPaths]);

  // Read Course Metadata if this is a Course Roadmap
  const matchedCourse = useMemo(() => {
    if (!activeTargetId) return undefined;
    return getCourseByIdOrSlug(activeTargetId);
  }, [activeTargetId]);

  const [roadmap, setRoadmap] = useState<CourseRoadmapData | null>(() => {
    if (!activeTargetId) return null;
    return getRoadmapForCourseOrId(activeTargetId);
  });

  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState(0);
  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Topic Question Modal State
  const [activeQuestionTopic, setActiveQuestionTopic] = useState<RoadmapTopic | null>(null);
  const [userQuestion, setUserQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  // Roadmap Modification Dialog State
  const [isModifying, setIsModifying] = useState(false);
  const [modifyPrompt, setModifyPrompt] = useState("");
  const [isSubmittingMod, setIsSubmittingMod] = useState(false);

  // ─── 1. Load Course-Specific Roadmap & Completed Milestones ─────────────────
  useEffect(() => {
    if (!activeTargetId) {
      setRoadmap(null);
      return;
    }

    // 1. Derive authentic course roadmap
    const courseRoadmap = getRoadmapForCourseOrId(activeTargetId);
    setRoadmap(courseRoadmap);
    setSelectedPhaseIndex(0);

    // 2. Load course-specific completed topics from scoped localStorage
    const storageKey = `completed_topics_${activeTargetId}`;
    const savedCompleted = localStorage.getItem(storageKey);
    if (savedCompleted) {
      try {
        setCompletedTopicIds(new Set(JSON.parse(savedCompleted)));
      } catch {
        setCompletedTopicIds(new Set());
      }
    } else {
      setCompletedTopicIds(new Set());
    }

    // 3. If remote conversation ID, try remote API
    if (
      routeConvId &&
      !routeConvId.startsWith("course-") &&
      !routeConvId.includes("typescript") &&
      !routeConvId.includes("react") &&
      !routeConvId.includes("docker")
    ) {
      const fetchRemoteRoadmap = async () => {
        try {
          setIsLoading(true);
          const { data } = await roadmapApi.get(routeConvId);
          const rData = data.roadmap?.rawJson || data.roadmap;
          if (rData && rData.phases && rData.phases.length > 0) {
            setRoadmap(rData);
            localStorage.setItem(`roadmap_${activeTargetId}`, JSON.stringify(rData));
          }
        } catch {
          // offline fallback
        } finally {
          setIsLoading(false);
        }
      };
      fetchRemoteRoadmap();
    }
  }, [activeTargetId, routeConvId]);

  // ─── 2. Calculate Progress Metrics ──────────────────────────────────────────
  const allTopics = useMemo(() => {
    if (!roadmap?.phases) return [];
    return roadmap.phases.flatMap((p) => p.topics);
  }, [roadmap]);

  const totalTopicCount = allTopics.length || 1;
  const completedCount = allTopics.filter((t) => completedTopicIds.has(t.topicId)).length;
  const progressPercent = Math.round((completedCount / totalTopicCount) * 100);

  // Connector Line Fill Height
  const phaseProgressValues = useMemo(() => {
    if (!roadmap?.phases) return [];
    return roadmap.phases.map((phase) => {
      const pTopics = phase.topics;
      const done = pTopics.filter((t) => completedTopicIds.has(t.topicId)).length;
      return pTopics.length > 0 ? done / pTopics.length : 0;
    });
  }, [roadmap, completedTopicIds]);

  const avgPhaseCompletion =
    phaseProgressValues.length > 0
      ? phaseProgressValues.reduce((a, b) => a + b, 0) / phaseProgressValues.length
      : 0;
  const connectorLineFillPercent = Math.min(100, Math.max(10, Math.round(avgPhaseCompletion * 100)));

  // ─── 3. Toggle Topic Milestone ──────────────────────────────────────────────
  const toggleTopic = (topicId: string) => {
    setCompletedTopicIds((prev) => {
      const next = new Set(prev);
      const willBeCompleted = !next.has(topicId);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      // Save course-scoped storage
      const storageKey = `completed_topics_${activeTargetId}`;
      localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));

      // Also sync course slug / id aliases
      if (matchedCourse) {
        localStorage.setItem(`completed_topics_${matchedCourse.id}`, JSON.stringify(Array.from(next)));
        localStorage.setItem(`completed_topics_${matchedCourse.slug}`, JSON.stringify(Array.from(next)));
      }

      dispatchProgressUpdate({
        action: "roadmap_milestone_toggled",
        courseId: activeTargetId,
        topicId,
        completed: willBeCompleted,
      });

      return next;
    });
  };

  const phasesList = roadmap?.phases || [];
  const safePhaseIndex = Math.min(selectedPhaseIndex, Math.max(0, phasesList.length - 1));
  const currentSelectedPhase = phasesList[safePhaseIndex] || phasesList[0] || {
    phaseId: "p0",
    title: "Overview",
    description: "Milestones overview",
    topics: [],
  };

  const handleAskQuestion = async () => {
    if (!activeQuestionTopic || !userQuestion.trim()) return;
    setIsAsking(true);
    try {
      if (routeConvId && !routeConvId.startsWith("course-") && !routeConvId.startsWith("conv-")) {
        const { data } = await topicApi.askQuestion(
          routeConvId,
          activeQuestionTopic.topicId,
          userQuestion
        );
        if (data?.answer) {
          setAiAnswer(data.answer);
          setIsAsking(false);
          return;
        }
      }
    } catch {
      // offline
    }

    setTimeout(() => {
      setAiAnswer(
        `### Deep Dive: ${activeQuestionTopic.title}\n\n` +
        `**1. Architectural Concept:**\n` +
        `${activeQuestionTopic.description || "Core engineering pattern essential for production mastery."}\n\n` +
        `**2. Implementation Best Practice:**\n` +
        `Always decouple state from presentation, use strict typing, and test edge cases.\n\n` +
        `**3. Practice Challenge:**\n` +
        `Implement a minimal example demonstrating this pattern in your local workspace.`
      );
      setIsAsking(false);
    }, 500);
  };

  const handleModifyRoadmap = async () => {
    if (!modifyPrompt.trim()) return;
    setIsSubmittingMod(true);

    try {
      if (routeConvId && !routeConvId.startsWith("course-")) {
        const { data } = await roadmapApi.generate(routeConvId, modifyPrompt);
        if (data.roadmap?.rawJson) {
          setRoadmap(data.roadmap.rawJson);
          if (activeTargetId) {
            localStorage.setItem(`roadmap_${activeTargetId}`, JSON.stringify(data.roadmap.rawJson));
          }
          setIsModifying(false);
          setModifyPrompt("");
          setIsSubmittingMod(false);
          return;
        }
      }

      // Offline local update: inject new requested milestone into selected phase
      await new Promise((r) => setTimeout(r, 500));
      if (roadmap && roadmap.phases && roadmap.phases.length > 0) {
        const updated = { ...roadmap };
        const targetPhase = updated.phases[safePhaseIndex] || updated.phases[0];
        targetPhase.topics.push({
          topicId: `custom-topic-${Date.now()}`,
          title: modifyPrompt.trim(),
          description: "Custom AI-tailored milestone added via roadmap modification.",
          completed: false,
        });
        setRoadmap(updated);
        if (activeTargetId) {
          localStorage.setItem(`roadmap_${activeTargetId}`, JSON.stringify(updated));
        }
      }
      setIsModifying(false);
      setModifyPrompt("");
    } catch {
      // ignore
    } finally {
      setIsSubmittingMod(false);
    }
  };

  const handleExportRoadmap = () => {
    if (!roadmap) return;
    const blob = new Blob([JSON.stringify(roadmap, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(roadmap.objective || "learning-roadmap")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getPhaseStatus = (index: number) => {
    const phase = phasesList[index];
    if (!phase) return { label: "Upcoming", variant: "upcoming" };
    const topicsInPhase = phase.topics;
    const finished = topicsInPhase.filter((t) => completedTopicIds.has(t.topicId)).length;

    if (finished === topicsInPhase.length && topicsInPhase.length > 0) {
      return { label: "Completed", variant: "completed" };
    }
    if (finished > 0 || index === safePhaseIndex) {
      return { label: "In Progress", variant: "in_progress" };
    }
    return { label: "Upcoming", variant: "upcoming" };
  };

  // ─── 0. Empty State (When user has 0 learning paths / courses in dashboard) ───
  if (!activeTargetId || !roadmap || phasesList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-5 max-w-lg mx-auto py-16 px-4">
        <div className="size-16 rounded-3xl bg-blue-50 text-[#2b7fff] flex items-center justify-center">
          <Layers className="size-8 stroke-[2]" />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-display font-bold text-2xl text-zinc-950">
            No Active Roadmap Found
          </h2>
          <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed">
            You don't have any learning paths in your dashboard. Create an AI-personalized roadmap or explore courses to get started.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full justify-center">
          <Button
            onClick={() => navigate("/questionnaire")}
            className="w-full sm:w-auto h-11 px-6 rounded-xl bg-[#2b7fff] hover:bg-[#2563eb] text-white font-bold text-xs gap-2 cursor-pointer border-0 shadow-sm"
          >
            <Sparkles className="size-4" />
            <span>Create Learning Path with AI</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/courses")}
            className="w-full sm:w-auto h-11 px-6 rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-semibold text-xs gap-2 cursor-pointer"
          >
            <Compass className="size-4 text-[#2b7fff]" />
            <span>Browse Courses</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-16 w-full max-w-7xl mx-auto pt-0">
      {/* ─── 1. Header Section (Directly at Top) ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 pt-0 pb-1"
      >
        <div className="flex flex-col gap-2 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className="font-bold rounded-full bg-[#2b7fff]/10 text-[#2b7fff] text-xs px-3 py-1 gap-1.5 w-fit border-0"
            >
              <Sparkles className="size-3.5" />
              {matchedCourse ? `${matchedCourse.category} Roadmap` : "AI Personalized Learning Path"}
            </Badge>

            {matchedCourse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/courses/${matchedCourse.slug}`)}
                className="h-7 text-xs gap-1 rounded-full text-zinc-600 hover:text-[#2b7fff] cursor-pointer"
              >
                <Compass className="size-3" />
                <span>View Course Syllabus</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModifying(true)}
              className="h-7 text-xs gap-1.5 rounded-full border-zinc-200 text-zinc-600 hover:text-[#2b7fff] transition-all cursor-pointer"
            >
              <RefreshCw className="size-3" />
              Modify Roadmap
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportRoadmap}
              className="h-7 text-xs gap-1.5 rounded-full border-zinc-200 text-zinc-600 hover:text-zinc-950 transition-all cursor-pointer"
            >
              <Download className="size-3" />
              Export JSON
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShareLink}
              className="h-7 text-xs gap-1.5 rounded-full border-zinc-200 text-zinc-600 hover:text-zinc-950 transition-all cursor-pointer"
            >
              <Share2 className="size-3" />
              {copiedLink ? "Copied Link!" : "Share"}
            </Button>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#2b7fff] tracking-tight">
            {roadmap.objective}
          </h1>
        </div>

        {/* Overall Progress Widget */}
        <div className="flex flex-col items-start md:items-end gap-1.5 w-full md:w-auto shrink-0">
          <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
            Roadmap Mastery
          </span>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-full md:w-44 h-2.5 bg-zinc-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#2b7fff] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <motion.span
              key={progressPercent}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="font-bold text-[#2b7fff] text-base leading-5 min-w-[40px] text-right"
            >
              {progressPercent}%
            </motion.span>
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">
            {completedCount} of {totalTopicCount} verified milestones
          </span>
        </div>
      </motion.div>

      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-zinc-500 animate-pulse">
          <Loader2 className="size-3.5 text-[#2b7fff] animate-spin" />
          Synchronizing roadmap...
        </div>
      )}

      {/* ─── 2. Main Grid Layout ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 pt-2">
        {/* Left Column: Learning Stages Timeline (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-xl text-zinc-950">
                Learning Stages
              </h2>
              <span className="text-xs font-bold text-zinc-400">
                {roadmap.phases.length} Total Stages
              </span>
            </div>

          </div>

          <div className="relative flex flex-col">
            {/* Vertical Connector Line */}
            <div className="bg-zinc-200 absolute left-[27px] top-7 bottom-7 w-1 rounded-full" />
            <motion.div
              className="bg-[#2b7fff] absolute left-[27px] top-7 w-1 rounded-full origin-top"
              initial={{ height: 0 }}
              animate={{ height: `${connectorLineFillPercent}%` }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Staggered Stage Nodes */}
            <div className="flex flex-col gap-3">
              {roadmap.phases.map((phase, idx) => {
                const Icon = phaseIcons[idx % phaseIcons.length];
                const status = getPhaseStatus(idx);
                const isSelected = safePhaseIndex === idx;
                const isCompleted = status.variant === "completed";
                const isInProgress = status.variant === "in_progress";

                const phaseTopics = phase.topics;
                const phaseDone = phaseTopics.filter((t) =>
                  completedTopicIds.has(t.topicId)
                ).length;
                const phaseProgress =
                  phaseTopics.length > 0
                    ? Math.round((phaseDone / phaseTopics.length) * 100)
                    : 0;

                return (
                  <motion.button
                    key={phase.phaseId || idx}
                    onClick={() => setSelectedPhaseIndex(idx)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.45,
                      delay: idx * 0.06,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{ x: 2, transition: { duration: 0.2 } }}
                    className={`relative text-left rounded-2xl flex p-4 items-start gap-4 cursor-pointer transition-all border-0 ${isSelected
                      ? "bg-blue-50/70"
                      : "hover:bg-zinc-50 bg-transparent"
                      }`}
                  >
                    {/* Node Icon */}
                    <div className="relative shrink-0 z-10">
                      <div
                        className={`size-12 rounded-full flex justify-center items-center transition-all ${isCompleted
                          ? "bg-emerald-500 text-white"
                          : isInProgress
                            ? "bg-[#2b7fff] text-white"
                            : "bg-zinc-100 text-zinc-400"
                          }`}
                      >
                        <Icon className="size-5" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex pt-0.5 flex-col gap-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-display font-bold text-base ${!isCompleted && !isInProgress ? "text-zinc-600" : "text-zinc-950"
                            }`}
                        >
                          {phase.title}
                        </span>

                        {isCompleted ? (
                          <Badge className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-0.5 border-0 flex items-center gap-1 font-bold">
                            <CheckCircle2 className="size-3" /> Completed
                          </Badge>
                        ) : isInProgress ? (
                          <Badge className="rounded-full bg-blue-100 text-[#2b7fff] text-[10px] px-2.5 py-0.5 border-0 font-bold flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-[#2b7fff] animate-ping" />
                            Current Focus
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="rounded-full text-[10px] px-2 py-0 text-zinc-400 bg-transparent border-0"
                          >
                            Upcoming
                          </Badge>
                        )}
                      </div>

                      <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed">
                        {phase.description}
                      </p>

                      {isInProgress && (
                        <div className="mt-2 flex items-center gap-2.5">
                          <div className="w-44 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-[#2b7fff] rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${phaseProgress}%` }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                          </div>
                          <span className="text-xs font-bold text-[#2b7fff]">
                            {phaseProgress}%
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Right Column: Stage Milestones Details ──────────────────────── */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={safePhaseIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`size-8 rounded-lg flex justify-center items-center ${getPhaseStatus(safePhaseIndex).variant === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-50 text-[#2b7fff]"
                        }`}
                    >
                      {getPhaseStatus(safePhaseIndex).variant === "completed" ? (
                        <Check className="size-4" />
                      ) : (
                        <Zap className="size-4" />
                      )}
                    </div>
                    <h3 className="font-display font-bold text-base text-zinc-950">
                      {currentSelectedPhase.title}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-zinc-400">
                    {currentSelectedPhase.estimatedWeeks
                      ? `${currentSelectedPhase.estimatedWeeks} wks`
                      : "Stage"}
                  </span>
                </div>

              </div>

              {/* Staggered Milestone Rows */}
              <div className="flex flex-col gap-1.5">
                {currentSelectedPhase.topics.length === 0 ? (
                  <div className="py-6 text-xs text-zinc-400 text-center">
                    No milestones in this stage yet.
                  </div>
                ) : (
                  currentSelectedPhase.topics.map((topic, tIdx) => {
                    const isChecked = completedTopicIds.has(topic.topicId);

                    return (
                      <motion.div
                        key={topic.topicId}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          opacity: { duration: 0.35, delay: tIdx * 0.06 },
                          y: { duration: 0.35, delay: tIdx * 0.06 },
                        }}
                        className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs sm:text-sm transition-colors ${isChecked
                          ? "text-zinc-400 bg-emerald-50/40"
                          : "text-zinc-800 hover:bg-zinc-50"
                          }`}
                      >
                        {/* Interactive Checkbox */}
                        <div
                          onClick={() => toggleTopic(topic.topicId)}
                          className="flex items-center gap-3 cursor-pointer flex-1 select-none"
                        >
                          <motion.div
                            whileTap={{ scale: 0.85 }}
                            className={`size-4.5 rounded-md flex items-center justify-center border transition-all ${isChecked
                              ? "bg-[#2b7fff] border-[#2b7fff] text-white"
                              : "bg-white border-zinc-300 group-hover:border-[#2b7fff]"
                              }`}
                          >
                            {isChecked && (
                              <Check className="size-3 stroke-[3]" />
                            )}
                          </motion.div>

                          <span
                            className={`font-medium transition-all ${isChecked ? "line-through text-zinc-400" : "text-zinc-900"
                              }`}
                          >
                            {topic.title}
                          </span>
                        </div>

                        {/* Ask AI Tutor Icon */}
                        <button
                          type="button"
                          title="Ask AI about this topic"
                          onClick={() => {
                            setActiveQuestionTopic(topic);
                            setAiAnswer(null);
                            setUserQuestion("");
                          }}
                          className="text-zinc-400 hover:text-[#2b7fff] p-1 rounded-lg transition-colors bg-transparent border-0 cursor-pointer"
                        >
                          <HelpCircle className="size-4" />
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  onClick={() => {
                    const firstUncompletedTopic = currentSelectedPhase?.topics?.find((t) => !completedTopicIds.has(t.topicId))?.title;
                    const targetTopic = firstUncompletedTopic || currentSelectedPhase?.topics?.[0]?.title || currentSelectedPhase?.title || roadmap?.objective || "Learning Roadmap";
                    const targetId = activeTargetId || routeConvId || "default";
                    navigate(`/conversations/${targetId}/assistant?topic=${encodeURIComponent(targetTopic)}`);
                  }}
                  className="group bg-[#2b7fff] text-white hover:bg-[#2563eb] gap-2 w-full rounded-xl cursor-pointer h-10 text-xs font-bold transition-all border-0"
                >
                  <Play className="size-4" />
                  <span>Continue Learning in Assistant</span>
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* AI Insight Section */}

        </div>
      </div>

      {/* ─── Topic Question Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {activeQuestionTopic && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl shadow-2xl border border-zinc-200 max-w-lg w-full p-6 sm:p-7 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <Badge
                    variant="secondary"
                    className="bg-[#2b7fff]/10 text-[#2b7fff] text-xs mb-1 font-semibold"
                  >
                    Topic Deep Dive
                  </Badge>
                  <h3 className="font-display font-bold text-lg text-zinc-950">
                    {activeQuestionTopic.title}
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                    {activeQuestionTopic.description || "Ask anything about this topic."}
                  </p>
                </div>
                <button
                  onClick={() => setActiveQuestionTopic(null)}
                  className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg bg-transparent border-0 cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              {aiAnswer ? (
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 max-h-64 overflow-y-auto text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2b7fff] mb-2">
                    <Sparkles className="size-3.5" /> PathAI Explanation:
                  </div>
                  {aiAnswer}
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder="Ask a technical question about this milestone..."
                  className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 text-xs outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAskQuestion();
                  }}
                />
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveQuestionTopic(null)}
                    className="text-xs rounded-xl"
                  >
                    Close
                  </Button>
                  <Button
                    size="sm"
                    disabled={isAsking || !userQuestion.trim()}
                    onClick={handleAskQuestion}
                    className="bg-[#2b7fff] text-white hover:bg-[#2563eb] text-xs rounded-xl gap-1.5"
                  >
                    {isAsking ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="size-3.5" />
                        Ask AI
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Modify Roadmap Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isModifying && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl shadow-2xl border border-zinc-200 max-w-lg w-full p-6 sm:p-7 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <Badge
                    variant="secondary"
                    className="bg-[#2b7fff]/10 text-[#2b7fff] text-xs mb-1 font-semibold"
                  >
                    AI Roadmap Architect
                  </Badge>
                  <h3 className="font-display font-bold text-lg text-zinc-950">
                    Modify Your Learning Roadmap
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                    Tell PathAI how you'd like to adjust stages, add specific technologies, or increase depth.
                  </p>
                </div>
                <button
                  onClick={() => setIsModifying(false)}
                  className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg bg-transparent border-0 cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              <textarea
                value={modifyPrompt}
                onChange={(e) => setModifyPrompt(e.target.value)}
                placeholder="E.g., Add more focus on Docker & Kubernetes, include a real-world testing stage, or skip beginner HTML..."
                className="w-full h-28 p-3.5 rounded-2xl border border-zinc-200 bg-zinc-50 text-xs outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff] resize-none"
              />

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModifying(false)}
                  className="text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={isSubmittingMod || !modifyPrompt.trim()}
                  onClick={handleModifyRoadmap}
                  className="bg-[#2b7fff] text-white hover:bg-[#2563eb] text-xs rounded-xl gap-1.5"
                >
                  {isSubmittingMod ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="size-3.5" />
                      Regenerate Roadmap
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
