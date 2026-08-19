import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Compass,
  Target,
  Clock,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { contextApi, roadmapApi, conversationsApi } from "@/lib/api";

const popularGoalPresets = [
  {
    goal: "Frontend Engineering with React 19 & TypeScript",
    skills: ["HTML", "CSS", "JavaScript"],
    level: "beginner",
    depth: "balanced",
  },
  {
    goal: "Full-Stack AI Agent & Next.js System Developer",
    skills: ["JavaScript", "Python", "React", "Git"],
    level: "intermediate",
    depth: "deep",
  },
  {
    goal: "Backend Architecture, PostgreSQL & Microservices",
    skills: ["Node.js", "SQL", "Express"],
    level: "intermediate",
    depth: "deep",
  },
  {
    goal: "Cloud DevOps, Docker & Kubernetes CI/CD",
    skills: ["Linux", "Git", "Docker"],
    level: "beginner",
    depth: "balanced",
  },
];

export default function QuestionnairePage() {
  const { id: routeConvId } = useParams<{ id: string }>();
  const conversationId = routeConvId || `conv-${Date.now()}`;
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Form State
  const [learningGoal, setLearningGoal] = useState("");
  const [motivation, setMotivation] = useState("");
  const [currentLevel, setCurrentLevel] = useState("beginner");
  const [skillsInput, setSkillsInput] = useState("");
  const [existingSkills, setExistingSkills] = useState<string[]>([]);
  const [currentlyLearning, setCurrentlyLearning] = useState("");
  const [nextToLearn, setNextToLearn] = useState("");
  const [depthPreference, setDepthPreference] = useState("balanced");
  const [weeklyHours, setWeeklyHours] = useState<number>(10);
  const [targetOutcome, setTargetOutcome] = useState("");
  const [preferences, setPreferences] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  const handleApplyPreset = (preset: typeof popularGoalPresets[0]) => {
    setLearningGoal(preset.goal);
    setExistingSkills(preset.skills);
    setCurrentLevel(preset.level);
    setDepthPreference(preset.depth);
  };

  const handleAddSkill = () => {
    if (skillsInput.trim() && !existingSkills.includes(skillsInput.trim())) {
      setExistingSkills([...existingSkills, skillsInput.trim()]);
      setSkillsInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setExistingSkills(existingSkills.filter((s) => s !== skill));
  };

  const handleKeyDownSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const generateOfflineCustomRoadmap = () => {
    const goalTitle = learningGoal.trim() || "Full-Stack Development Roadmap";
    return {
      objective: goalTitle,
      currentAssessment: `Custom learning journey tailored for ${currentLevel} level focusing on ${depthPreference} depth (${weeklyHours} hours/week).`,
      totalEstimatedWeeks: Math.ceil(40 / Math.max(1, weeklyHours / 4)),
      phases: [
        {
          phaseId: "phase-1",
          title: "Foundation & Core Fundamentals",
          description: `Master fundamental building blocks and syntax related to ${goalTitle}.`,
          estimatedWeeks: 3,
          topics: [
            {
              topicId: "topic-001",
              title: `${goalTitle.split(" ")[0]} Architecture & Syntax`,
              description: "Core concepts, language paradigms, and environment configuration.",
              completed: true,
            },
            {
              topicId: "topic-002",
              title: "Modern Workflows & Tooling",
              description: "Version control, package managers, and development best practices.",
              completed: true,
            },
            {
              topicId: "topic-003",
              title: "Hands-on Practical Foundations",
              description: "Essential patterns and practical coding exercises.",
              completed: false,
            },
          ],
        },
        {
          phaseId: "phase-2",
          title: "Core Frameworks & State Architecture",
          description: "Building production-grade components, data flow, and modern integrations.",
          estimatedWeeks: 4,
          topics: [
            {
              topicId: "topic-004",
              title: "Component & Data Architecture",
              description: "State synchronization, asynchronous operations, and lifecycle management.",
              completed: false,
            },
            {
              topicId: "topic-005",
              title: "API Client & Data Fetching",
              description: "RESTful & GraphQL endpoints, error boundaries, and optimistic mutations.",
              completed: false,
            },
            {
              topicId: "topic-006",
              title: "Performance Optimization",
              description: "Memory optimization, caching strategies, and code splitting.",
              completed: false,
            },
          ],
        },
        {
          phaseId: "phase-3",
          title: "Advanced Engineering & Testing",
          description: "End-to-end testing, security guards, type safety, and robust architecture.",
          estimatedWeeks: 4,
          topics: [
            {
              topicId: "topic-007",
              title: "Comprehensive Automated Testing",
              description: "Unit tests, integration suites, and CI/CD quality gates.",
              completed: false,
            },
            {
              topicId: "topic-008",
              title: "Security & Auth Patterns",
              description: "Session management, JWT authentication, and token refresh rotations.",
              completed: false,
            },
          ],
        },
        {
          phaseId: "phase-4",
          title: "Portfolio Capstone Projects",
          description: targetOutcome || "Build 3 portfolio-grade real-world applications.",
          estimatedWeeks: 3,
          topics: [
            {
              topicId: "topic-009",
              title: "Real-time Production Application",
              description: "Full-stack deployment with live database and user authentication.",
              completed: false,
            },
            {
              topicId: "topic-010",
              title: "Scalable Distributed System Demo",
              description: "Microservice or caching pipeline demonstrating senior engineering depth.",
              completed: false,
            },
          ],
        },
        {
          phaseId: "phase-5",
          title: "Career & Interview Mastery",
          description: "System design interviews, algorithm challenges, and technical portfolio review.",
          estimatedWeeks: 2,
          topics: [
            {
              topicId: "topic-011",
              title: "System Design Deep Dive",
              description: "Architectural trade-offs, scalability, and technical communication.",
              completed: false,
            },
            {
              topicId: "topic-012",
              title: "Live Technical Interview Prep",
              description: "Mock coding sessions, behavioral alignment, and portfolio walk-through.",
              completed: false,
            },
          ],
        },
      ],
    };
  };

  const handleSubmit = async () => {
    if (!learningGoal.trim()) {
      setError("Please specify your learning goal.");
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    setError("");
    setStatusMessage("Saving your personalized learning profile...");

    const contextPayload = {
      learningGoal,
      motivation,
      currentLevel,
      existingSkills,
      currentlyLearning,
      nextToLearn,
      depthPreference,
      weeklyHours: Number(weeklyHours),
      targetOutcome,
      preferences,
    };

    let activeConvId = conversationId;
    if (!activeConvId || activeConvId === "new" || activeConvId.startsWith("conv-")) {
      try {
        const { data: convData } = await conversationsApi.create(learningGoal.trim() || "My Learning Path");
        if (convData?.conversation?.id) {
          activeConvId = convData.conversation.id;
        }
      } catch (convErr) {
        console.warn("Could not create remote conversation, using fallback ID", convErr);
      }
    }

    // Save context locally
    localStorage.setItem(`context_${activeConvId}`, JSON.stringify(contextPayload));

    try {
      await contextApi.save(activeConvId, contextPayload);
      setStatusMessage("AI is designing your custom learning roadmap...");
      const { data } = await roadmapApi.generate(activeConvId);
      if (data?.roadmap) {
        const roadmapObj = data.roadmap.rawJson || data.roadmap;
        localStorage.setItem(`roadmap_${activeConvId}`, JSON.stringify(roadmapObj));
      }
    } catch {
      // Offline fallback: generate structured custom roadmap
      const generated = generateOfflineCustomRoadmap();
      localStorage.setItem(`roadmap_${activeConvId}`, JSON.stringify(generated));

      // Add to local conversations list in dashboard
      const existingList = JSON.parse(localStorage.getItem("local_conversations") || "[]");
      const newConv = {
        id: activeConvId,
        title: learningGoal.trim(),
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        progress: 0,
        category: "Custom Path",
        learningContext: contextPayload,
        roadmap: generated,
      };
      localStorage.setItem("local_conversations", JSON.stringify([newConv, ...existingList]));
    }

    // Navigate to the newly crafted roadmap
    setTimeout(() => {
      navigate(`/conversations/${activeConvId}/roadmap`);
    }, 400);
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      {/* Header */}
      <div className="text-center mb-8 flex flex-col items-center gap-2">
        <Badge
          variant="secondary"
          className="font-medium rounded-full bg-[#2b7fff]/10 text-[#2b7fff] text-xs px-3 py-1 gap-1.5 w-fit"
        >
          <Sparkles className="size-3.5" />
          AI Learning Profiler
        </Badge>
        <h1 className="font-bold text-3xl tracking-tight">
          Personalize Your Learning Path
        </h1>
        <p className="text-sm text-[#71717b] max-w-md">
          Answer a few quick questions so our AI can craft an optimal roadmap structured for your level and goals.
        </p>

        {/* Stepper indicators */}
        <div className="flex items-center gap-2 mt-4">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === idx + 1
                  ? "w-8 bg-[#2b7fff]"
                  : step > idx + 1
                  ? "w-2 bg-emerald-500"
                  : "w-2 bg-zinc-200"
              }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {isSubmitting ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center gap-6 backdrop-blur-xl bg-white/70 border-zinc-200/60 shadow-xl">
          <div className="relative flex items-center justify-center">
            <div className="size-20 rounded-full border-4 border-[#2b7fff]/20 border-t-[#2b7fff] animate-spin" />
            <Sparkles className="size-8 text-[#2b7fff] absolute animate-pulse" />
          </div>
          <div className="flex flex-col gap-2 max-w-sm">
            <h3 className="font-bold text-xl text-zinc-900">Crafting Your Roadmap</h3>
            <p className="text-sm text-[#71717b]">{statusMessage}</p>
          </div>
        </Card>
      ) : (
        <Card className="backdrop-blur-xl bg-white/70 border-zinc-200/60 shadow-xl shadow-[#2b7fff]/5 p-8">
          {/* STEP 1: Goal & Motivation */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <CardHeader className="p-0 gap-1">
                <div className="flex items-center gap-2 text-[#2b7fff] font-semibold text-xs tracking-wider uppercase">
                  <Target className="size-4" /> Step 1: Core Goal
                </div>
                <CardTitle className="text-xl">What do you want to learn?</CardTitle>
                <CardDescription>
                  Choose a preset or type your custom goal (e.g. "Full-stack React & Node developer", "Kubernetes & DevOps").
                </CardDescription>
              </CardHeader>

              {/* Quick Goal Presets */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                  Popular Goal Templates:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {popularGoalPresets.map((preset) => (
                    <button
                      key={preset.goal}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        learningGoal === preset.goal
                          ? "border-[#2b7fff] bg-[#2b7fff]/10 text-[#2b7fff] font-bold ring-1 ring-[#2b7fff]"
                          : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700"
                      }`}
                    >
                      {preset.goal}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-zinc-800">
                    Primary Learning Goal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={learningGoal}
                    onChange={(e) => setLearningGoal(e.target.value)}
                    placeholder="e.g. Frontend Engineering with React & Next.js"
                    className="h-11 px-4 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-zinc-800">
                    Why do you want to learn this? (Motivation)
                  </label>
                  <textarea
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    rows={3}
                    placeholder="e.g. Transitioning careers, preparing for tech interviews, building a SaaS startup..."
                    className="p-3 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff] transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Current Experience */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <CardHeader className="p-0 gap-1">
                <div className="flex items-center gap-2 text-[#2b7fff] font-semibold text-xs tracking-wider uppercase">
                  <Compass className="size-4" /> Step 2: Experience & Skills
                </div>
                <CardTitle className="text-xl">What is your current level?</CardTitle>
                <CardDescription>
                  This ensures we tailor the difficulty and pacing precisely to your background.
                </CardDescription>
              </CardHeader>

              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "beginner", label: "Beginner", desc: "Starting from scratch" },
                    { id: "intermediate", label: "Intermediate", desc: "Have basics, need depth" },
                    { id: "advanced", label: "Advanced", desc: "Mastery & architecture" },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setCurrentLevel(lvl.id)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        currentLevel === lvl.id
                          ? "border-[#2b7fff] bg-[#2b7fff]/5 ring-2 ring-[#2b7fff]/20"
                          : "border-zinc-200 hover:border-zinc-300 bg-white"
                      }`}
                    >
                      <div className="font-semibold text-sm">{lvl.label}</div>
                      <div className="text-xs text-[#71717b] mt-1">{lvl.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-zinc-800">
                    Existing Skills / Tools you already know
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      onKeyDown={handleKeyDownSkill}
                      placeholder="Type a skill and press Enter (e.g. HTML, JavaScript, Git)"
                      className="h-10 px-3 flex-1 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddSkill}
                      className="rounded-xl"
                    >
                      Add
                    </Button>
                  </div>
                  {existingSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {existingSkills.map((sk) => (
                        <Badge
                          key={sk}
                          variant="secondary"
                          className="bg-zinc-100 text-zinc-800 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                        >
                          {sk}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(sk)}
                            className="text-zinc-400 hover:text-zinc-700 font-bold ml-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-zinc-800">
                    What are you currently studying/practicing? (Optional)
                  </label>
                  <input
                    type="text"
                    value={currentlyLearning}
                    onChange={(e) => setCurrentlyLearning(e.target.value)}
                    placeholder="e.g. Async JavaScript & promises"
                    className="h-10 px-3 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Learning Pace & Depth */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              <CardHeader className="p-0 gap-1">
                <div className="flex items-center gap-2 text-[#2b7fff] font-semibold text-xs tracking-wider uppercase">
                  <Clock className="size-4" /> Step 3: Commitment & Depth
                </div>
                <CardTitle className="text-xl">Pace and Depth Preferences</CardTitle>
                <CardDescription>
                  Help us estimate timeframes and tailor the depth of topics.
                </CardDescription>
              </CardHeader>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-zinc-800">
                    Depth Preference
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "surface", label: "Fast & Broad", desc: "Overview & quick wins" },
                      { id: "balanced", label: "Balanced", desc: "Solid theory + practicals" },
                      { id: "deep", label: "Deep Dive", desc: "Under the hood & internals" },
                    ].map((dp) => (
                      <button
                        key={dp.id}
                        type="button"
                        onClick={() => setDepthPreference(dp.id)}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          depthPreference === dp.id
                            ? "border-[#2b7fff] bg-[#2b7fff]/5 ring-2 ring-[#2b7fff]/20"
                            : "border-zinc-200 hover:border-zinc-300 bg-white"
                        }`}
                      >
                        <div className="font-semibold text-sm">{dp.label}</div>
                        <div className="text-xs text-[#71717b] mt-1">{dp.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-zinc-800">
                      Weekly Hours Available: <span className="text-[#2b7fff] font-bold">{weeklyHours} hrs/week</span>
                    </label>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={40}
                    step={2}
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(Number(e.target.value))}
                    className="w-full accent-[#2b7fff] cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-[#71717b]">
                    <span>2 hrs (Casual)</span>
                    <span>15 hrs (Regular)</span>
                    <span>40 hrs (Full-time)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Target Outcome & Specifics */}
          {step === 4 && (
            <div className="flex flex-col gap-6">
              <CardHeader className="p-0 gap-1">
                <div className="flex items-center gap-2 text-[#2b7fff] font-semibold text-xs tracking-wider uppercase">
                  <Code2 className="size-4" /> Step 4: Target Outcome & Final Notes
                </div>
                <CardTitle className="text-xl">What should you be able to build?</CardTitle>
                <CardDescription>
                  Define what success looks like upon completing this learning path.
                </CardDescription>
              </CardHeader>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-zinc-800">
                    Target Outcome / Dream Project
                  </label>
                  <textarea
                    value={targetOutcome}
                    onChange={(e) => setTargetOutcome(e.target.value)}
                    rows={3}
                    placeholder="e.g. Build and deploy a full-stack SaaS with payments, auth, and AI features"
                    className="p-3 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff] transition-all resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-zinc-800">
                    What would you like to tackle right after this? (Next to learn)
                  </label>
                  <input
                    type="text"
                    value={nextToLearn}
                    onChange={(e) => setNextToLearn(e.target.value)}
                    placeholder="e.g. React Native or Rust backend"
                    className="h-10 px-3 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-zinc-800">
                    Any specific tools, preferences or constraints?
                  </label>
                  <input
                    type="text"
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    placeholder="e.g. Prefer project-based learning, TypeScript only, ignore GraphQL"
                    className="h-11 px-4 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff] transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-200/60">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="gap-2 rounded-xl"
              >
                <ArrowLeft className="size-4" />
                Previous
              </Button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <Button
                type="button"
                onClick={() => {
                  if (step === 1 && !learningGoal.trim()) {
                    setError("Please enter a learning goal to proceed.");
                    return;
                  }
                  setError("");
                  setStep(step + 1);
                }}
                className="bg-[#2b7fff] text-white hover:bg-[#2563eb] gap-2 rounded-xl"
              >
                Continue
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                className="bg-[#2b7fff] text-white hover:bg-[#2563eb] gap-2 rounded-xl shadow-lg shadow-[#2b7fff]/20 font-semibold cursor-pointer"
              >
                <Sparkles className="size-4" />
                Generate My Roadmap
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
