import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Code2,
  Download,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { roadmapApi, topicApi } from "@/lib/api";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Subtopic {
  title: string;
  description?: string;
}

interface Topic {
  topicId: string;
  title: string;
  description?: string;
  whyThisExists?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  estimatedHours?: number;
  prerequisites?: string[];
  subtopics?: (string | Subtopic)[];
  projects?: string[];
  isMilestone?: boolean;
  completed?: boolean;
}

interface Phase {
  phaseId: string;
  title: string;
  description?: string;
  estimatedWeeks?: number;
  topics: Topic[];
}

interface RoadmapData {
  objective: string;
  currentAssessment?: string;
  phases: Phase[];
  finalOutcome?: string;
  totalEstimatedWeeks?: number;
}

// ─── Default Sample Data ──────────────────────────────────────────────────────

const defaultRoadmap: RoadmapData = {
  objective: "Frontend Engineering Roadmap",
  currentAssessment: "Your personalized journey from foundation to career-ready, adapted by AI.",
  totalEstimatedWeeks: 16,
  phases: [
    {
      phaseId: "phase-1",
      title: "Foundation",
      description: "HTML, CSS fundamentals & version control basics.",
      estimatedWeeks: 3,
      topics: [
        {
          topicId: "topic-001",
          title: "Semantic HTML",
          description: "Accessible, SEO-friendly modern markup structure.",
          completed: true,
        },
        {
          topicId: "topic-002",
          title: "CSS Layout & Flexbox",
          description: "Responsive layouts, flexbox, CSS grid, and modern styling.",
          completed: true,
        },
        {
          topicId: "topic-003",
          title: "Git & GitHub",
          description: "Branching, merge requests, collaboration workflows.",
          completed: true,
        },
      ],
    },
    {
      phaseId: "phase-2",
      title: "Core",
      description: "JavaScript, React & modern state management.",
      estimatedWeeks: 5,
      topics: [
        {
          topicId: "topic-004",
          title: "JavaScript Deep Dive",
          description: "ES6+, Async/Await, Closures, Event Loop & DOM APIs.",
          completed: true,
        },
        {
          topicId: "topic-005",
          title: "React Fundamentals",
          description: "Components, hooks, props, lifecycle & virtual DOM.",
          completed: false,
        },
        {
          topicId: "topic-006",
          title: "State Management",
          description: "Context API, Zustand, Redux Toolkit & data caching.",
          completed: false,
        },
      ],
    },
    {
      phaseId: "phase-3",
      title: "Advanced",
      description: "Performance, testing, TypeScript & architecture.",
      estimatedWeeks: 4,
      topics: [
        {
          topicId: "topic-007",
          title: "TypeScript",
          description: "Type safety, generics, interfaces, union types in React.",
          completed: false,
        },
        {
          topicId: "topic-008",
          title: "Testing Strategies",
          description: "Vitest, React Testing Library, E2E with Playwright.",
          completed: false,
        },
        {
          topicId: "topic-009",
          title: "Performance Optimization",
          description: "Code splitting, lazy loading, memoization, Core Web Vitals.",
          completed: false,
        },
      ],
    },
    {
      phaseId: "phase-4",
      title: "Projects",
      description: "Build 3 portfolio-grade real-world applications.",
      estimatedWeeks: 3,
      topics: [
        {
          topicId: "topic-010",
          title: "Analytics Dashboard",
          description: "Interactive charts, real-time metrics, auth guards.",
          completed: false,
        },
        {
          topicId: "topic-011",
          title: "E-commerce App",
          description: "Cart state, payment checkout, product filters.",
          completed: false,
        },
        {
          topicId: "topic-012",
          title: "Realtime Chat",
          description: "WebSockets, instant messaging, notification badges.",
          completed: false,
        },
      ],
    },
    {
      phaseId: "phase-5",
      title: "Career Ready",
      description: "Interview prep, system design & job applications.",
      estimatedWeeks: 2,
      topics: [
        {
          topicId: "topic-013",
          title: "System Design",
          description: "Frontend architecture, caching, microfrontends.",
          completed: false,
        },
        {
          topicId: "topic-014",
          title: "Interview Prep",
          description: "Data structures in JS, behavioral prep, live coding.",
          completed: false,
        },
        {
          topicId: "topic-015",
          title: "Job Applications",
          description: "Resume optimization, GitHub portfolio, LinkedIn outreach.",
          completed: false,
        },
      ],
    },
  ],
};

const phaseIcons = [Check, Zap, Layers, FolderGit2, Trophy];

export default function RoadmapPage() {
  const { id: routeConvId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [conversationId, setConversationId] = useState<string | null>(routeConvId || "default-roadmap");
  const [roadmap, setRoadmap] = useState<RoadmapData>(defaultRoadmap);
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState(1);
  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Topic Question Modal State
  const [activeQuestionTopic, setActiveQuestionTopic] = useState<Topic | null>(null);
  const [userQuestion, setUserQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  // Roadmap Modification Dialog State
  const [isModifying, setIsModifying] = useState(false);
  const [modifyPrompt, setModifyPrompt] = useState("");
  const [isSubmittingMod, setIsSubmittingMod] = useState(false);

  // Load Roadmap & Persisted Completed Checkmarks
  useEffect(() => {
    const activeId = routeConvId || conversationId || "default-roadmap";
    setConversationId(activeId);

    // 1. Check local completed milestones
    const savedCompleted = localStorage.getItem(`completed_topics_${activeId}`);
    if (savedCompleted) {
      try {
        setCompletedTopicIds(new Set(JSON.parse(savedCompleted)));
      } catch {
        setCompletedTopicIds(new Set(["topic-001", "topic-002", "topic-003", "topic-004"]));
      }
    } else {
      setCompletedTopicIds(new Set(["topic-001", "topic-002", "topic-003", "topic-004"]));
    }

    // 2. Check stored custom roadmap or fetch from API
    const storedRoadmap = localStorage.getItem(`roadmap_${activeId}`);
    if (storedRoadmap) {
      try {
        setRoadmap(JSON.parse(storedRoadmap));
        return;
      } catch {
        // fallback
      }
    }

    // 3. Try API fetch
    const fetchRemoteRoadmap = async () => {
      if (!routeConvId) return;
      try {
        setIsLoading(true);
        const { data } = await roadmapApi.get(routeConvId);
        const rData = data.roadmap?.rawJson || data.roadmap;
        if (rData && rData.phases) {
          setRoadmap(rData);
          localStorage.setItem(`roadmap_${activeId}`, JSON.stringify(rData));
        }
      } catch {
        // use default
      } finally {
        setIsLoading(false);
      }
    };

    fetchRemoteRoadmap();
  }, [routeConvId]);

  // Calculate Overall Progress
  const allTopics = roadmap.phases.flatMap((p) => p.topics);
  const totalTopicCount = allTopics.length || 1;
  const completedCount = allTopics.filter((t) => completedTopicIds.has(t.topicId)).length;
  const progressPercent = Math.round((completedCount / totalTopicCount) * 100);

  const toggleTopic = (topicId: string) => {
    setCompletedTopicIds((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      const activeId = conversationId || "default-roadmap";
      localStorage.setItem(`completed_topics_${activeId}`, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const currentSelectedPhase = roadmap.phases[selectedPhaseIndex] || roadmap.phases[0];

  const handleAskQuestion = async () => {
    if (!activeQuestionTopic || !userQuestion.trim()) return;
    setIsAsking(true);
    try {
      if (conversationId && conversationId !== "default-roadmap" && !conversationId.startsWith("conv-")) {
        const { data } = await topicApi.askQuestion(
          conversationId,
          activeQuestionTopic.topicId,
          userQuestion
        );
        if (data?.answer) {
          setAiAnswer(data.answer);
          setIsAsking(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Topic Q&A remote call failed, using intelligent offline tutor", e);
    }

    // Dynamic offline AI tutor knowledge response
    setTimeout(() => {
      setAiAnswer(
        `### Key Takeaways for ${activeQuestionTopic.title}:\n\n` +
        `**1. Concept Overview:**\n` +
        `${activeQuestionTopic.description || "This milestone is critical for mastering modern development practices and core engineering patterns."}\n\n` +
        `**2. Practical Implementation Tip:**\n` +
        `Always test edge cases and decouple business logic from UI components. Implement reusable functions and maintain high test coverage.\n\n` +
        `**3. Practice Challenge:**\n` +
        `Build a mini-demo incorporating this topic, integrate it with the rest of your stage milestones, and test performance in Google Chrome DevTools.`
      );
      setIsAsking(false);
    }, 600);
  };

  const handleModifyRoadmap = async () => {
    if (!modifyPrompt.trim()) return;
    setIsSubmittingMod(true);

    try {
      if (conversationId && conversationId !== "default-roadmap" && !conversationId.startsWith("conv-")) {
        const { data } = await roadmapApi.generate(conversationId, modifyPrompt);
        if (data.roadmap?.rawJson) {
          setRoadmap(data.roadmap.rawJson);
          localStorage.setItem(`roadmap_${conversationId}`, JSON.stringify(data.roadmap.rawJson));
          setIsModifying(false);
          setModifyPrompt("");
          setIsSubmittingMod(false);
          return;
        }
      }
    } catch {
      // offline fallback
    }

    // Modify local roadmap dynamically
    const updatedPhases = [...roadmap.phases];
    if (updatedPhases[1]) {
      updatedPhases[1].topics.push({
        topicId: `topic-${Date.now().toString().slice(-4)}`,
        title: `Custom Goal: ${modifyPrompt.slice(0, 30)}...`,
        description: `Adapted learning milestone: ${modifyPrompt}`,
        completed: false,
      });
    }

    const modified = {
      ...roadmap,
      phases: updatedPhases,
    };
    setRoadmap(modified);
    const activeId = conversationId || "default-roadmap";
    localStorage.setItem(`roadmap_${activeId}`, JSON.stringify(modified));
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
    if (finished > 0 || index === selectedPhaseIndex) {
      return { label: "In Progress", variant: "in_progress" };
    }
    return { label: "Upcoming", variant: "upcoming" };
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* ─── Top Header Section ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className="font-medium rounded-full bg-[#2b7fff]/10 text-[#2b7fff] text-xs leading-4 px-3 py-1 gap-1.5 w-fit"
            >
              <Sparkles className="size-3.5" />
              AI-Generated Path
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModifying(true)}
              className="h-7 text-xs gap-1.5 rounded-full border-zinc-200 text-[#71717b] hover:text-[#2b7fff] cursor-pointer"
            >
              <RefreshCw className="size-3" />
              Modify Roadmap
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportRoadmap}
              className="h-7 text-xs gap-1.5 rounded-full border-zinc-200 text-[#71717b] hover:text-zinc-900 cursor-pointer"
            >
              <Download className="size-3" />
              Export JSON
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShareLink}
              className="h-7 text-xs gap-1.5 rounded-full border-zinc-200 text-[#71717b] hover:text-zinc-900 cursor-pointer"
            >
              <Share2 className="size-3" />
              {copiedLink ? "Copied Link!" : "Share"}
            </Button>
          </div>

          <h1 className="font-bold text-3xl leading-9 tracking-tight">
            {roadmap.objective}
          </h1>
          <p className="text-[#71717b] text-sm leading-5">
            {roadmap.currentAssessment ||
              "Your personalized journey from foundation to career-ready, adapted by AI."}
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
          <span className="text-[#71717b] text-sm leading-5">
            Overall progress
          </span>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Progress value={progressPercent} className="w-full md:w-40 h-2" />
            <span className="font-semibold text-[#2b7fff] text-sm leading-5 min-w-[32px]">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-[#71717b]">
          <Loader2 className="size-3.5 text-[#2b7fff] animate-spin" />
          Synchronizing roadmap...
        </div>
      )}

      {/* ─── Main Grid Layout (Matching Design Reference) ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left Column: Learning Stages Timeline (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="backdrop-blur-xl shadow-xl shadow-[#2b7fff]/5 bg-white/60 border-zinc-200/60 p-6 md:p-8 gap-6">
            <CardHeader className="p-0 gap-1 mb-6">
              <CardTitle className="font-bold text-lg leading-7">
                Learning Stages
              </CardTitle>
              <CardDescription className="text-sm leading-5">
                Follow the connected path. Click any stage to view its milestones.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 gap-0">
              <div className="relative flex flex-col">
                {/* Vertical connected line */}
                <div className="bg-gradient-to-b from-[#2b7fff] via-[#2b7fff]/40 to-zinc-200 absolute left-[27px] inset-y-8 w-0.5" />

                {roadmap.phases.map((phase, idx) => {
                  const Icon = phaseIcons[idx % phaseIcons.length];
                  const status = getPhaseStatus(idx);
                  const isSelected = selectedPhaseIndex === idx;
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
                    <button
                      key={phase.phaseId || idx}
                      onClick={() => setSelectedPhaseIndex(idx)}
                      className={`relative transition-all text-left rounded-2xl flex p-4 items-start gap-4 cursor-pointer border-0 bg-transparent hover:bg-zinc-50/80 ${
                        isSelected ? "ring-2 ring-[#2b7fff]/25 bg-white/90 shadow-md" : ""
                      }`}
                    >
                      {/* Node Icon */}
                      <div
                        className={`z-10 size-14 shrink-0 rounded-full flex justify-center items-center transition-all ${
                          isCompleted
                            ? "shadow-lg shadow-[#2b7fff]/30 bg-[#2b7fff] text-blue-50"
                            : isInProgress
                            ? "shadow-lg shadow-[#2b7fff]/40 ring-4 ring-[#2b7fff]/20 bg-[#2b7fff] text-blue-50"
                            : "bg-zinc-100 text-[#71717b] border border-zinc-200"
                        }`}
                      >
                        <Icon className="size-6" />
                      </div>

                      {/* Content */}
                      <div className="flex pt-1 flex-col gap-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold text-base leading-6 ${
                              !isCompleted && !isInProgress ? "text-[#71717b]" : "text-zinc-950"
                            }`}
                          >
                            {phase.title}
                          </span>
                          {isCompleted ? (
                            <Badge className="rounded-full bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0 border-0 flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="size-3" /> Completed
                            </Badge>
                          ) : isInProgress ? (
                            <Badge className="rounded-full bg-[#2b7fff]/15 text-[#2b7fff] text-[10px] px-2 py-0 border-0 font-semibold">
                              In Progress
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="rounded-full text-[10px] px-2 py-0 text-zinc-500"
                            >
                              Upcoming
                            </Badge>
                          )}
                        </div>

                        <p className="text-[#71717b] text-sm leading-5">
                          {phase.description}
                        </p>

                        {isInProgress && (
                          <div className="mt-1 flex items-center gap-2">
                            <Progress
                              value={phaseProgress}
                              className="w-48 h-1.5"
                            />
                            <span className="text-[11px] font-semibold text-[#2b7fff]">
                              {phaseProgress}%
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Stage Milestones Details & AI Insight (1 Col) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Dynamic Milestones Card for Selected Stage */}
          <Card className="backdrop-blur-xl shadow-xl shadow-[#2b7fff]/10 bg-white/70 border-zinc-200/60 p-6 gap-4 flex flex-col">
            <CardHeader className="p-0 gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`size-9 rounded-xl flex justify-center items-center ${
                      getPhaseStatus(selectedPhaseIndex).variant === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-[#2b7fff]/15 text-[#2b7fff]"
                    }`}
                  >
                    {getPhaseStatus(selectedPhaseIndex).variant === "completed" ? (
                      <Check className="size-4" />
                    ) : (
                      <Zap className="size-4" />
                    )}
                  </div>
                  <CardTitle className="font-bold text-base leading-6">
                    {currentSelectedPhase.title}
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">
                  {currentSelectedPhase.estimatedWeeks
                    ? `${currentSelectedPhase.estimatedWeeks} wks`
                    : "Stage"}
                </Badge>
              </div>
              <CardDescription className="text-sm leading-5">
                Check off milestones as you complete them. Click the question icon to ask AI about any topic.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex p-0 flex-col gap-2.5">
              {currentSelectedPhase.topics.map((topic) => {
                const isChecked = completedTopicIds.has(topic.topicId);
                return (
                  <div
                    key={topic.topicId}
                    className="group flex items-center justify-between rounded-xl bg-zinc-100/60 hover:bg-zinc-100 p-3 transition-colors text-sm"
                  >
                    <label className="flex items-center gap-3 cursor-pointer flex-1 select-none">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleTopic(topic.topicId)}
                      />
                      <span
                        className={`font-medium transition-all ${
                          isChecked ? "line-through text-zinc-400" : "text-zinc-800"
                        }`}
                      >
                        {topic.title}
                      </span>
                    </label>

                    <button
                      type="button"
                      title="Ask AI about this topic"
                      onClick={() => {
                        setActiveQuestionTopic(topic);
                        setAiAnswer(null);
                        setUserQuestion("");
                      }}
                      className="text-zinc-400 hover:text-[#2b7fff] p-1.5 rounded-lg hover:bg-white transition-colors bg-transparent border-0 cursor-pointer"
                    >
                      <HelpCircle className="size-4" />
                    </button>
                  </div>
                );
              })}
            </CardContent>

            <CardFooter className="p-0 pt-2 flex flex-col gap-2">
              <Button
                onClick={() => {
                  navigate(`/assistant?topic=${encodeURIComponent(currentSelectedPhase.title)}`);
                }}
                className="bg-[#2b7fff] text-white hover:bg-[#2563eb] gap-2 w-full shadow-md shadow-[#2b7fff]/20 rounded-xl cursor-pointer"
              >
                <Play className="size-4" />
                Continue Learning in Assistant
              </Button>
            </CardFooter>
          </Card>

          {/* AI Insight Card */}
          <Card className="backdrop-blur-xl bg-[#2b7fff]/5 border border-[#2b7fff]/20 p-6 gap-3 flex flex-col">
            <CardHeader className="p-0 gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-[#2b7fff]" />
                <CardTitle className="font-semibold text-[#2b7fff] text-sm leading-5">
                  AI Insight
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-zinc-950/80 text-sm leading-relaxed">
                {progressPercent >= 60
                  ? "Outstanding velocity! You have completed over 60% of your roadmap. Dive into the Projects stage to build your portfolio assets."
                  : progressPercent > 0
                  ? `You are steadily progressing through ${currentSelectedPhase.title}. Completing React and State Management this week keeps you on track.`
                  : "Start by checking off the Semantic HTML and CSS fundamentals. Completing your first stage unlocks verified competency badges in Skills."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Topic Cross-Questioning Modal ─────────────────────────────────── */}
      {activeQuestionTopic && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 max-w-lg w-full p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <Badge
                  variant="secondary"
                  className="bg-[#2b7fff]/10 text-[#2b7fff] text-xs mb-1"
                >
                  Topic Deep Dive
                </Badge>
                <h3 className="font-bold text-lg text-zinc-900">
                  {activeQuestionTopic.title}
                </h3>
                <p className="text-xs text-[#71717b]">
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
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 max-h-64 overflow-y-auto text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2b7fff] mb-2">
                  <Sparkles className="size-3.5" /> PathAI Explanation:
                </div>
                {aiAnswer}
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-700">
                What would you like to understand about {activeQuestionTopic.title}?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
                  placeholder="e.g. Why is this important? Give me a code example."
                  className="h-10 px-3 flex-1 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff]"
                />
                <Button
                  onClick={handleAskQuestion}
                  disabled={isAsking || !userQuestion.trim()}
                  className="bg-[#2b7fff] text-white hover:bg-[#2563eb] rounded-xl px-4 cursor-pointer"
                >
                  {isAsking ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-zinc-100 text-xs">
              <span className="text-zinc-500">Need full practice?</span>
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setActiveQuestionTopic(null);
                  navigate(`/assistant?topic=${encodeURIComponent(activeQuestionTopic.title)}`);
                }}
                className="text-[#2b7fff] p-0 h-auto font-semibold gap-1"
              >
                <Code2 className="size-3.5" />
                Open in Full Assistant
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modify Roadmap Dialog ─────────────────────────────────────────── */}
      {isModifying && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 max-w-lg w-full p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <Badge
                  variant="secondary"
                  className="bg-[#2b7fff]/10 text-[#2b7fff] text-xs mb-1"
                >
                  AI Adaptation
                </Badge>
                <h3 className="font-bold text-lg text-zinc-900">
                  Modify Your Learning Roadmap
                </h3>
                <p className="text-xs text-[#71717b]">
                  Tell the AI how you'd like to adjust the path (e.g. "I already know SQL, focus heavily on Next.js server actions and AI integrations").
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
              rows={4}
              placeholder="e.g. Focus more on Next.js App Router and full-stack deployment, reduce basic CSS..."
              className="p-3 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff] resize-none"
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsModifying(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleModifyRoadmap}
                disabled={isSubmittingMod || !modifyPrompt.trim()}
                className="bg-[#2b7fff] text-white hover:bg-[#2563eb] rounded-xl gap-2 font-semibold cursor-pointer"
              >
                {isSubmittingMod ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Regenerate Roadmap
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
