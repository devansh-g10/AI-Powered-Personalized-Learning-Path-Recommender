export type CourseCategoryType =
  | "Software Development"
  | "AI / Machine Learning"
  | "Data"
  | "Cloud & DevOps"
  | "Computer Science"
  | "Cybersecurity"
  | "Mobile Development"
  | "Career & Engineering";

export interface CoursePrerequisite {
  title: string;
  courseId?: string;
  isSatisfied?: boolean;
}

export interface CourseModuleItem {
  id: string;
  title: string;
  duration: string;
  type: "concept" | "practice" | "project" | "assessment";
  description: string;
  topics: string[];
  challengeTitle?: string;
  isCompleted?: boolean;
}

export interface CourseStageItem {
  stageId: string;
  title: string;
  description: string;
  estimatedWeeks: number;
  modules: CourseModuleItem[];
}

export interface CourseItem {
  id: string;
  title: string;
  slug: string;
  category: CourseCategoryType;
  shortDescription: string;
  fullDescription: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedWeeks: number;
  totalModules: number;
  totalProjects: number;
  rating: number;
  enrolledCount: number;
  skillsGained: string[];
  prerequisites: CoursePrerequisite[];
  expectedOutcome: string;
  targetRole: string;
  isRecommended?: boolean;
  recommendedReason?: string;
  stages: CourseStageItem[];
}

export interface RoadmapTopic {
  topicId: string;
  title: string;
  description?: string;
  completed?: boolean;
}

export interface RoadmapPhase {
  phaseId: string;
  title: string;
  description?: string;
  estimatedWeeks?: number;
  topics: RoadmapTopic[];
}

export interface CourseRoadmapData {
  objective: string;
  currentAssessment?: string;
  phases: RoadmapPhase[];
  finalOutcome?: string;
  totalEstimatedWeeks?: number;
}

// ─── Categories List ─────────────────────────────────────────────────────────

export const courseCategoriesList: { name: CourseCategoryType; iconName: string; count: number }[] = [
  { name: "Software Development", iconName: "Code2", count: 12 },
  { name: "AI / Machine Learning", iconName: "Sparkles", count: 11 },
  { name: "Data", iconName: "Database", count: 9 },
  { name: "Cloud & DevOps", iconName: "Cloud", count: 10 },
  { name: "Computer Science", iconName: "Cpu", count: 8 },
  { name: "Cybersecurity", iconName: "Shield", count: 7 },
  { name: "Mobile Development", iconName: "Smartphone", count: 5 },
  { name: "Career & Engineering", iconName: "Briefcase", count: 7 },
];

// ─── Comprehensive Course Catalog ───────────────────────────────────────────

export const allCoursesCatalog: CourseItem[] = [
  // ─── 1. Software Development ───────────────────────────────────────────────
  {
    id: "course-typescript-pro",
    slug: "typescript-mastery",
    title: "Enterprise TypeScript: Type Systems & Metaprogramming",
    category: "Software Development",
    shortDescription: "Master advanced generics, conditional types, template literal types, AST manipulation, and strict type safety.",
    fullDescription: "Elevate your code quality with strict type modeling, discriminated unions, branded types, and runtime schema validation with Zod.",
    difficulty: "Intermediate",
    estimatedWeeks: 6,
    totalModules: 14,
    totalProjects: 3,
    rating: 4.96,
    enrolledCount: 11400,
    skillsGained: ["TypeScript 5.x", "Generics", "Conditional Types", "Discriminated Unions", "Zod", "Type-Level Programming"],
    prerequisites: [{ title: "Modern JavaScript (ES6+)", isSatisfied: true }],
    expectedOutcome: "Design zero-any type systems, branded primitives, and bulletproof API contracts for large-scale enterprise systems.",
    targetRole: "Staff Software Engineer / Architect",
    isRecommended: true,
    recommendedReason: "Top foundational upgrade for scaling large React & Node.js codebases.",
    stages: [
      {
        stageId: "st-ts-1",
        title: "FOUNDATION",
        description: "TypeScript compiler options, strict mode mechanics, type inference engines, and primitive brandings.",
        estimatedWeeks: 1,
        modules: [
          {
            id: "m-ts-101",
            title: "Strict Mode & Type Widening Mechanics",
            duration: "4 hrs",
            type: "concept",
            description: "tsconfig strict settings, noImplicitAny, exactOptionalPropertyTypes, and const assertions.",
            topics: ["tsconfig.json", "as const assertions", "Excess property checks", "Type widening vs narrowing"],
            challengeTitle: "Refactor dynamic configs to immutable branded types",
          },
          {
            id: "m-ts-102",
            title: "Interfaces vs Types & Structural Subtyping",
            duration: "4 hrs",
            type: "practice",
            description: "Declaration merging, open vs closed shape contracts, and structural assignability rules.",
            topics: ["Interface extension", "Intersection types", "Declaration merging", "Duck typing"],
            challengeTitle: "Build a polymorphic event dispatcher interface",
          },
        ],
      },
      {
        stageId: "st-ts-2",
        title: "CORE ADVANCED TYPES",
        description: "Deep dive into generic constraints, conditional types, distributive patterns, and infer keyword.",
        estimatedWeeks: 2,
        modules: [
          {
            id: "m-ts-201",
            title: "Generics & Higher-Kinded Type Constraints",
            duration: "5 hrs",
            type: "concept",
            description: "Generic type parameters, keyof constraints, lookup types, and default generics.",
            topics: ["T extends Record<string, unknown>", "keyof T", "Generic functions", "Generic classes"],
            challengeTitle: "Implement a type-safe deep get / set property accessor",
          },
          {
            id: "m-ts-202",
            title: "Conditional Types & The `infer` Keyword",
            duration: "6 hrs",
            type: "practice",
            description: "Non-nullable extraction, return type unwrapping, Promise flattening, and tuple inference.",
            topics: ["T extends (...args: any[]) => infer R", "Distributive conditional types", "Awaited<T>", "Unbox<T>"],
            challengeTitle: "Write custom ReturnType, Parameters, and DeepAwaited helpers",
          },
          {
            id: "m-ts-203",
            title: "Mapped Types & Template Literal String Types",
            duration: "5 hrs",
            type: "practice",
            description: "Key remapping with 'as', string manipulation types (`${K}Changed`), and mutable modifier stripping.",
            topics: ["Mapped types", "Key remapping", "Template literal types", "-readonly", "-?"],
            challengeTitle: "Build a strongly typed EventBus with template literal listener types",
          },
        ],
      },
      {
        stageId: "st-ts-3",
        title: "ENTERPRISE ARCHITECTURE",
        description: "Discriminated unions, state machine modeling, branded types, and runtime schema validation with Zod.",
        estimatedWeeks: 2,
        modules: [
          {
            id: "m-ts-301",
            title: "Discriminated Unions & Exhaustive Pattern Matching",
            duration: "5 hrs",
            type: "concept",
            description: "Eliminate runtime bugs with tag-based state machines and never assertion exhaustiveness guards.",
            topics: ["Discriminated unions", "assertNever helper", "Type narrowing in switch", "Result / Either monads"],
            challengeTitle: "Implement an exhaustive payment processing state machine",
          },
          {
            id: "m-ts-302",
            title: "Runtime Schema Validation with Zod & Type Inversion",
            duration: "5 hrs",
            type: "practice",
            description: "Derive TypeScript static types directly from Zod schemas and validate untrusted external API boundaries.",
            topics: ["z.infer<typeof schema>", "z.discriminatedUnion", "Custom transforms", "SafeParse"],
            challengeTitle: "Build an end-to-end type-safe API client validator",
          },
        ],
      },
      {
        stageId: "st-ts-4",
        title: "CAPSTONE PRODUCTION",
        description: "Assemble a zero-any, fully type-safe ORM query builder and API SDK with Vitest test coverage.",
        estimatedWeeks: 1,
        modules: [
          {
            id: "m-ts-401",
            title: "Production Type-Safe Query Builder Capstone",
            duration: "10 hrs",
            type: "project",
            description: "Construct a strongly-typed fluent SQL query builder library with autocomplete on database schema column names.",
            topics: ["Type-level testing", "tsd / tsd-lite", "Package exports", "Zero-runtime overhead"],
            challengeTitle: "Achieve 100% type-level test coverage",
          },
        ],
      },
    ],
  },
  {
    id: "course-react-19",
    slug: "react-19-development",
    title: "React 19 & Modern Frontend Architecture",
    category: "Software Development",
    shortDescription: "Master React 19 Concurrent Mode, Server Components, Custom Hooks, Zustand, and Production Performance.",
    fullDescription: "An end-to-end engineering program taking you from core React principles to enterprise application architecture. Build production applications with strict TypeScript typing, state management, suspense data fetching, and optimistic UI.",
    difficulty: "Beginner",
    estimatedWeeks: 8,
    totalModules: 14,
    totalProjects: 4,
    rating: 4.95,
    enrolledCount: 14200,
    skillsGained: ["React 19", "TypeScript", "Zustand", "Custom Hooks", "Performance Profiling", "Vitest"],
    prerequisites: [
      { title: "HTML & CSS Fundamentals", isSatisfied: true },
      { title: "Modern JavaScript (ES6+)", isSatisfied: true },
    ],
    expectedOutcome: "Build scalable, accessible, and high-performance React web applications ready for enterprise production.",
    targetRole: "Senior Frontend Engineer",
    isRecommended: true,
    recommendedReason: "Matches your active roadmap progress in Frontend Engineering.",
    stages: [
      {
        stageId: "st-react-1",
        title: "FOUNDATION",
        description: "Review HTML5 semantic trees, CSS Grid architectures, and ES6+ asynchronous runtimes.",
        estimatedWeeks: 2,
        modules: [
          {
            id: "m-react-101",
            title: "Semantic HTML & Responsive Layouts",
            duration: "4 hrs",
            type: "concept",
            description: "Modern layout modeling with Flexbox, CSS Grid, and WCAG accessibility standards.",
            topics: ["Semantic tags", "Flexbox container mechanics", "Grid auto-placement", "ARIA roles"],
            challengeTitle: "Build an accessible multi-column dashboard grid",
          },
          {
            id: "m-react-102",
            title: "JavaScript ES6+ Deep Dive",
            duration: "6 hrs",
            type: "practice",
            description: "Event loop internals, closures, microtask queues, and immutable data handling.",
            topics: ["Closures", "Event Loop", "Promises & Async/Await", "Array transformations"],
            challengeTitle: "Implement a custom Promise.all and debounce function",
          },
        ],
      },
      {
        stageId: "st-react-2",
        title: "CORE REACT",
        description: "JSX compilation, Virtual DOM reconciliation, state colocation, and the hook lifecycle.",
        estimatedWeeks: 3,
        modules: [
          {
            id: "m-react-201",
            title: "Components, Props & Immutable State",
            duration: "5 hrs",
            type: "concept",
            description: "Pure components, unidirectional data flow, and React 19 JSX transform.",
            topics: ["JSX runtime", "Props contract", "useState hooks", "Lifting state"],
          },
          {
            id: "m-react-202",
            title: "Hooks Lifecycle & Side-Effect Management",
            duration: "6 hrs",
            type: "practice",
            description: "useEffect dependency semantics, useMemo memoization, and custom state machines.",
            topics: ["useEffect", "useMemo", "useCallback", "useRef", "Custom hooks"],
            challengeTitle: "Build an optimistic useDebounceSearch custom hook",
          },
        ],
      },
      {
        stageId: "st-react-3",
        title: "ADVANCED ARCHITECTURE",
        description: "Context selectors, atomic stores (Zustand), TanStack Query, and concurrent rendering.",
        estimatedWeeks: 2,
        modules: [
          {
            id: "m-react-301",
            title: "Global State Management with Zustand",
            duration: "5 hrs",
            type: "practice",
            description: "Decouple state from components using atomic subscription stores.",
            topics: ["Zustand stores", "Selectors", "Persist middleware", "Devtools"],
          },
          {
            id: "m-react-302",
            title: "Data Caching & Optimistic Mutations",
            duration: "5 hrs",
            type: "practice",
            description: "Background query refetching, infinite scrolling, and mutation rollbacks.",
            topics: ["TanStack Query", "Cache invalidation", "Optimistic updates"],
          },
        ],
      },
      {
        stageId: "st-react-4",
        title: "CAPSTONE PRODUCTION",
        description: "Assemble a full-stack real-time collaboration workspace with Vitest test suite.",
        estimatedWeeks: 1,
        modules: [
          {
            id: "m-react-401",
            title: "Production Workspace Capstone",
            duration: "10 hrs",
            type: "project",
            description: "Build a collaborative project management workspace with real-time websocket sync.",
            topics: ["Architecture", "End-to-End integration", "Vercel deployment"],
            challengeTitle: "Complete capstone with 90%+ test coverage",
          },
        ],
      },
    ],
  },
  {
    id: "course-nextjs-15",
    slug: "nextjs-15-fullstack",
    title: "Next.js 15 & Server Actions Architecture",
    category: "Software Development",
    shortDescription: "Build lightning-fast full-stack web applications with Next.js 15 App Router, React Server Components, and Prisma.",
    fullDescription: "Deep dive into server-side rendering, streaming SSR, Server Actions, edge middleware, nested layouts, and seamless database integration with PostgreSQL.",
    difficulty: "Intermediate",
    estimatedWeeks: 6,
    totalModules: 12,
    totalProjects: 3,
    rating: 4.92,
    enrolledCount: 9800,
    skillsGained: ["Next.js 15", "React Server Components", "Server Actions", "PostgreSQL", "Prisma ORM", "Auth.js"],
    prerequisites: [
      { title: "React 19 & Core Hooks", isSatisfied: true },
      { title: "TypeScript Deep Dive", isSatisfied: true },
    ],
    expectedOutcome: "Architect full-stack web platforms with sub-second page loads and secure server-rendered data pipelines.",
    targetRole: "Full-Stack Software Engineer",
    isRecommended: true,
    recommendedReason: "Natural next step after mastering React fundamentals.",
    stages: [
      {
        stageId: "st-next-1",
        title: "APP ROUTER FOUNDATIONS",
        description: "File-system routing, nested layouts, loading skeletons, and error boundaries.",
        estimatedWeeks: 2,
        modules: [
          {
            id: "m-next-101",
            title: "Routing & Layout Conventions",
            duration: "4 hrs",
            type: "concept",
            description: "Route groups, dynamic segments, catch-all routes, and parallel routes.",
            topics: ["page.tsx", "layout.tsx", "loading.tsx", "error.tsx"],
          },
          {
            id: "m-next-102",
            title: "React Server Components vs Client Components",
            duration: "5 hrs",
            type: "practice",
            description: "Boundary separation with 'use client', serialization rules, and zero-bundle server rendering.",
            topics: ["RSC tree", "Server/Client boundaries", "Streaming Suspense"],
          },
        ],
      },
      {
        stageId: "st-next-2",
        title: "SERVER ACTIONS & DATA MUTATIONS",
        description: "Type-safe server functions, form actions, optimistic updates, and revalidation.",
        estimatedWeeks: 2,
        modules: [
          {
            id: "m-next-201",
            title: "Server Actions & useActionState",
            duration: "6 hrs",
            type: "practice",
            description: "Execute backend database queries directly from UI forms without writing API routes.",
            topics: ["useActionState", "revalidatePath", "revalidateTag", "Zod validation in actions"],
          },
        ],
      },
      {
        stageId: "st-next-3",
        title: "DATABASE & PRODUCTION DEPLOYMENT",
        description: "Prisma ORM connections, connection pooling with pgBouncer, and Edge middleware.",
        estimatedWeeks: 2,
        modules: [
          {
            id: "m-next-301",
            title: "Prisma ORM & PostgreSQL Integration",
            duration: "6 hrs",
            type: "project",
            description: "Build an enterprise SaaS platform with auth, Stripe billing, and edge caching.",
            topics: ["Prisma migrations", "Relations", "Edge auth middleware"],
          },
        ],
      },
    ],
  },

  // ─── 2. AI / Machine Learning ──────────────────────────────────────────────
  {
    id: "course-langchain-agents",
    slug: "langchain-rag-agents",
    title: "Generative AI, LangChain & Autonomous Agents",
    category: "AI / Machine Learning",
    shortDescription: "Build production RAG pipelines, autonomous agent workflows, tool-calling loops, and multi-modal LLM systems.",
    fullDescription: "Learn to build intelligent enterprise agents with LangChain, LangGraph, vector databases (Pinecone, Chroma), hybrid similarity search, and automated evaluation.",
    difficulty: "Intermediate",
    estimatedWeeks: 8,
    totalModules: 15,
    totalProjects: 4,
    rating: 4.96,
    enrolledCount: 11200,
    skillsGained: ["LangChain", "RAG", "Vector Embeddings", "AI Agents", "Python", "Mistral AI", "LangGraph"],
    prerequisites: [
      { title: "Python for AI", isSatisfied: true },
      { title: "REST APIs & Backend Concepts", isSatisfied: true },
    ],
    expectedOutcome: "Deploy production LLM architectures with memory persistence, agentic tool routing, and guardrail evaluation.",
    targetRole: "AI / LLM Solutions Engineer",
    isRecommended: true,
    recommendedReason: "Matches your enrolled 'AI & LLM Systems Roadmap' path.",
    stages: [
      {
        stageId: "st-ai-1",
        title: "LLM FOUNDATIONS & PROMPTING",
        description: "Tokenization, temperature parameters, structured outputs with JSON schema, and LangChain primitives.",
        estimatedWeeks: 2,
        modules: [
          {
            id: "m-ai-101",
            title: "Prompt Engineering & Structured JSON Output",
            duration: "5 hrs",
            type: "concept",
            description: "Few-shot prompting, system instructions, and schema-constrained LLM responses with Pydantic.",
            topics: ["System prompts", "Structured schema generation", "PydanticOutputParser"],
          },
          {
            id: "m-ai-102",
            title: "LangChain Core Primitives & LCEL",
            duration: "6 hrs",
            type: "practice",
            description: "Chaining prompts, model invokers, runnables, and output parsers with pipe syntax.",
            topics: ["LCEL", "RunnableSequence", "RunnableParallel", "Streaming outputs"],
          },
        ],
      },
      {
        stageId: "st-ai-2",
        title: "RETRIEVAL-AUGMENTED GENERATION (RAG)",
        description: "Chunking strategies, dense vector embeddings, hybrid keyword + semantic search, and rerankers.",
        estimatedWeeks: 3,
        modules: [
          {
            id: "m-ai-201",
            title: "Vector Embeddings & Semantic Search",
            duration: "6 hrs",
            type: "practice",
            description: "Generate embeddings with text-embedding models, store in Chroma/Pinecone, and perform KNN search.",
            topics: ["Cosine similarity", "Chunking overlapping windows", "Vector databases"],
          },
          {
            id: "m-ai-202",
            title: "Production RAG Pipeline with Source Citations",
            duration: "7 hrs",
            type: "project",
            description: "Build an enterprise document question-answering system with citation verification and hallucination guards.",
            topics: ["Contextual compression", "Cohere reranker", "Source grounding"],
          },
        ],
      },
      {
        stageId: "st-ai-3",
        title: "AUTONOMOUS AGENTS & LANGGRAPH",
        description: "Stateful agentic graphs, tool calling loops, ReAct framework, and human-in-the-loop approvals.",
        estimatedWeeks: 3,
        modules: [
          {
            id: "m-ai-301",
            title: "Tool Calling & Function Calling Mechanics",
            duration: "6 hrs",
            type: "practice",
            description: "Bind tools to models (web search, SQL query, calculation) and handle dynamic tool execution loops.",
            topics: ["bind_tools", "ToolNode", "Multi-step tool reasoning"],
          },
          {
            id: "m-ai-302",
            title: "Multi-Agent Workflows with LangGraph",
            duration: "8 hrs",
            type: "project",
            description: "Construct a research and code generation agent team with state checkpoints and branch evaluation.",
            topics: ["StateGraph", "Conditional edges", "Checkpointers", "Memory"],
          },
        ],
      },
    ],
  },
  {
    id: "course-docker-k8s",
    slug: "docker-kubernetes-devops",
    title: "Docker, Kubernetes & Production CI/CD",
    category: "Cloud & DevOps",
    shortDescription: "Containerize microservices, deploy multi-node Kubernetes clusters, and automate zero-downtime GitHub Actions pipelines.",
    fullDescription: "Master multi-stage Docker builds, Kubernetes manifests, Helm charts, ingress controllers, Prometheus monitoring, and Terraform provisioning.",
    difficulty: "Intermediate",
    estimatedWeeks: 7,
    totalModules: 13,
    totalProjects: 3,
    rating: 4.93,
    enrolledCount: 8900,
    skillsGained: ["Docker", "Kubernetes", "CI/CD", "GitHub Actions", "Linux", "Helm", "Cloud Deployments"],
    prerequisites: [{ title: "Linux Basics & Shell Scripting", isSatisfied: true }],
    expectedOutcome: "Design reliable container orchestration systems with automated testing and continuous deployment.",
    targetRole: "DevOps / Platform Engineer",
    isRecommended: true,
    recommendedReason: "Essential for moving your full-stack applications into cloud production.",
    stages: [
      {
        stageId: "st-devops-1",
        title: "CONTAINERIZATION WITH DOCKER",
        description: "Images, layers, multi-stage builds, volumes, and docker-compose orchestration.",
        estimatedWeeks: 2,
        modules: [
          {
            id: "m-do-101",
            title: "Multi-Stage Docker Builds & Image Optimization",
            duration: "5 hrs",
            type: "concept",
            description: "Minimize production image sizes, isolate build dependencies, and secure non-root containers.",
            topics: ["Dockerfile best practices", "Multi-stage builds", "Layer caching", ".dockerignore"],
          },
          {
            id: "m-do-102",
            title: "Docker Compose Multi-Service Stacks",
            duration: "5 hrs",
            type: "practice",
            description: "Orchestrate web server, Postgres database, Redis cache, and background worker locally.",
            topics: ["docker-compose.yml", "Networks", "Persistent volumes", "Environment configs"],
          },
        ],
      },
      {
        stageId: "st-devops-2",
        title: "KUBERNETES CLUSTER ORCHESTRATION",
        description: "Pods, Deployments, Services, Ingress, ConfigMaps, Secrets, and Helm packaging.",
        estimatedWeeks: 3,
        modules: [
          {
            id: "m-do-201",
            title: "Kubernetes Core Architecture & Manifests",
            duration: "7 hrs",
            type: "practice",
            description: "Deploy self-healing, auto-scaling applications on k8s clusters with rolling zero-downtime updates.",
            topics: ["Deployments", "ClusterIP / NodePort Services", "Ingress NGINX", "HPA"],
          },
        ],
      },
      {
        stageId: "st-devops-3",
        title: "CI/CD PIPELINES & GITHUB ACTIONS",
        description: "Automated linting, test runners, Docker Hub publishing, and GitOps deployments.",
        estimatedWeeks: 2,
        modules: [
          {
            id: "m-do-301",
            title: "Zero-Downtime GitHub Actions CI/CD Pipeline",
            duration: "7 hrs",
            type: "project",
            description: "Construct an enterprise CI/CD pipeline triggered on pull requests and auto-deploying to cloud clusters.",
            topics: ["GitHub Actions workflow", "Secrets management", "Docker publish", "Kubectl rollout"],
          },
        ],
      },
    ],
  },
  {
    id: "course-dsa-interviews",
    slug: "data-structures-algorithms",
    title: "Data Structures, Algorithms & Problem Solving",
    category: "Computer Science",
    shortDescription: "Master Arrays, Linked Lists, Trees, Graphs, Dynamic Programming, and Big-O complexity for top-tier interviews.",
    fullDescription: "Structured problem-solving patterns: Two Pointers, Sliding Window, Fast/Slow Pointers, BFS/DFS, Top-Down DP, and Greedy algorithms.",
    difficulty: "Intermediate",
    estimatedWeeks: 10,
    totalModules: 16,
    totalProjects: 2,
    rating: 4.97,
    enrolledCount: 18900,
    skillsGained: ["Data Structures", "Algorithms", "Dynamic Programming", "Graph Theory", "Big-O Analysis"],
    prerequisites: [{ title: "Programming Fundamentals (JS/Python/C++)", isSatisfied: true }],
    expectedOutcome: "Solve LeetCode Medium/Hard algorithmic challenges with confidence and optimal space/time complexity.",
    targetRole: "Software Development Engineer (SDE)",
    isRecommended: true,
    recommendedReason: "Core foundational pillar for technical interview readiness.",
    stages: [
      {
        stageId: "st-dsa-1",
        title: "FOUNDATIONAL DATA STRUCTURES",
        description: "Arrays, Hash Tables, Two Pointers, Sliding Window, and Linked Lists.",
        estimatedWeeks: 3,
        modules: [
          {
            id: "m-dsa-101",
            title: "Arrays, Hashing & Prefix Sums",
            duration: "6 hrs",
            type: "concept",
            description: "O(1) lookups, hash collision strategies, and continuous range summation.",
            topics: ["HashMap mechanics", "Two Sum variations", "Prefix sum array"],
          },
          {
            id: "m-dsa-102",
            title: "Two Pointers & Sliding Window Patterns",
            duration: "6 hrs",
            type: "practice",
            description: "Variable-length and fixed-length window algorithms for string and array subarrays.",
            topics: ["Opposite-end pointers", "Fast & slow pointers", "Dynamic window resizing"],
          },
        ],
      },
      {
        stageId: "st-dsa-2",
        title: "TREES, HEAPS & RECURSION",
        description: "Binary Trees, BSTs, Tree Traversals (Pre/In/Post/Level-order), and Priority Queues.",
        estimatedWeeks: 3,
        modules: [
          {
            id: "m-dsa-201",
            title: "Binary Tree DFS & BFS Traversals",
            duration: "6 hrs",
            type: "practice",
            description: "Recursive depth-first search, tree height calculations, and iterative queue-based BFS.",
            topics: ["Inorder traversal", "LCA in BST", "Level order traversal"],
          },
        ],
      },
      {
        stageId: "st-dsa-3",
        title: "GRAPHS & DYNAMIC PROGRAMMING",
        description: "BFS/DFS in graphs, Dijkstra's algorithm, 1D and 2D Dynamic Programming tabular optimization.",
        estimatedWeeks: 4,
        modules: [
          {
            id: "m-dsa-301",
            title: "Graph Traversal & Topological Sort",
            duration: "8 hrs",
            type: "practice",
            description: "Adjacency lists, cycle detection in directed graphs, and course schedule dependency resolution.",
            topics: ["Kahn's algorithm", "DFS cycle detection", "Connected components"],
          },
          {
            id: "m-dsa-302",
            title: "Dynamic Programming: Memoization & Tabulation",
            duration: "8 hrs",
            type: "project",
            description: "Subproblem state transitions: 0/1 Knapsack, Longest Common Subsequence, and Coin Change.",
            topics: ["State definition", "Bottom-up tabulation", "Space complexity reduction"],
          },
        ],
      },
    ],
  },
];

/**
 * Helper to fetch a course by ID or slug
 */
export function getCourseByIdOrSlug(idOrSlug: string): CourseItem | undefined {
  if (!idOrSlug) return undefined;
  const clean = idOrSlug.toLowerCase().trim();
  return allCoursesCatalog.find(
    (c) => c.id.toLowerCase() === clean || c.slug.toLowerCase() === clean
  );
}

/**
 * Converts any CourseItem into a full, interactive CourseRoadmapData structure!
 * Ensures EVERY course has its own unique, authentic roadmap stages and milestones.
 */
export function getRoadmapForCourseOrId(idOrSlug?: string): CourseRoadmapData {
  const target = (idOrSlug || "").trim();

  // 1. Check direct localStorage roadmap override
  if (target && typeof window !== "undefined") {
    try {
      const storedRoadmap = localStorage.getItem(`roadmap_${target}`);
      if (storedRoadmap) {
        const parsed = JSON.parse(storedRoadmap);
        if (parsed && parsed.phases && parsed.phases.length > 0) {
          return {
            objective: parsed.objective || "Personalized Learning Path",
            currentAssessment: parsed.currentAssessment || parsed.assessment || "Customized AI curriculum tailored to your skills.",
            totalEstimatedWeeks: parsed.totalEstimatedWeeks || 8,
            phases: parsed.phases,
          };
        }
      }
    } catch {
      // ignore
    }
  }

  // 2. Check local_conversations list
  if (typeof window !== "undefined") {
    try {
      const localConvsStr = localStorage.getItem("local_conversations");
      if (localConvsStr) {
        const convList = JSON.parse(localConvsStr);
        if (Array.isArray(convList) && convList.length > 0) {
          // Find matching conversation or pick first if target is generic/default
          const matchedConv = target && target !== "default-roadmap"
            ? convList.find((c: any) => c.id === target || c.title?.toLowerCase() === target.toLowerCase())
            : convList[0];

          if (matchedConv && matchedConv.roadmap && matchedConv.roadmap.phases && matchedConv.roadmap.phases.length > 0) {
            return {
              objective: matchedConv.roadmap.objective || matchedConv.title || "Personalized Learning Path",
              currentAssessment: matchedConv.roadmap.currentAssessment || matchedConv.learningContext?.learningGoal || "Custom AI Path",
              totalEstimatedWeeks: matchedConv.roadmap.totalEstimatedWeeks || 10,
              phases: matchedConv.roadmap.phases,
            };
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Match from allCoursesCatalog (by id or slug or title)
  const course = getCourseByIdOrSlug(target);
  if (course && course.stages && course.stages.length > 0) {
    return {
      objective: `${course.title} Roadmap`,
      currentAssessment: `Your personalized career roadmap for ${course.title}, tailored to your current skill level and milestones.`,
      totalEstimatedWeeks: course.estimatedWeeks,
      phases: course.stages.map((stage, sIdx) => ({
        phaseId: stage.stageId || `phase-${sIdx + 1}`,
        title: stage.title,
        description: stage.description,
        estimatedWeeks: stage.estimatedWeeks,
        topics: stage.modules.map((mod) => ({
          topicId: mod.id,
          title: mod.title,
          description: mod.description,
          completed: mod.isCompleted || false,
        })),
      })),
    };
  }

  // 4. Check if target or goal matches specific known technologies/keywords
  const lower = target.toLowerCase();
  if (lower.includes("ai") || lower.includes("llm") || lower.includes("agent") || lower.includes("langchain") || lower.includes("rag")) {
    return {
      objective: "Full-Stack AI Agents & LLM Systems Roadmap",
      currentAssessment: "Design autonomous tool-calling agents, RAG vector retrieval pipelines, and streaming LLM backends.",
      totalEstimatedWeeks: 12,
      phases: [
        {
          phaseId: "ai-p1",
          title: "Prompt Engineering & Structured JSON",
          description: "Few-shot prompting, JSON schema enforcement, and tool calling with OpenAI / Anthropic SDKs.",
          estimatedWeeks: 2,
          topics: [
            { topicId: "top-ai-01", title: "Few-Shot Prompting & JSON Schema Enforcement", description: "Format LLM responses into strict type-safe schemas." },
            { topicId: "top-ai-02", title: "OpenAI & Anthropic Function Calling APIs", description: "Wire tools and live data feeds to models." },
            { topicId: "top-ai-03", title: "LangChain Expression Language (LCEL) Chains", description: "Compose modular chains and stream outputs." },
          ],
        },
        {
          phaseId: "ai-p2",
          title: "RAG & Vector Similarity Search",
          description: "Embedding models, chunking strategies, Pinecone/PGVector, and hybrid semantic retrieval.",
          estimatedWeeks: 4,
          topics: [
            { topicId: "top-ai-04", title: "Text Chunking & Embedding Generation", description: "Optimize token chunks and semantic density." },
            { topicId: "top-ai-05", title: "Vector DB Retrieval (Pinecone / PGVector)", description: "Index embeddings and query cosine similarity." },
            { topicId: "top-ai-06", title: "Context Window Optimization & Re-Ranking", description: "Improve accuracy with Cohere reranking." },
          ],
        },
        {
          phaseId: "ai-p3",
          title: "Autonomous Multi-Agent Systems",
          description: "ReAct loops, human-in-the-loop, LangGraph stateful multi-agent workflows, and memory persistence.",
          estimatedWeeks: 3,
          topics: [
            { topicId: "top-ai-07", title: "ReAct Loops & Tool Orchestration Pipelines", description: "Autonomous task execution and verification." },
            { topicId: "top-ai-08", title: "Multi-Agent Collaboration with LangGraph", description: "Orchestrate agent state graphs and checkpoints." },
            { topicId: "top-ai-09", title: "Streaming Fastify & Server-Sent Events (SSE)", description: "Deliver low-latency streaming responses." },
          ],
        },
        {
          phaseId: "ai-p4",
          title: "Production AI Deployment & Guardrails",
          description: "LLM guardrails, hallucination evaluation benchmarks, caching, and cloud deployment.",
          estimatedWeeks: 3,
          topics: [
            { topicId: "top-ai-10", title: "Guardrails, Hallucination Checks & Evals", description: "Run automated evals and moderation filters." },
            { topicId: "top-ai-11", title: "Full-Stack Autonomous Code Assistant Capstone", description: "Build and deploy an enterprise agent product." },
          ],
        },
      ],
    };
  }

  if (lower.includes("devops") || lower.includes("docker") || lower.includes("kubernetes") || lower.includes("cloud") || lower.includes("aws")) {
    return {
      objective: "DevOps, Docker & Kubernetes CI/CD Roadmap",
      currentAssessment: "Containerize microservices, deploy resilient Kubernetes clusters, and automate zero-downtime releases.",
      totalEstimatedWeeks: 10,
      phases: [
        {
          phaseId: "do-p1",
          title: "Linux Internals & Scripting",
          description: "Linux system internals, permissions, bash scripting, and reverse proxy networking.",
          estimatedWeeks: 2,
          topics: [
            { topicId: "top-do-01", title: "Linux System Internals, Permissions & Bash", description: "Automate server maintenance with robust scripts." },
            { topicId: "top-do-02", title: "Networking Fundamentals, DNS, SSL & Reverse Proxies", description: "Configure Nginx and Caddy for high availability." },
          ],
        },
        {
          phaseId: "do-p2",
          title: "Docker Containerization & Compose",
          description: "Multi-stage builds, non-root user security, and multi-service orchestration with Docker Compose.",
          estimatedWeeks: 3,
          topics: [
            { topicId: "top-do-03", title: "Multi-Stage Dockerfiles & Image Optimization", description: "Shrink image footprints by up to 80%." },
            { topicId: "top-do-04", title: "Docker Compose Multi-Container Stacks", description: "Orchestrate API, Redis, and DB dependencies." },
          ],
        },
        {
          phaseId: "do-p3",
          title: "Kubernetes Cluster Architecture & Helm",
          description: "Pods, Deployments, Services, Ingress, PersistentVolumes, and Helm package charts.",
          estimatedWeeks: 3,
          topics: [
            { topicId: "top-do-05", title: "K8s Pods, Deployments, ConfigMaps & Secrets", description: "Manage declarative cluster workloads." },
            { topicId: "top-do-06", title: "Ingress Controllers & Cert-Manager", description: "Expose microservices securely over TLS." },
            { topicId: "top-do-07", title: "Helm Package Charts & Values Customization", description: "Template complex cluster applications." },
          ],
        },
        {
          phaseId: "do-p4",
          title: "CI/CD Pipelines & GitOps Deployment",
          description: "GitHub Actions automated testing, Docker build & push, and ArgoCD GitOps sync.",
          estimatedWeeks: 2,
          topics: [
            { topicId: "top-do-08", title: "GitHub Actions CI/CD Automation", description: "Run automated tests and container builds on PRs." },
            { topicId: "top-do-09", title: "ArgoCD GitOps Zero-Downtime Releases", description: "Continuous synchronization from Git to Kubernetes." },
          ],
        },
      ],
    };
  }

  if (lower.includes("python") || lower.includes("data") || lower.includes("backend") || lower.includes("fastapi")) {
    return {
      objective: "Python Backend & High-Performance Microservices Roadmap",
      currentAssessment: "Master Python 3.12, FastAPI, AsyncIO, PostgreSQL, Redis caching, and scalable REST/gRPC architectures.",
      totalEstimatedWeeks: 10,
      phases: [
        {
          phaseId: "py-p1",
          title: "Modern Python 3.12 & AsyncIO",
          description: "Type annotations, dataclasses, generators, and asynchronous concurrency with asyncio.",
          estimatedWeeks: 2,
          topics: [
            { topicId: "top-py-01", title: "Type Hinting, Generics & Pydantic V2", description: "High-performance schema validation in Python." },
            { topicId: "top-py-02", title: "AsyncIO Event Loop & Task Concurrency", description: "Handle thousands of concurrent I/O operations." },
          ],
        },
        {
          phaseId: "py-p2",
          title: "FastAPI & Enterprise REST APIs",
          description: "Dependency injection, OAuth2 JWT auth, background tasks, and OpenAPI documentation.",
          estimatedWeeks: 3,
          topics: [
            { topicId: "top-py-03", title: "FastAPI Dependency Injection & Middleware", description: "Decouple database sessions and auth handlers." },
            { topicId: "top-py-04", title: "SQLAlchemy 2.0 Async ORM & Alembic Migrations", description: "Type-safe database modeling with PostgreSQL." },
          ],
        },
        {
          phaseId: "py-p3",
          title: "Caching, Queues & Distributed Tasks",
          description: "Redis caching, Celery task workers, message brokers, and background jobs.",
          estimatedWeeks: 3,
          topics: [
            { topicId: "top-py-05", title: "Redis Caching Strategies & Rate Limiting", description: "Accelerate read endpoints and protect APIs." },
            { topicId: "top-py-06", title: "Celery & RabbitMQ Asynchronous Job Processing", description: "Offload compute-heavy tasks to worker pools." },
          ],
        },
        {
          phaseId: "py-p4",
          title: "Production Microservices Capstone",
          description: "Build an end-to-end distributed order processing service with automated test coverage.",
          estimatedWeeks: 2,
          topics: [
            { topicId: "top-py-07", title: "PyTest Suite with Mocking & Coverage", description: "Achieve 90%+ test coverage with unit & integration tests." },
            { topicId: "top-py-08", title: "Dockerized Production Microservice Capstone", description: "Deploy containerized FastAPI with health checks." },
          ],
        },
      ],
    };
  }

  // 5. Default Fallback
  return {
    objective: "Frontend Engineering & Modern UI Architecture Roadmap",
    currentAssessment: "Your personalized journey from DOM & ECMAScript fundamentals to React 19, state stores, and scalable web architecture.",
    totalEstimatedWeeks: 10,
    phases: [
      {
        phaseId: "phase-1",
        title: "Foundation & Modern ECMAScript",
        description: "Semantic HTML5, CSS3 Grid & Flexbox, modern ES6+ async runtime, and Git branching workflows.",
        estimatedWeeks: 2,
        topics: [
          { topicId: "topic-001", title: "Semantic HTML5 & Accessible ARIA", description: "Accessible, SEO-friendly modern markup structure." },
          { topicId: "topic-002", title: "CSS3 Flexbox, Grid & Responsive Layouts", description: "Responsive layouts, container queries, and CSS variables." },
          { topicId: "topic-003", title: "Modern JavaScript (ES6+ Async/Await & Event Loop)", description: "Promises, microtasks, closures, and modular imports." },
          { topicId: "topic-004", title: "Git Workflows & Clean Branching Strategy", description: "Merge conflicts, rebasing, and pull request reviews." },
        ],
      },
      {
        phaseId: "phase-2",
        title: "Core React 19 & State Architecture",
        description: "React 19 Hooks, Fiber diffing, Zustand state stores, and server state caching with TanStack Query.",
        estimatedWeeks: 3,
        topics: [
          { topicId: "topic-005", title: "React 19 Hooks, Fiber Diffing & Virtual DOM", description: "Component lifecycles and optimized rendering." },
          { topicId: "topic-006", title: "Zustand & Persistent State Stores", description: "Atomic decoupled global state without boilerplates." },
          { topicId: "topic-007", title: "Server State Caching with TanStack Query", description: "Optimistic updates, background caching, and invalidation." },
          { topicId: "topic-008", title: "TypeScript Generics & React Component Typing", description: "Type-safe props, event handlers, and custom hooks." },
        ],
      },
      {
        phaseId: "phase-3",
        title: "Advanced Performance & Microfrontends",
        description: "Core Web Vitals, code splitting, bundle optimizations, and automated testing with Vitest & Playwright.",
        estimatedWeeks: 3,
        topics: [
          { topicId: "topic-009", title: "Core Web Vitals & Bundle Optimization", description: "LCP, FID, CLS improvements, and tree shaking." },
          { topicId: "topic-010", title: "Automated Testing with Vitest & Playwright", description: "Unit tests, component rendering tests, and E2E specs." },
          { topicId: "topic-011", title: "Component Design Systems with Tailwind & Radix", description: "Composable, headless UI primitives and design tokens." },
        ],
      },
      {
        phaseId: "phase-4",
        title: "Production Projects & Capstones",
        description: "Assemble portfolio-grade production web apps and verify your frontend competency.",
        estimatedWeeks: 2,
        topics: [
          { topicId: "topic-012", title: "High-Throughput Analytics Dashboard", description: "Live charts, websocket streaming, and virtualized tables." },
          { topicId: "topic-013", title: "Real-time Collaborative Canvas App", description: "Multiplayer editing, undo/redo stacks, and SVG canvas." },
        ],
      },
    ],
  };
}
