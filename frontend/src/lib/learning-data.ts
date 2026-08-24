import { conversationsApi } from "./api";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface TopicItem {
  topicId: string;
  title: string;
  description?: string;
  estimatedHours?: number;
  completed?: boolean;
}

export interface PhaseItem {
  phaseId: string;
  title: string;
  description?: string;
  estimatedWeeks?: number;
  topics: TopicItem[];
}

export interface RoadmapStructure {
  objective: string;
  currentAssessment?: string;
  phases: PhaseItem[];
  finalOutcome?: string;
  totalEstimatedWeeks?: number;
}

export interface LearningPathItem {
  id: string;
  title: string;
  category: string;
  status: "ACTIVE" | "COMPLETED" | "DRAFT";
  progress: number;
  totalTopics: number;
  completedTopicsCount: number;
  currentMilestone: string;
  currentPhaseTitle: string;
  nextMilestone: string;
  remainingHours: number;
  createdAt: string;
  updatedAt?: string;
  learningContext?: {
    learningGoal?: string;
    currentLevel?: string;
    weeklyHours?: number;
    targetOutcome?: string;
  } | null;
  roadmap?: RoadmapStructure | null;
}

export interface ActivityDay {
  dateStr: string;
  dayName: string;
  hours: number;
  milestones: number;
  isToday: boolean;
}

export interface SkillCompetency {
  id: string;
  category: "Frontend" | "Backend" | "AI & LLM" | "DevOps" | "System Design";
  score: number; // 0 to 100
  level: "Mastered" | "In Progress" | "Developing";
  completedCount: number;
  totalCount: number;
  description: string;
}

export interface AIInsightData {
  title: string;
  badgeText: string;
  type: "strength" | "gap" | "velocity" | "recommendation";
  strongestArea: string;
  largestSkillGap: string;
  summary: string;
  actionRecommendation: string;
  actionPathId?: string;
}

export interface DashboardFullData {
  stats: {
    totalPaths: number;
    activePaths: number;
    completedPaths: number;
    totalCompletedMilestones: number;
    totalMilestones: number;
    totalLearningHours: number;
    matchScore: string; // e.g. "4.8 / 5.0" or "—"
    fitPercent: number; // e.g. 96 or 0
  };
  continueLearning: LearningPathItem | null;
  aiInsight: AIInsightData;
  weeklyActivity: ActivityDay[];
  skillCompetencies: SkillCompetency[];
  learningPaths: LearningPathItem[];
}

// ─── Default Fallback Roadmaps ────────────────────────────────────────────────

export const defaultCuratedRoadmapsData: Record<string, RoadmapStructure> = {
  "fe-roadmap-01": {
    objective: "Frontend Engineering Roadmap",
    currentAssessment: "Personalized path from DOM & ECMAScript fundamentals to React 19 and scalable UI architecture.",
    totalEstimatedWeeks: 10,
    phases: [
      {
        phaseId: "p1",
        title: "Foundation & Modern ECMAScript",
        estimatedWeeks: 2,
        topics: [
          { topicId: "topic-001", title: "Semantic HTML5 & Accessible ARIA", estimatedHours: 3 },
          { topicId: "topic-002", title: "CSS3 Flexbox, Grid & Responsive Layouts", estimatedHours: 4 },
          { topicId: "topic-003", title: "Modern JavaScript (ES6+ Async/Await & Event Loop)", estimatedHours: 5 },
          { topicId: "topic-004", title: "Git Workflows & Clean Branching Strategy", estimatedHours: 2 },
        ],
      },
      {
        phaseId: "p2",
        title: "Core React 19 & State Architecture",
        estimatedWeeks: 3,
        topics: [
          { topicId: "topic-005", title: "React 19 Hooks, Fiber Diffing & Virtual DOM", estimatedHours: 6 },
          { topicId: "topic-006", title: "Zustand & Persistent State Stores", estimatedHours: 4 },
          { topicId: "topic-007", title: "Server State Caching with TanStack Query", estimatedHours: 5 },
          { topicId: "topic-008", title: "TypeScript Generics & React Component Typing", estimatedHours: 5 },
        ],
      },
      {
        phaseId: "p3",
        title: "Advanced Performance & Microfrontends",
        estimatedWeeks: 3,
        topics: [
          { topicId: "topic-009", title: "Core Web Vitals & Bundle Optimization", estimatedHours: 4 },
          { topicId: "topic-010", title: "Automated Testing with Vitest & Playwright", estimatedHours: 6 },
          { topicId: "topic-011", title: "Component Design Systems with Tailwind & Radix", estimatedHours: 4 },
        ],
      },
      {
        phaseId: "p4",
        title: "Production Projects & Capstones",
        estimatedWeeks: 2,
        topics: [
          { topicId: "topic-012", title: "High-Throughput Analytics Dashboard", estimatedHours: 8 },
          { topicId: "topic-013", title: "Real-time Collaborative Canvas App", estimatedHours: 8 },
        ],
      },
    ],
  },
  "ai-roadmap-02": {
    objective: "Full-Stack AI Agents & LLM Systems",
    currentAssessment: "Design autonomous tool-calling agents, RAG vector pipelines, and streaming LLM backends.",
    totalEstimatedWeeks: 12,
    phases: [
      {
        phaseId: "p1",
        title: "Prompt Engineering & Structured JSON",
        estimatedWeeks: 2,
        topics: [
          { topicId: "topic-ai-01", title: "Few-Shot Prompting & JSON Schema Enforcement", estimatedHours: 3 },
          { topicId: "topic-ai-02", title: "OpenAI & Anthropic SDK Function Calling", estimatedHours: 4 },
          { topicId: "topic-ai-03", title: "LangChain Expression Language (LCEL) Chains", estimatedHours: 5 },
        ],
      },
      {
        phaseId: "p2",
        title: "RAG & Vector Similarity Search",
        estimatedWeeks: 4,
        topics: [
          { topicId: "topic-ai-04", title: "Text Chunking & Embedding Generation", estimatedHours: 4 },
          { topicId: "topic-ai-05", title: "Pinecone / PGVector Hybrid Retrieval", estimatedHours: 5 },
          { topicId: "topic-ai-06", title: "Context Window Optimization & Re-Ranking", estimatedHours: 4 },
        ],
      },
      {
        phaseId: "p3",
        title: "Autonomous Multi-Agent Systems",
        estimatedWeeks: 3,
        topics: [
          { topicId: "topic-ai-07", title: "ReAct Loops & Tool Orchestration Pipelines", estimatedHours: 6 },
          { topicId: "topic-ai-08", title: "Multi-Agent Collaboration with LangGraph", estimatedHours: 6 },
          { topicId: "topic-ai-09", title: "Streaming Fastify & Server-Sent Events (SSE)", estimatedHours: 5 },
        ],
      },
      {
        phaseId: "p4",
        title: "Production AI Deployment & Guardrails",
        estimatedWeeks: 3,
        topics: [
          { topicId: "topic-ai-10", title: "Guardrails, Hallucination Checks & Evals", estimatedHours: 5 },
          { topicId: "topic-ai-11", title: "Full-Stack Autonomous Code Assistant Capstone", estimatedHours: 10 },
        ],
      },
    ],
  },
  "devops-roadmap-03": {
    objective: "DevOps, Docker & Kubernetes CI/CD",
    currentAssessment: "Containerize microservices, deploy resilient Kubernetes clusters, and automate zero-downtime releases.",
    totalEstimatedWeeks: 8,
    phases: [
      {
        phaseId: "p1",
        title: "Linux Internals & Scripting",
        estimatedWeeks: 2,
        topics: [
          { topicId: "topic-do-01", title: "Linux System Internals, Permissions & Bash", estimatedHours: 4 },
          { topicId: "topic-do-02", title: "Networking Fundamentals, DNS, SSL & Reverse Proxies", estimatedHours: 4 },
        ],
      },
      {
        phaseId: "p2",
        title: "Docker & Container Architecture",
        estimatedWeeks: 2,
        topics: [
          { topicId: "topic-do-03", title: "Multi-Stage Zero-Vulnerability Dockerfiles", estimatedHours: 4 },
          { topicId: "topic-do-04", title: "Docker Compose Microservice Networks", estimatedHours: 4 },
        ],
      },
      {
        phaseId: "p3",
        title: "Kubernetes Orchestration & Helm",
        estimatedWeeks: 2,
        topics: [
          { topicId: "topic-do-05", title: "Pods, Deployments, Services & Ingress Controllers", estimatedHours: 6 },
          { topicId: "topic-do-06", title: "ConfigMaps, Secrets & Helm Package Manager", estimatedHours: 5 },
        ],
      },
      {
        phaseId: "p4",
        title: "Automated GitHub Actions CI/CD",
        estimatedWeeks: 2,
        topics: [
          { topicId: "topic-do-07", title: "Automated Test & Build Workflow Pipelines", estimatedHours: 6 },
          { topicId: "topic-do-08", title: "Zero-Downtime Blue-Green & Canary Deployments", estimatedHours: 6 },
        ],
      },
    ],
  },
};

// ─── Event Dispatcher & Listener for Real-Time UI Sync ───────────────────────

const PROGRESS_EVENT_NAME = "pathai_progress_updated";

/**
 * Dispatch a live progress update event to all active components and browser tabs.
 */
export function dispatchProgressUpdate(details?: Record<string, any>) {
  if (typeof window === "undefined") return;
  const timestamp = Date.now().toString();
  localStorage.setItem("pathai_last_progress_update", timestamp);
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT_NAME, { detail: { timestamp, ...details } }));
}

/**
 * Subscribe to live progress updates (e.g. when milestones are checked in RoadmapPage).
 */
export function subscribeToProgressUpdates(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = () => callback();
  const handleStorageEvent = (e: StorageEvent) => {
    if (
      e.key?.startsWith("completed_topics_") ||
      e.key === "local_conversations" ||
      e.key === "pathai_last_progress_update" ||
      e.key?.startsWith("roadmap_")
    ) {
      callback();
    }
  };

  window.addEventListener(PROGRESS_EVENT_NAME, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener(PROGRESS_EVENT_NAME, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}

// ─── Core Data Aggregation & Calculation ──────────────────────────────────────

export async function fetchLiveDashboardData(): Promise<DashboardFullData> {
  // 1. Fetch conversations list from API or localStorage
  let rawConversations: any[] = [];
  try {
    const { data } = await conversationsApi.list();
    if (data?.conversations && data.conversations.length > 0) {
      rawConversations = data.conversations;
    }
  } catch {
    // offline or unauthenticated fallback
  }

  // Check localStorage for local conversations
  const storedLocal = localStorage.getItem("local_conversations");
  let localList: any[] = [];
  if (storedLocal) {
    try {
      localList = JSON.parse(storedLocal);
    } catch {
      localList = [];
    }
  }

  // Combine and deduplicate real user paths
  const combinedMap = new Map<string, any>();
  for (const c of localList) {
    if (c && c.id) combinedMap.set(c.id, c);
  }
  for (const c of rawConversations) {
    if (c && c.id) {
      const existing = combinedMap.get(c.id) || {};
      combinedMap.set(c.id, { ...existing, ...c });
    }
  }

  const allRaw = Array.from(combinedMap.values());

  // If user has 0 paths created yet
  if (allRaw.length === 0) {
    return {
      stats: {
        totalPaths: 0,
        activePaths: 0,
        completedPaths: 0,
        totalCompletedMilestones: 0,
        totalMilestones: 0,
        totalLearningHours: 0,
        matchScore: "—",
        fitPercent: 0,
      },
      continueLearning: null,
      aiInsight: generateLiveAIInsight([], 0, 0),
      weeklyActivity: generateWeeklyActivity(0, 0),
      skillCompetencies: computeLiveSkillCompetencies([]),
      learningPaths: [],
    };
  }

  // 2. Process each real user path with its roadmap structure & completed topics
  let totalMilestonesSum = 0;
  let totalMilestonesPossible = 0;
  let totalLearningHoursSum = 0;
  let activePathsCount = 0;
  let completedPathsCount = 0;

  const processedPaths: LearningPathItem[] = allRaw.map((raw) => {
    const pathId = raw.id;

    // Retrieve roadmap structure
    let roadmapData: RoadmapStructure | null = null;
    const storedRoadmap = localStorage.getItem(`roadmap_${pathId}`);
    if (storedRoadmap) {
      try {
        roadmapData = JSON.parse(storedRoadmap);
      } catch {
        roadmapData = null;
      }
    }
    if (!roadmapData && defaultCuratedRoadmapsData[pathId]) {
      roadmapData = defaultCuratedRoadmapsData[pathId];
    }
    if (!roadmapData && raw.roadmap) {
      roadmapData = raw.roadmap.rawJson || raw.roadmap;
    }
    // Fallback basic structure if custom path without cached roadmap
    if (!roadmapData || !roadmapData.phases || roadmapData.phases.length === 0) {
      roadmapData = {
        objective: raw.title || "Custom Learning Journey",
        phases: [
          {
            phaseId: "p1",
            title: "Core Fundamentals & Architecture",
            topics: [
              { topicId: `${pathId}-t1`, title: "Foundations & Syntax", estimatedHours: 3 },
              { topicId: `${pathId}-t2`, title: "Core Design Patterns", estimatedHours: 4 },
              { topicId: `${pathId}-t3`, title: "Testing & Best Practices", estimatedHours: 4 },
            ],
          },
          {
            phaseId: "p2",
            title: "Advanced Implementation & Capstone",
            topics: [
              { topicId: `${pathId}-t4`, title: "Scalable Architecture", estimatedHours: 5 },
              { topicId: `${pathId}-t5`, title: "Production Deployment", estimatedHours: 6 },
            ],
          },
        ],
      };
    }

    // Retrieve completed topics set (ONLY from actual user toggles)
    let completedSet = new Set<string>();
    const savedCompleted = localStorage.getItem(`completed_topics_${pathId}`);
    if (savedCompleted) {
      try {
        completedSet = new Set(JSON.parse(savedCompleted));
      } catch {
        completedSet = new Set();
      }
    }

    // Calculate topics, progress, current and next milestone
    const allTopics: TopicItem[] = roadmapData.phases.flatMap((p) => p.topics);
    const totalTopicsCount = allTopics.length;
    const completedTopicsCount = allTopics.filter((t) => completedSet.has(t.topicId)).length;
    const progress = totalTopicsCount > 0 ? Math.min(100, Math.round((completedTopicsCount / totalTopicsCount) * 100)) : 0;

    // Find current milestone (first uncompleted) and next milestone
    let currentMilestone = progress === 100 ? "All Milestones Completed 🎉" : "Ready to Start";
    let currentPhaseTitle = progress === 100 ? "Path Complete" : roadmapData.phases[0]?.title || "Getting Started";
    let nextMilestone = "Ready for Next Stage";
    let remainingHours = 0;

    let foundCurrent = false;
    for (const phase of roadmapData.phases) {
      for (let i = 0; i < phase.topics.length; i++) {
        const topic = phase.topics[i];
        const isDone = completedSet.has(topic.topicId);
        if (!isDone) {
          remainingHours += topic.estimatedHours || 3;
          if (!foundCurrent) {
            currentMilestone = topic.title;
            currentPhaseTitle = phase.title;
            foundCurrent = true;
            // Next topic
            if (i + 1 < phase.topics.length) {
              nextMilestone = phase.topics[i + 1].title;
            } else {
              // Next phase first topic
              const nextPhaseIndex = roadmapData.phases.indexOf(phase) + 1;
              if (nextPhaseIndex < roadmapData.phases.length) {
                nextMilestone = roadmapData.phases[nextPhaseIndex].topics[0]?.title || "Advanced Stage";
              }
            }
          }
        }
      }
    }

    // Accumulate total statistics
    totalMilestonesSum += completedTopicsCount;
    totalMilestonesPossible += totalTopicsCount;
    const pathHours = allTopics
      .filter((t) => completedSet.has(t.topicId))
      .reduce((acc, t) => acc + (t.estimatedHours || 3), 0);
    totalLearningHoursSum += pathHours;

    const status: "ACTIVE" | "COMPLETED" | "DRAFT" = (totalTopicsCount > 0 && progress === 100) ? "COMPLETED" : "ACTIVE";
    if (status === "ACTIVE") activePathsCount++;
    else completedPathsCount++;

    return {
      id: pathId,
      title: raw.title || roadmapData.objective || "Custom Learning Path",
      category: raw.category || (raw.title?.includes("AI") ? "AI & Full-Stack" : raw.title?.includes("DevOps") ? "DevOps" : "Frontend"),
      status,
      progress,
      totalTopics: totalTopicsCount,
      completedTopicsCount,
      currentMilestone,
      currentPhaseTitle,
      nextMilestone,
      remainingHours: Math.max(0, remainingHours),
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt,
      learningContext: raw.learningContext,
      roadmap: roadmapData,
    };
  });

  // Sort paths: active with most recent updates first
  processedPaths.sort((a, b) => {
    if (a.status !== b.status) return a.status === "ACTIVE" ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // 3. Find Continue Learning Path (active path with in-progress topics)
  const continueLearning = processedPaths.find((p) => p.status === "ACTIVE" && p.progress < 100) || processedPaths[0] || null;

  // 4. Calculate Dynamic Match & Goal Alignment Score
  const fitScores = processedPaths.map((p) => {
    const goal = p.learningContext?.learningGoal || "";
    const level = p.learningContext?.currentLevel || "";
    const weekly = p.learningContext?.weeklyHours || 0;
    
    let score = 88;
    if (goal.length > 10) score += 4;
    if (level) score += 3;
    if (weekly > 0) score += 2;
    if (p.roadmap?.phases && p.roadmap.phases.length >= 3) score += 2;
    return Math.min(99, Math.max(82, score));
  });
  const fitPercent = fitScores.length > 0 ? Math.round(fitScores.reduce((a, b) => a + b, 0) / fitScores.length) : 0;
  const matchScore = fitPercent > 0 ? `${(fitPercent / 20).toFixed(1)} / 5.0` : "—";

  // 5. Dynamic AI Insights
  const aiInsight = generateLiveAIInsight(processedPaths, totalMilestonesSum, totalLearningHoursSum);

  // 6. Weekly Activity
  const weeklyActivity = generateWeeklyActivity(totalLearningHoursSum, totalMilestonesSum);

  // 7. Skill Competencies
  const skillCompetencies = computeLiveSkillCompetencies(processedPaths);

  return {
    stats: {
      totalPaths: processedPaths.length,
      activePaths: activePathsCount,
      completedPaths: completedPathsCount,
      totalCompletedMilestones: totalMilestonesSum,
      totalMilestones: totalMilestonesPossible,
      totalLearningHours: totalLearningHoursSum,
      matchScore,
      fitPercent,
    },
    continueLearning,
    aiInsight,
    weeklyActivity,
    skillCompetencies,
    learningPaths: processedPaths,
  };
}

// ─── Dynamic AI Insight Generator ─────────────────────────────────────────────

function generateLiveAIInsight(
  paths: LearningPathItem[],
  totalMilestones: number,
  totalHours: number
): AIInsightData {
  if (paths.length === 0) {
    return {
      title: "AI Calibration Initializing",
      badgeText: "Awaiting First Path",
      type: "recommendation",
      strongestArea: "—",
      largestSkillGap: "No active path",
      summary: "No active learning paths detected. Start your first personalized AI learning path to unlock telemetry, milestone progress tracking, and skill gap insights.",
      actionRecommendation: "Click 'New Learning Path' to customize your roadmap based on your current goals and target tech stack.",
    };
  }

  // Calculate completion ratios by technology domain
  const areas = paths.map((p) => ({
    name: p.category || p.title,
    score: p.progress,
    completed: p.completedTopicsCount,
  }));

  areas.sort((a, b) => b.score - a.score);
  const strongest = areas[0];
  const weakest = areas[areas.length - 1];

  let badgeText = "Skill Gap Detected";
  let type: AIInsightData["type"] = "gap";
  let summary = `Your strongest momentum is in ${strongest.name} (${strongest.score}% progress). Your current priority focus is ${weakest.name} (${weakest.score}% progress).`;
  let actionRecommendation = `Accelerate ${weakest.name} by tackling the next milestone or using the AI Tutor to review architectural foundations.`;

  if (strongest.score >= 50 && totalMilestones >= 8) {
    badgeText = "High Engineering Velocity";
    type = "velocity";
    summary = `You have completed ${totalMilestones} verified milestones and ${totalHours} active hours logged.`;
    actionRecommendation = `Solidify ${strongest.name} with an end-to-end portfolio capstone before branching deeper into ${weakest.name}.`;
  } else if (totalMilestones === 0) {
    badgeText = "Ready to Begin";
    type = "recommendation";
    summary = `Your learning path for ${strongest.name} is configured. Check off your first milestone in the interactive roadmap to start tracking live competency.`;
    actionRecommendation = `Open your roadmap and begin the first fundamental milestone.`;
  }

  const activePath = paths.find((p) => p.status === "ACTIVE");

  return {
    title: "PathAI Diagnostic Insight",
    badgeText,
    type,
    strongestArea: strongest.name,
    largestSkillGap: weakest.score < 100 ? weakest.name : "None",
    summary,
    actionRecommendation,
    actionPathId: activePath?.id,
  };
}

// ─── Weekly Activity Generator ────────────────────────────────────────────────

function generateWeeklyActivity(totalHours: number, totalMilestones: number): ActivityDay[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const now = new Date();
  const currentDayIndex = (now.getDay() + 6) % 7; // 0=Mon, 6=Sun

  if (totalHours === 0 && totalMilestones === 0) {
    return days.map((dayName, idx) => ({
      dateStr: new Date(Date.now() - (currentDayIndex - idx) * 86400000).toISOString(),
      dayName,
      hours: 0,
      milestones: 0,
      isToday: idx === currentDayIndex,
    }));
  }

  // Distribute actual logged hours across past days
  const baseWeights = [1.2, 1.8, 0.8, 2.4, 1.5, 3.0, 2.1];
  const weightSum = baseWeights.slice(0, currentDayIndex + 1).reduce((a, b) => a + b, 0) || 1;
  const scaling = totalHours / weightSum;

  return days.map((dayName, idx) => {
    const isToday = idx === currentDayIndex;
    const isPastOrToday = idx <= currentDayIndex;
    const hours = isPastOrToday ? Math.round(baseWeights[idx] * scaling * 10) / 10 : 0;
    const milestones = isPastOrToday ? Math.max(0, Math.round(hours / 2)) : 0;

    return {
      dateStr: new Date(Date.now() - (currentDayIndex - idx) * 86400000).toISOString(),
      dayName,
      hours,
      milestones,
      isToday,
    };
  });
}

// ─── Skill Competencies Calculator ────────────────────────────────────────────

function computeLiveSkillCompetencies(paths: LearningPathItem[]): SkillCompetency[] {
  if (paths.length === 0) {
    return [
      {
        id: "comp-fe",
        category: "Frontend",
        score: 0,
        level: "Developing",
        completedCount: 0,
        totalCount: 0,
        description: "Modern ECMAScript, React 19 concurrent mode, state caching & performance.",
      },
      {
        id: "comp-be",
        category: "Backend",
        score: 0,
        level: "Developing",
        completedCount: 0,
        totalCount: 0,
        description: "Node.js runtime, REST & GraphQL APIs, PostgreSQL schemas & indexing.",
      },
      {
        id: "comp-ai",
        category: "AI & LLM",
        score: 0,
        level: "Developing",
        completedCount: 0,
        totalCount: 0,
        description: "LangChain agents, vector similarity search, RAG retrieval & function calling.",
      },
      {
        id: "comp-do",
        category: "DevOps",
        score: 0,
        level: "Developing",
        completedCount: 0,
        totalCount: 0,
        description: "Multi-stage Dockerfiles, Kubernetes ingress, and GitHub Actions CI/CD.",
      },
      {
        id: "comp-sd",
        category: "System Design",
        score: 0,
        level: "Developing",
        completedCount: 0,
        totalCount: 0,
        description: "Distributed caching, rate limiters, message queues & microservices.",
      },
    ];
  }

  const fePath = paths.find((p) => p.category.toLowerCase().includes("front") || p.title.toLowerCase().includes("react"));
  const aiPath = paths.find((p) => p.category.toLowerCase().includes("ai") || p.title.toLowerCase().includes("agent"));
  const doPath = paths.find((p) => p.category.toLowerCase().includes("devops") || p.title.toLowerCase().includes("docker"));

  const feProgress = fePath ? fePath.progress : 0;
  const aiProgress = aiPath ? aiPath.progress : 0;
  const doProgress = doPath ? doPath.progress : 0;
  const beProgress = Math.round((feProgress * 0.4 + doProgress * 0.6));
  const sysDesignProgress = Math.round((beProgress * 0.5 + feProgress * 0.3 + aiProgress * 0.2));

  return [
    {
      id: "comp-fe",
      category: "Frontend",
      score: feProgress,
      level: feProgress >= 80 ? "Mastered" : feProgress >= 40 ? "In Progress" : "Developing",
      completedCount: fePath?.completedTopicsCount || 0,
      totalCount: fePath?.totalTopics || 0,
      description: "Modern ECMAScript, React 19 concurrent mode, state caching & performance.",
    },
    {
      id: "comp-be",
      category: "Backend",
      score: beProgress,
      level: beProgress >= 80 ? "Mastered" : beProgress >= 40 ? "In Progress" : "Developing",
      completedCount: Math.round(beProgress / 10),
      totalCount: (fePath?.totalTopics || 0) + (doPath?.totalTopics || 0),
      description: "Node.js runtime, REST & GraphQL APIs, PostgreSQL schemas & indexing.",
    },
    {
      id: "comp-ai",
      category: "AI & LLM",
      score: aiProgress,
      level: aiProgress >= 80 ? "Mastered" : aiProgress >= 40 ? "In Progress" : "Developing",
      completedCount: aiPath?.completedTopicsCount || 0,
      totalCount: aiPath?.totalTopics || 0,
      description: "LangChain agents, vector similarity search, RAG retrieval & function calling.",
    },
    {
      id: "comp-do",
      category: "DevOps",
      score: doProgress,
      level: doProgress >= 80 ? "Mastered" : doProgress >= 40 ? "In Progress" : "Developing",
      completedCount: doPath?.completedTopicsCount || 0,
      totalCount: doPath?.totalTopics || 0,
      description: "Multi-stage Dockerfiles, Kubernetes ingress, and GitHub Actions CI/CD.",
    },
    {
      id: "comp-sd",
      category: "System Design",
      score: sysDesignProgress,
      level: sysDesignProgress >= 80 ? "Mastered" : sysDesignProgress >= 40 ? "In Progress" : "Developing",
      completedCount: Math.max(1, Math.round(sysDesignProgress / 15)),
      totalCount: 8,
      description: "Distributed caching, rate limiters, message queues & microservices.",
    },
  ];
}
