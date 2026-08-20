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
  Send,
  X,
  Share2,
  CheckCircle2,
  Download,
  ArrowRight,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { roadmapApi, topicApi } from "@/lib/api";
import { dispatchProgressUpdate } from "@/lib/learning-data";
import {
  getRoadmapForCourseOrId,
  getCourseByIdOrSlug,
  type CourseRoadmapData,
  type RoadmapTopic,
} from "@/lib/courses-data";

const phaseIcons = [Check, Zap, Layers, FolderGit2, Trophy];

export default function RoadmapPage() {
  const { id: routeConvId, courseId: routeCourseId } = useParams<{ id?: string; courseId?: string }>();
  const [searchParams] = useSearchParams();
  const queryCourseId = searchParams.get("courseId") || searchParams.get("course");
  const navigate = useNavigate();

  // Target Course or Conversation Identifier
  const activeTargetId = useMemo(() => {
    return routeCourseId || queryCourseId || routeConvId || "default-roadmap";
  }, [routeCourseId, queryCourseId, routeConvId]);

  // Read Course Metadata if this is a Course Roadmap
  const matchedCourse = useMemo(() => {
    return getCourseByIdOrSlug(activeTargetId);
  }, [activeTargetId]);

  const [roadmap, setRoadmap] = useState<CourseRoadmapData>(() => {
    return getRoadmapForCourseOrId(activeTargetId);
  });

  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState(0);
  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(new Set());
  const [justToggledTopicId, setJustToggledTopicId] = useState<string | null>(null);
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
      // Default initial completed for default / react if fresh
      if (activeTargetId === "default-roadmap" || activeTargetId === "fe-roadmap-01" || activeTargetId === "react-19-development") {
        setCompletedTopicIds(new Set(["topic-001", "topic-002", "m-react-101"]));
      } else {
        setCompletedTopicIds(new Set());
      }
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
          if (rData && rData.phases) {
            setRoadmap(rData);
            localStorage.setItem(`roadmap_${activeTargetId}`, JSON.stringify(rData));
          }
        } catch {
          // offline
        } finally {
          setIsLoading(false);
        }
      };
      fetchRemoteRoadmap();
    }
  }, [activeTargetId, routeConvId]);

  // ─── 2. Calculate Progress Metrics ──────────────────────────────────────────
  const allTopics = useMemo(() => {
    return roadmap.phases.flatMap((p) => p.topics);
  }, [roadmap]);

  const totalTopicCount = allTopics.length || 1;
  const completedCount = allTopics.filter((t) => completedTopicIds.has(t.topicId)).length;
  const progressPercent = Math.round((completedCount / totalTopicCount) * 100);

  // Connector Line Fill Height
  const phaseProgressValues = roadmap.phases.map((phase) => {
    const pTopics = phase.topics;
    const done = pTopics.filter((t) => completedTopicIds.has(t.topicId)).length;
    return pTopics.length > 0 ? done / pTopics.length : 0;
  });
  const avgPhaseCompletion =
    phaseProgressValues.reduce((a, b) => a + b, 0) / (phaseProgressValues.length || 1);
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
      setJustToggledTopicId(topicId);
      setTimeout(() => setJustToggledTopicId(null), 1200);

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

  const safePhaseIndex = Math.min(selectedPhaseIndex, Math.max(0, roadmap.phases.length - 1));
  const currentSelectedPhase = roadmap.phases[safePhaseIndex] || roadmap.phases[0] || {
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
          localStorage.setItem(`roadmap_${activeTargetId}`, JSON.stringify(data.roadmap.rawJson));
          setIsModifying(false);
          setModifyPrompt("");
          setIsSubmittingMod(false);
          return;
        }
      }
    } catch {
      // offline
    }

    const updatedPhases = [...roadmap.phases];
    if (updatedPhases[0]) {
      updatedPhases[0].topics.push({
        topicId: `custom-top-${Date.now().toString().slice(-4)}`,
        title: `Custom Goal: ${modifyPrompt.slice(0, 30)}...`,
        description: `Adapted milestone: ${modifyPrompt}`,
        completed: false,
      });
    }

    const modified = { ...roadmap, phases: updatedPhases };
    setRoadmap(modified);
    localStorage.setItem(`roadmap_${activeTargetId}`, JSON.stringify(modified));
    setIsModifying(false);
    setModifyPrompt("");
    setIsSubmittingMod(false);
  };

  const handleExportRoadmap = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(roadmap, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${roadmap.objective.toLowerCase().replace(/\s+/g, "-")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleShareLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getPhaseStatus = (index: number) => {
    const phase = roadmap.phases[index];
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

  return (
    <div className="flex flex-col gap-8 pb-16 w-full max-w-7xl mx-auto">
      {/* ─── 1. Header Section ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
      >
        <div className="flex flex-col gap-2 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className="font-semibold rounded-full bg-[#2b7fff]/10 text-[#2b7fff] text-xs px-3 py-1 gap-1.5 w-fit border border-[#2b7fff]/20"
            >
              <Sparkles className="size-3.5" />
              {matchedCourse ? `${matchedCourse.category} Roadmap` : "AI-Generated Learning Roadmap"}
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

          <h1 className="font-display font-bold text-3xl sm:text-4xl text-zinc-950 tracking-tight">
            {roadmap.objective}
          </h1>
          <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
            {roadmap.currentAssessment ||
              "Your personalized journey from foundation to career-ready, adapted by AI."}
          </p>
        </div>

        {/* Overall Progress Widget */}
        <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto shrink-0">
          <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            Roadmap Mastery
          </span>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-full md:w-44 h-3 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/80 p-0.5 shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-[#2b7fff] to-[#2563eb] rounded-full shadow-sm"
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
        </div>
      </motion.div>

      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-zinc-500 animate-pulse">
          <Loader2 className="size-3.5 text-[#2b7fff] animate-spin" />
          Synchronizing roadmap...
        </div>
      )}

      {/* ─── 2. Main Grid Layout ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        {/* Left Column: Learning Stages Timeline (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="glass-card backdrop-blur-xl shadow-xl shadow-[#2b7fff]/5 bg-white/80 border-zinc-200/80 p-6 md:p-8 rounded-3xl gap-6">
            <CardHeader className="p-0 gap-1 mb-6">
              <CardTitle className="font-display font-bold text-lg leading-7 text-zinc-950">
                Learning Stages
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-zinc-600">
                Follow the connected path. Click any stage to view its milestones.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 gap-0">
              <div className="relative flex flex-col">
                {/* Vertical Connector Line */}
                <div className="bg-zinc-200/90 absolute left-[27px] top-7 bottom-7 w-1 rounded-full" />
                <motion.div
                  className="bg-gradient-to-b from-[#2b7fff] via-[#3b82f6] to-[#2563eb] absolute left-[27px] top-7 w-1 rounded-full origin-top shadow-[0_0_12px_rgba(43,127,255,0.6)]"
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
                          duration: 0.5,
                          delay: idx * 0.08,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        whileHover={{ y: -2, scale: 1.008, transition: { duration: 0.2 } }}
                        whileTap={{ scale: 0.99 }}
                        className={`relative text-left rounded-2xl flex p-4 items-start gap-4 cursor-pointer transition-all border ${
                          isSelected
                            ? "bg-white shadow-lg shadow-[#2b7fff]/10 border-[#2b7fff]/50 ring-2 ring-[#2b7fff]/20"
                            : isInProgress
                            ? "bg-white/90 border-[#2b7fff]/30 shadow-md shadow-[#2b7fff]/5"
                            : "bg-white/60 border-zinc-200/70 hover:bg-white hover:border-zinc-300"
                        }`}
                      >
                        {/* Node Icon with Breathing Indicator */}
                        <div className="relative shrink-0 z-10">
                          {isInProgress && (
                            <motion.div
                              className="absolute -inset-1.5 rounded-full border-2 border-[#2b7fff] pointer-events-none"
                              animate={{ scale: [1, 1.08, 1], opacity: [0.8, 0.3, 0.8] }}
                              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                            />
                          )}

                          <motion.div
                            whileHover={{ scale: 1.06 }}
                            transition={{ duration: 0.2 }}
                            className={`size-14 rounded-full flex justify-center items-center transition-all ${
                              isCompleted
                                ? "shadow-md shadow-emerald-500/25 bg-emerald-500 text-white"
                                : isInProgress
                                ? "shadow-lg shadow-[#2b7fff]/40 bg-[#2b7fff] text-white ring-4 ring-[#2b7fff]/20"
                                : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                            }`}
                          >
                            <Icon className="size-6" />
                          </motion.div>
                        </div>

                        {/* Content */}
                        <div className="flex pt-1 flex-col gap-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-display font-bold text-base leading-6 ${
                                !isCompleted && !isInProgress ? "text-zinc-600" : "text-zinc-950"
                              }`}
                            >
                              {phase.title}
                            </span>

                            {isCompleted ? (
                              <Badge className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-0.5 border-0 flex items-center gap-1 font-bold">
                                <CheckCircle2 className="size-3" /> Completed
                              </Badge>
                            ) : isInProgress ? (
                              <Badge className="rounded-full bg-[#2b7fff]/15 text-[#2b7fff] text-[10px] px-2.5 py-0.5 border-0 font-bold flex items-center gap-1">
                                <span className="size-1.5 rounded-full bg-[#2b7fff] animate-ping" />
                                Current Focus
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="rounded-full text-[10px] px-2 py-0 text-zinc-400 bg-white"
                              >
                                Upcoming
                              </Badge>
                            )}
                          </div>

                          <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
                            {phase.description}
                          </p>

                          {isInProgress && (
                            <div className="mt-2 flex items-center gap-2.5">
                              <div className="w-48 h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/60 p-0.5">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-[#2b7fff] to-[#2563eb] rounded-full"
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
            </CardContent>
          </Card>
        </div>

        {/* ─── Right Column: Stage Milestones Details ──────────────────────── */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="glass-card backdrop-blur-xl shadow-xl shadow-[#2b7fff]/10 bg-white/85 border-zinc-200/80 p-6 rounded-3xl gap-4 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={safePhaseIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-4"
              >
                <CardHeader className="p-0 gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className={`size-9 rounded-xl flex justify-center items-center ${
                          getPhaseStatus(safePhaseIndex).variant === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-[#2b7fff]/15 text-[#2b7fff]"
                        }`}
                      >
                        {getPhaseStatus(safePhaseIndex).variant === "completed" ? (
                          <Check className="size-4" />
                        ) : (
                          <Zap className="size-4" />
                        )}
                      </motion.div>
                      <CardTitle className="font-display font-bold text-base leading-6 text-zinc-950">
                        {currentSelectedPhase.title}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs bg-white font-medium">
                      {currentSelectedPhase.estimatedWeeks
                        ? `${currentSelectedPhase.estimatedWeeks} wks`
                        : "Stage"}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-zinc-600 leading-relaxed">
                    Check off milestones as you complete them. Click the question icon to ask AI about any topic.
                  </CardDescription>
                </CardHeader>

                {/* Staggered Milestone Rows */}
                <CardContent className="flex p-0 flex-col gap-2.5">
                  {currentSelectedPhase.topics.length === 0 ? (
                    <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-500 text-center">
                      No milestones in this stage yet.
                    </div>
                  ) : (
                    currentSelectedPhase.topics.map((topic, tIdx) => {
                      const isChecked = completedTopicIds.has(topic.topicId);
                      const isJustToggled = justToggledTopicId === topic.topicId;

                      return (
                        <motion.div
                          key={topic.topicId}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            backgroundColor: isJustToggled && isChecked
                              ? ["rgba(16,185,129,0.25)", "rgba(236,253,245,0.8)"]
                              : isChecked
                              ? "rgba(236,253,245,0.7)"
                              : "rgba(244,244,245,0.7)",
                          }}
                          transition={{
                            opacity: { duration: 0.35, delay: tIdx * 0.08 },
                            y: { duration: 0.35, delay: tIdx * 0.08 },
                            backgroundColor: { duration: 0.5 },
                          }}
                          whileHover={{
                            y: -2,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                            backgroundColor: isChecked ? "rgba(236,253,245,0.9)" : "rgba(255,255,255,0.95)",
                            transition: { duration: 0.18 },
                          }}
                          className={`group flex items-center justify-between rounded-xl p-3 text-xs sm:text-sm border transition-colors ${
                            isChecked
                              ? "border-emerald-200 text-emerald-950"
                              : "border-zinc-200/80 text-zinc-800"
                          }`}
                        >
                          {/* Interactive Checkbox */}
                          <div
                            onClick={() => toggleTopic(topic.topicId)}
                            className="flex items-center gap-3 cursor-pointer flex-1 select-none"
                          >
                            <motion.div
                              whileTap={{ scale: 0.85 }}
                              className={`size-5 rounded-md flex items-center justify-center border transition-all ${
                                isChecked
                                ? "bg-[#2b7fff] border-[#2b7fff] text-white shadow-sm"
                                : "bg-white border-zinc-300 group-hover:border-[#2b7fff]"
                              }`}
                            >
                              {isChecked && (
                                <motion.div
                                  initial={{ scale: 0, rotate: -25 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{ type: "spring", stiffness: 450, damping: 22 }}
                                >
                                  <Check className="size-3.5 stroke-[3]" />
                                </motion.div>
                              )}
                            </motion.div>

                            <span
                              className={`font-semibold transition-all ${
                                isChecked ? "line-through text-zinc-400 font-normal" : "text-zinc-900"
                              }`}
                            >
                              {topic.title}
                            </span>
                          </div>

                          {/* Ask AI Tutor Icon */}
                          <motion.button
                            type="button"
                            title="Ask AI about this topic"
                            whileHover={{ scale: 1.25, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => {
                              setActiveQuestionTopic(topic);
                              setAiAnswer(null);
                              setUserQuestion("");
                            }}
                            className="text-zinc-400 hover:text-[#2b7fff] p-1.5 rounded-lg hover:bg-white transition-colors bg-transparent border-0 cursor-pointer"
                          >
                            <HelpCircle className="size-4" />
                          </motion.button>
                        </motion.div>
                      );
                    })
                  )}
                </CardContent>

                <CardFooter className="p-0 pt-2 flex flex-col gap-2">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                    <Button
                      onClick={() => {
                        navigate(`/assistant?topic=${encodeURIComponent(currentSelectedPhase.title)}`);
                      }}
                      className="group bg-[#2b7fff] text-white hover:bg-[#2563eb] gap-2 w-full shadow-md shadow-[#2b7fff]/20 rounded-xl cursor-pointer h-11 text-xs font-bold transition-all"
                    >
                      <Play className="size-4" />
                      <span>Continue Learning in Assistant</span>
                      <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </Button>
                  </motion.div>
                </CardFooter>
              </motion.div>
            </AnimatePresence>
          </Card>

          {/* AI Insight Card */}
          <Card className="glass-card backdrop-blur-xl bg-[#2b7fff]/5 border border-[#2b7fff]/25 p-6 rounded-3xl gap-3 flex flex-col shadow-sm">
            <CardHeader className="p-0 gap-2">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-[#2b7fff]/10 text-[#2b7fff] flex items-center justify-center">
                  <Sparkles className="size-3.5" />
                </div>
                <CardTitle className="font-display font-bold text-[#2b7fff] text-xs uppercase tracking-wider">
                  PathAI Pacing Insight
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-zinc-800 text-xs sm:text-sm leading-relaxed font-medium">
                {progressPercent >= 60
                  ? `Outstanding velocity! You have completed over 60% of ${roadmap.objective}.`
                  : progressPercent > 0
                  ? `You are steadily progressing through ${currentSelectedPhase.title}. Completing milestones keeps you on track.`
                  : `Start by checking off the foundation milestones for ${roadmap.objective}.`}
              </p>
            </CardContent>
          </Card>
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
                    className="bg-[#2b7fff] text-white hover:bg-[#2563eb] text-xs font-semibold rounded-xl gap-1.5"
                  >
                    {isAsking ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <>
                        <Send className="size-3" />
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

      {/* ─── Modify Roadmap Dialog ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isModifying && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl shadow-2xl border border-zinc-200 max-w-md w-full p-6 flex flex-col gap-4"
            >
              <div>
                <h3 className="font-display font-bold text-lg text-zinc-950">Modify Learning Roadmap</h3>
                <p className="text-xs text-zinc-500 leading-relaxed mt-1">
                  Tell PathAI what topics to add, remove, or adapt to match your evolving goals.
                </p>
              </div>

              <textarea
                value={modifyPrompt}
                onChange={(e) => setModifyPrompt(e.target.value)}
                placeholder="e.g. Add deep dive into AST transforms and decorator metadata..."
                rows={3}
                className="w-full p-3 rounded-xl border border-zinc-200 bg-zinc-50 text-xs outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff] resize-none"
              />

              <div className="flex justify-end gap-2">
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
                  className="bg-[#2b7fff] text-white hover:bg-[#2563eb] text-xs font-semibold rounded-xl gap-1.5"
                >
                  {isSubmittingMod ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    "Apply Changes"
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
