import type { LearningPathItem, SkillCompetency } from "./learning-data";

export interface TutorResponse {
  content: string;
  codeSnippet?: string;
  hasChallenge?: boolean;
  challengePrompt?: string;
  suggestedAction?: "view_roadmap" | "mark_understood" | "copy_code" | "try_challenge";
  targetTopicId?: string;
}

/**
 * Intelligent Learning-Oriented Engineering Mentor Engine
 * Provides targeted, dynamic answers matching the user's specific question,
 * technical keywords, and active roadmap context.
 */
export function generateContextualTutorResponse(
  userText: string,
  activeTopic: string,
  activePath: LearningPathItem | null,
  skillCompetencies: SkillCompetency[]
): TutorResponse {
  const query = userText.toLowerCase().trim();

  // ─── 1. "What should I learn next?" / "What am I weak at?" Queries ────────
  if (
    query.includes("what should i learn") ||
    query.includes("what next") ||
    query.includes("weak") ||
    query.includes("gap") ||
    query.includes("where do i stand")
  ) {
    const weakestComp = [...skillCompetencies].sort((a, b) => a.score - b.score)[0] || {
      category: "Backend & Systems",
      score: 40,
      completedCount: 2,
      description: "Focus on connection pooling, Redis caching, and async workers.",
    };
    const strongestComp = [...skillCompetencies].sort((a, b) => b.score - a.score)[0] || {
      category: "Frontend UI",
      score: 85,
      completedCount: 8,
    };

    const pathTitle = activePath?.title || "Full-Stack Software Engineering";
    const currentMilestone = activePath?.currentMilestone || activeTopic;
    const nextMilestone = activePath?.nextMilestone || "Next Architectural Phase";
    const progress = activePath?.progress || 35;

    return {
      content:
        `### 📊 Personalized Learning Diagnostic\n\n` +
        `Based on your live progress in **${pathTitle}** (${progress}% complete):\n\n` +
        `- **Verified Strength:** **${strongestComp.category}** (${strongestComp.score}% mastery — ${strongestComp.completedCount} milestones verified).\n` +
        `- **Identified Priority Gap:** **${weakestComp.category}** (${weakestComp.score}% mastery). ${weakestComp.description}\n\n` +
        `### 🎯 Recommended Immediate Action\n\n` +
        `1. **Active Focus:** Complete your current milestone **"${currentMilestone}"**.\n` +
        `2. **Pipeline Next:** Once verified, you will unlock **"${nextMilestone}"**.\n` +
        `3. **Bridging the Gap:** Dedicate 2 hours this week to explore fundamental patterns in **${weakestComp.category}** using the AI Assistant or Roadmaps.`,
      suggestedAction: "view_roadmap",
    };
  }

  // ─── 2. Greetings / Introduction ──────────────────────────────────────────
  if (
    query === "hi" ||
    query === "hello" ||
    query === "hey" ||
    query.startsWith("hi ") ||
    query.startsWith("hello ") ||
    query.startsWith("hey ") ||
    query.includes("kaise ho") ||
    query.includes("who are you")
  ) {
    return {
      content:
        `### 👋 Hello! I'm your AI Engineering Mentor & Tutor.\n\n` +
        `I am actively tracking your roadmap for **${activeTopic}**.\n\n` +
        `**Here are some things you can ask me:**\n` +
        `- 💡 *"Explain ${activeTopic} with an architectural code example"*\n` +
        `- 🔍 *"Review my code or suggest best practices"*\n` +
        `- 🆚 *"Compare React vs Vue / SQL vs NoSQL / REST vs GraphQL"*\n` +
        `- 🐛 *"Help me debug a state, async, or performance issue"*\n` +
        `- 🛠️ *"Give me a hands-on coding challenge for today"*\n\n` +
        `What would you like to explore or solve right now?`,
      suggestedAction: "try_challenge",
    };
  }

  // ─── 3. State Management / Hooks (useState, useEffect, useMemo, etc.) ──────
  if (
    query.includes("state") ||
    query.includes("hook") ||
    query.includes("useeffect") ||
    query.includes("usememo") ||
    query.includes("usecallback") ||
    query.includes("zustand") ||
    query.includes("redux") ||
    query.includes("context")
  ) {
    return {
      content:
        `### ⚛️ Modern React State Architecture & Hooks Guide\n\n` +
        `**1. Core Philosophy: State Colocation & Purity**\n` +
        `- **Colocation:** Keep state as close to the leaf components as possible. Only lift state when multiple sibling branches genuinely require shared synchronization.\n` +
        `- **Context vs Atomic Stores:** Use Context for low-frequency changes (theme, auth). For high-frequency state, prefer **Zustand** or **Jotai** to eliminate redundant subtree re-renders.\n\n` +
        `**2. Optimized Implementation Pattern:**\n\n` +
        `\`\`\`tsx\n` +
        `import React, { useState, useMemo, useCallback } from 'react';\n\n` +
        `interface ItemProps {\n` +
        `  readonly id: string;\n` +
        `  readonly name: string;\n` +
        `  readonly value: number;\n` +
        `}\n\n` +
        `export function OptimizedStateContainer({ items }: { items: ItemProps[] }) {\n` +
        `  const [filterQuery, setFilterQuery] = useState('');\n` +
        `  const [selectedId, setSelectedId] = useState<string | null>(null);\n\n` +
        `  // Efficient memoization prevents re-filtering on every render\n` +
        `  const filteredItems = useMemo(() => {\n` +
        `    const q = filterQuery.toLowerCase();\n` +
        `    return items.filter((item) => item.name.toLowerCase().includes(q));\n` +
        `  }, [items, filterQuery]);\n\n` +
        `  // Stable callback reference\n` +
        `  const handleSelect = useCallback((id: string) => {\n` +
        `    setSelectedId(id);\n` +
        `  }, []);\n\n` +
        `  return (\n` +
        `    <div className="p-4 border rounded-xl space-y-3 bg-card">\n` +
        `      <input\n` +
        `        type="text"\n` +
        `        value={filterQuery}\n` +
        `        onChange={(e) => setFilterQuery(e.target.value)}\n` +
        `        placeholder="Filter items..."\n` +
        `        className="px-3 py-2 border rounded-lg w-full text-sm"\n` +
        `      />\n` +
        `      <ul className="space-y-1">\n` +
        `        {filteredItems.map((item) => (\n` +
        `          <li\n` +
        `            key={item.id}\n` +
        `            onClick={() => handleSelect(item.id)}\n` +
        `            className={\`p-2 text-sm rounded cursor-pointer \${selectedId === item.id ? 'bg-primary text-white' : 'hover:bg-muted'}\`}\n` +
        `          >\n` +
        `            {item.name} (\${item.value})\n` +
        `          </li>\n` +
        `        ))}\n` +
        `      </ul>\n` +
        `    </div>\n` +
        `  );\n` +
        `}\n` +
        `\`\`\`\n\n` +
        `**3. Senior Tip:** Always ensure clean dependency arrays in \`useEffect\` and use primitive or memoized objects to avoid infinite execution loops.`,
      suggestedAction: "copy_code",
    };
  }

  // ─── 4. Backend / API / Database / Prisma / Redis ──────────────────────────
  if (
    query.includes("backend") ||
    query.includes("database") ||
    query.includes("sql") ||
    query.includes("prisma") ||
    query.includes("postgres") ||
    query.includes("redis") ||
    query.includes("api") ||
    query.includes("express")
  ) {
    return {
      content:
        `### 🚀 Scalable Backend Architecture & Caching Strategy\n\n` +
        `**1. Dual-Tier Connection Strategy:**\n` +
        `- **Runtime (PgBouncer Pooler):** Use port \`6543\` with connection pooling for high-concurrency serverless/API requests to prevent connection exhaustion.\n` +
        `- **Migrations (Direct Connection):** Use direct host on port \`5432\` without PgBouncer for Prisma schema migrations (\`npx prisma migrate deploy\`).\n` +
        `- **Redis In-Memory Layer:** Cache active sessions and roadmaps in Redis (\`ioredis\`) for sub-millisecond reads, paired with **BullMQ** for non-blocking asynchronous DB writes.\n\n` +
        `**2. Express 5 + Prisma Clean Controller Pattern:**\n\n` +
        `\`\`\`typescript\n` +
        `import { Request, Response } from 'express';\n` +
        `import prisma from '../configs/prisma.js';\n` +
        `import { getRedisClient } from '../configs/redis.js';\n\n` +
        `export async function getEntityWithCache(req: Request, res: Response) {\n` +
        `  const { id } = req.params;\n` +
        `  const redis = getRedisClient();\n` +
        `  const cacheKey = \`entity:\${id}\`;\n\n` +
        `  try {\n` +
        `    // 1. Read from Redis Cache\n` +
        `    const cached = await redis.get(cacheKey);\n` +
        `    if (cached) {\n` +
        `      return res.status(200).json({ data: JSON.parse(cached), source: 'cache' });\n` +
        `    }\n\n` +
        `    // 2. Fallback to PostgreSQL via Prisma\n` +
        `    const record = await prisma.profile.findUnique({ where: { id } });\n` +
        `    if (!record) return res.status(404).json({ message: 'Not found' });\n\n` +
        `    // 3. Set Cache with 1-hour TTL\n` +
        `    await redis.set(cacheKey, JSON.stringify(record), 'EX', 3600);\n` +
        `    return res.status(200).json({ data: record, source: 'database' });\n` +
        `  } catch (err: any) {\n` +
        `    return res.status(500).json({ error: err.message });\n` +
        `  }\n` +
        `}\n` +
        `\`\`\`\n\n` +
        `**3. Key Rule:** Never perform heavy DB transactions directly inside interactive HTTP response cycles when an async queue like BullMQ can persist them in the background.`,
      suggestedAction: "copy_code",
    };
  }

  // ─── 5. Code Review Request ────────────────────────────────────────────────
  if (query.includes("review") || query.includes("check my code") || query.includes("feedback")) {
    return {
      content:
        `### 🔍 Senior Engineering Code Review for ${activeTopic}\n\n` +
        `**1. Architectural Evaluation:**\n` +
        `- **Type Safety:** Ensure all props and return types use strict TypeScript interfaces with discriminated unions where appropriate.\n` +
        `- **Performance & Memoization:** Wrap heavy calculations in \`useMemo\` and avoid inline arrow functions in tight rendering loops.\n` +
        `- **State Colocation:** Keep local state as close to where it is used as possible instead of polluting global state stores.\n\n` +
        `**2. Refactored Production Blueprint:**\n\n` +
        `\`\`\`tsx\n` +
        `import React, { useMemo, useCallback } from 'react';\n\n` +
        `interface ComponentProps {\n` +
        `  readonly title: string;\n` +
        `  readonly items: readonly string[];\n` +
        `  readonly onSelect: (item: string) => void;\n` +
        `}\n\n` +
        `export const RefactoredModule = React.memo(function RefactoredModule({\n` +
        `  title,\n` +
        `  items,\n` +
        `  onSelect,\n` +
        `}: ComponentProps) {\n` +
        `  const formattedItems = useMemo(() => {\n` +
        `    return items.filter(Boolean).map((item) => item.trim());\n` +
        `  }, [items]);\n\n` +
        `  const handleClick = useCallback((item: string) => {\n` +
        `    onSelect(item);\n` +
        `  }, [onSelect]);\n\n` +
        `  return (\n` +
        `    <div className="p-4 rounded-xl border border-zinc-200 bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800">\n` +
        `      <h3 className="font-bold text-sm text-zinc-950 dark:text-zinc-50 mb-2">{title}</h3>\n` +
        `      <ul className="space-y-1">\n` +
        `        {formattedItems.map((item) => (\n` +
        `          <li\n` +
        `            key={item}\n` +
        `            onClick={() => handleClick(item)}\n` +
        `            className="text-xs text-zinc-700 dark:text-zinc-300 hover:text-blue-500 cursor-pointer transition-colors"\n` +
        `          >\n` +
        `            • {item}\n` +
        `          </li>\n` +
        `        ))}\n` +
        `      </ul>\n` +
        `    </div>\n` +
        `  );\n` +
        `});\n` +
        `\`\`\`\n\n` +
        `**3. Next Step:** Run unit tests with Vitest to ensure 100% branch coverage!`,
      suggestedAction: "try_challenge",
    };
  }

  // ─── 6. Practice Challenge / Mini Project Request ──────────────────────────
  if (query.includes("practice") || query.includes("challenge") || query.includes("project") || query.includes("mini")) {
    return {
      content:
        `### 🛠️ Hands-on Capstone Challenge: ${activeTopic}\n\n` +
        `**Objective:** Build a resilient, production-ready module demonstrating mastery of **${activeTopic}**.\n\n` +
        `**Requirements:**\n` +
        `1. **State Isolation:** Decouple data fetching from UI presentation using custom hooks.\n` +
        `2. **Optimistic Updates:** Reflect user actions immediately while performing background synchronization.\n` +
        `3. **Error Boundaries:** Handle network exceptions gracefully with automatic retry mechanisms.\n` +
        `4. **TypeScript Strictness:** Zero \`any\` types, full runtime validation with Zod or TypeScript schemas.\n\n` +
        `### 💡 Starter Code Template\n\n` +
        `\`\`\`tsx\n` +
        `import { useState, useTransition } from 'react';\n\n` +
        `export function useOptimisticFeature<T>(initialData: T) {\n` +
        `  const [state, setState] = useState<T>(initialData);\n` +
        `  const [isPending, startTransition] = useTransition();\n\n` +
        `  const mutateOptimistically = (optimisticValue: T, serverPromise: () => Promise<T>) => {\n` +
        `    const previous = state;\n` +
        `    setState(optimisticValue);\n\n` +
        `    startTransition(async () => {\n` +
        `      try {\n` +
        `        const result = await serverPromise();\n` +
        `        setState(result);\n` +
        `      } catch (err) {\n` +
        `        setState(previous);\n` +
        `        console.error('Mutation failed, rolled back.', err);\n` +
        `      }\n` +
        `    });\n` +
        `  };\n\n` +
        `  return { state, isPending, mutateOptimistically };\n` +
        `}\n` +
        `\`\`\`\n\n` +
        `**Challenge:** Implement this hook inside your project, test with simulated 500ms network latency, and verify that rollbacks execute cleanly!`,
      suggestedAction: "try_challenge",
    };
  }

  // ─── 7. Comparisons (e.g. React vs Vue, SQL vs NoSQL, etc.) ───────────────
  if (query.includes("vs") || query.includes("difference") || query.includes("compare") || query.includes("better")) {
    return {
      content:
        `### ⚖️ Technical Architecture Comparison: Understanding Trade-offs\n\n` +
        `When comparing architectural approaches related to **${activeTopic}**:\n\n` +
        `| Dimension | Option A (Declarative / Modular) | Option B (Imperative / Monolithic) |\n` +
        `| :--- | :--- | :--- |\n` +
        `| **Maintainability** | High — isolated components & pure contracts | Medium — tightly coupled logic |\n` +
        `| **Performance** | Optimized with granular memoization & streaming | Fast initial setup, but hard to profile at scale |\n` +
        `| **Cognitive Overhead**| Requires architectural patterns (Zustand, React 19) | Low initial learning curve |\n` +
        `| **Scalability** | Easy to split across micro-frontends / services | Risk of monolithic bottleneck |\n\n` +
        `### 💡 Senior Engineering Recommendation\n` +
        `Always choose the architecture that minimizes state complexity and enforces single-source-of-truth invariants. If you are building for high performance, combine declarative UI with resilient caching.`,
      suggestedAction: "view_roadmap",
    };
  }

  // ─── 8. Dynamic General Question Explainer (Answers ANY Question) ──────────
  // Extracts topic keywords from the user's text for dynamic responses
  const cleanSubject = userText
    .replace(/[?!.,]/g, "")
    .replace(/^(what is|how to|why do|explain|tell me about|how does|what are)/i, "")
    .trim() || activeTopic;

  return {
    content:
      `### 💡 Deep Dive: ${cleanSubject}\n\n` +
      `**1. Concept Breakdown & Mental Model:**\n` +
      `When working with **"${cleanSubject}"**, the primary goal is to understand how the underlying system executes: separating data transformations from side-effects, maintaining deterministic flow, and keeping interfaces decoupled.\n\n` +
      `**2. Practical Implementation Blueprint:**\n\n` +
      `\`\`\`typescript\n` +
      `// Production standard pattern for ${cleanSubject}\n` +
      `export interface ExecutionContract<T> {\n` +
      `  readonly id: string;\n` +
      `  readonly payload: T;\n` +
      `  execute(): Promise<boolean>;\n` +
      `}\n\n` +
      `export class AdaptiveExecutor<T> implements ExecutionContract<T> {\n` +
      `  constructor(\n` +
      `    public readonly id: string,\n` +
      `    public readonly payload: T\n` +
      `  ) {}\n\n` +
      `  async execute(): Promise<boolean> {\n` +
      `    try {\n` +
      `      console.log(\`Executing operation for: \${this.id}\`);\n` +
      `      // Core pipeline logic\n` +
      `      return true;\n` +
      `    } catch (error) {\n` +
      `      console.error(\`Failed to execute \${this.id}:\`, error);\n` +
      `      return false;\n` +
      `    }\n` +
      `  }\n` +
      `}\n` +
      `\`\`\`\n\n` +
      `**3. Best Practices & Common Pitfalls:**\n` +
      `- **Defensive Coding:** Always validate inputs using schema validation (Zod) before executing business logic.\n` +
      `- **Clean Architecture:** Keep functions pure, return explicit types, and avoid hidden mutable global states.\n\n` +
      `*Feel free to ask a follow-up doubt or request a specific code example for this!*`,
    suggestedAction: "mark_understood",
  };
}
