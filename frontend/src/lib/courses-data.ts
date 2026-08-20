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
export function getRoadmapForCourseOrId(idOrSlug: string): CourseRoadmapData {
  const course = getCourseByIdOrSlug(idOrSlug);

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

  // If a known course has minimal stages, generate structured stages based on its metadata
  if (course) {
    return {
      objective: `${course.title} Roadmap`,
      currentAssessment: course.fullDescription,
      totalEstimatedWeeks: course.estimatedWeeks,
      phases: [
        {
          phaseId: `${course.id}-phase-1`,
          title: "Foundation & Prerequisites",
          description: `Core fundamentals and prerequisite concepts for ${course.title}.`,
          estimatedWeeks: 2,
          topics: [
            {
              topicId: `${course.id}-top-01`,
              title: `${course.title} Core Architecture`,
              description: `Foundational mental models and environment setup for ${course.title}.`,
            },
            {
              topicId: `${course.id}-top-02`,
              title: "Syntax & Standard Library Conventions",
              description: "Key idioms, execution mechanics, and design patterns.",
            },
          ],
        },
        {
          phaseId: `${course.id}-phase-2`,
          title: "Core Mechanics & Patterns",
          description: "Hands-on implementation of primary concepts and workflows.",
          estimatedWeeks: 3,
          topics: [
            {
              topicId: `${course.id}-top-03`,
              title: "Advanced Implementations",
              description: "Production patterns, performance optimization, and testing.",
            },
            {
              topicId: `${course.id}-top-04`,
              title: "State, Caching & Data Management",
              description: "Scalable data structures and lifecycle synchronization.",
            },
          ],
        },
        {
          phaseId: `${course.id}-phase-3`,
          title: "Production Capstone & Assessment",
          description: "Assemble real-world projects and verify competencies.",
          estimatedWeeks: 2,
          topics: [
            {
              topicId: `${course.id}-top-05`,
              title: "Production Capstone Application",
              description: "Build an end-to-end portfolio-grade application.",
            },
            {
              topicId: `${course.id}-top-06`,
              title: "Final Competency Assessment",
              description: "Take the verified assessment to unlock skill badges.",
            },
          ],
        },
      ],
    };
  }

  // Default fallback if accessed completely generic without a course identifier
  return {
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
          },
          {
            topicId: "topic-002",
            title: "CSS Layout & Flexbox",
            description: "Responsive layouts, flexbox, CSS grid, and modern styling.",
          },
          {
            topicId: "topic-003",
            title: "Git & GitHub",
            description: "Branching, merge requests, collaboration workflows.",
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
          },
          {
            topicId: "topic-005",
            title: "React Fundamentals",
            description: "Components, hooks, props, lifecycle & virtual DOM.",
          },
          {
            topicId: "topic-006",
            title: "State Management",
            description: "Context API, Zustand, Redux Toolkit & data caching.",
          },
        ],
      },
    ],
  };
}
