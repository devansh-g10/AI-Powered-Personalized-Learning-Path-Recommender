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
 * Grounded in the user's active roadmap, current milestone, progress %, and skill gaps.
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
    const weakestComp = [...skillCompetencies].sort((a, b) => a.score - b.score)[0];
    const strongestComp = [...skillCompetencies].sort((a, b) => b.score - a.score)[0];

    const pathTitle = activePath?.title || "Frontend Engineering";
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

  // ─── 2. Code Review Request ────────────────────────────────────────────────
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
        `  // Efficient memoized transformation\n` +
        `  const formattedItems = useMemo(() => {\n` +
        `    return items.filter(Boolean).map((item) => item.trim());\n` +
        `  }, [items]);\n\n` +
        `  const handleClick = useCallback((item: string) => {\n` +
        `    onSelect(item);\n` +
        `  }, [onSelect]);\n\n` +
        `  return (\n` +
        `    <div className="p-4 rounded-xl border border-zinc-200 bg-white shadow-sm">\n` +
        `      <h3 className="font-bold text-sm text-zinc-950 mb-2">{title}</h3>\n` +
        `      <ul className="space-y-1">\n` +
        `        {formattedItems.map((item) => (\n` +
        `          <li\n` +
        `            key={item}\n` +
        `            onClick={() => handleClick(item)}\n` +
        `            className="text-xs text-zinc-700 hover:text-[#2b7fff] cursor-pointer transition-colors"\n` +
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

  // ─── 3. Practice Challenge / Mini Project Request ──────────────────────────
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
        `    // 1. Apply optimistic state\n` +
        `    const previous = state;\n` +
        `    setState(optimisticValue);\n\n` +
        `    // 2. Perform async server operation\n` +
        `    startTransition(async () => {\n` +
        `      try {\n` +
        `        const result = await serverPromise();\n` +
        `        setState(result);\n` +
        `      } catch (err) {\n` +
        `        // Rollback on failure\n` +
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

  // ─── 4. Mock Interview / Technical Questions ──────────────────────────────
  if (query.includes("interview") || query.includes("question") || query.includes("mock") || query.includes("test me")) {
    return {
      content:
        `### 🎯 Senior Technical Mock Interview: ${activeTopic}\n\n` +
        `**Question:**\n` +
        `> "When building a high-traffic production application handling asynchronous streams and complex UI trees, what architectural trade-offs exist between state colocation, context providers, and external atomic stores?"\n\n` +
        `### 📋 Ideal Response Rubric\n\n` +
        `1. **Context API Limitations:** Explain why Context API triggers re-renders on all consumer components whenever any slice of context value changes (lack of granular selectors).\n` +
        `2. **Atomic & External Stores (Zustand/Jotai):** Detail how subscription-based state avoids top-level tree re-renders by only re-rendering components subscribed to specific selectors.\n` +
        `3. **Server vs Client State:** Differentiate between ephemeral UI state and server state caching pipelines.\n\n` +
        `### 💬 Practice Prompt\n` +
        `Type out your answer or explanation below, and I will evaluate your technical precision and suggest architectural improvements!`,
      suggestedAction: "try_challenge",
    };
  }

  // ─── 5. General Concept Explanation (Default Learning Structured Response) 
  return {
    content:
      `### 🧠 Core Architectural Mental Model: ${activeTopic}\n\n` +
      `**1. Fundamental Principle:**\n` +
      `Mastering **${activeTopic}** requires understanding the underlying execution model: decouple side-effects from pure rendering logic, preserve deterministic data flow, and optimize memory lifecycles.\n\n` +
      `**2. Production Code Blueprint:**\n\n` +
      `\`\`\`tsx\n` +
      `import { useState, useEffect, useCallback } from 'react';\n\n` +
      `// High-performance pattern for ${activeTopic}\n` +
      `export function useAdaptivePipeline(config: { enabled: boolean; maxRetries: number }) {\n` +
      `  const [status, setStatus] = useState<'idle' | 'executing' | 'success' | 'error'>('idle');\n\n` +
      `  const execute = useCallback(async (payload: unknown) => {\n` +
      `    setStatus('executing');\n` +
      `    try {\n` +
      `      // Core pipeline logic\n` +
      `      await new Promise((resolve) => setTimeout(resolve, 300));\n` +
      `      setStatus('success');\n` +
      `    } catch {\n` +
      `      setStatus('error');\n` +
      `    }\n` +
      `  }, []);\n\n` +
      `  return { status, execute };\n` +
      `}\n` +
      `\`\`\`\n\n` +
      `**3. Why This Works & Common Pitfalls to Avoid:**\n` +
      `- **Pitfall:** Avoid creating new function references inside render methods without \`useCallback\`, as this breaks shallow reference equality checks.\n` +
      `- **Best Practice:** Keep interfaces immutable with \`readonly\` modifiers to enforce functional purity.\n\n` +
      `**4. Next Step:** Once you feel confident with this concept, mark this milestone as understood on your **Roadmap**!`,
    suggestedAction: "mark_understood",
  };
}
