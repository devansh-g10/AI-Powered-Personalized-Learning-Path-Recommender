import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Sparkles,
  ArrowRight,
  Route,
  Bot,
  Compass,
  Award,
  BookOpen,
  ChevronDown,
  ShieldCheck,
  Terminal,
  Check,
  Star,
  Zap,
  HelpCircle,
  Activity,
  Code2,
  Lock,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import RevealOnScroll from "@/components/motion/RevealOnScroll";
import StaggerContainer from "@/components/motion/StaggerContainer";
import AnimatedGradientText from "@/components/motion/AnimatedGradientText";
import MagneticButton from "@/components/motion/MagneticButton";
import TypewriterCode from "@/components/motion/TypewriterCode";
import {
  fadeUpVariants,
  defaultTransition,
  easeOut,
  useReducedMotion,
} from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

/* ─── Stagger child variant (used by children inside StaggerContainer) ────── */
const staggerChild = fadeUpVariants("up", 24);

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"frontend" | "ai" | "devops">("frontend");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const reduced = useReducedMotion();

  /* ─── GSAP: Ambient background blob animation ────────────────────────────── */
  const heroBlobRef = useRef<HTMLDivElement>(null);
  const heroBlobRef2 = useRef<HTMLDivElement>(null);
  const ctaBlobRef1 = useRef<HTMLDivElement>(null);
  const ctaBlobRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;

    const ctx = gsap.context(() => {
      // Hero ambient blobs
      if (heroBlobRef.current) {
        gsap.to(heroBlobRef.current, {
          y: 12,
          scale: 1.04,
          duration: 15,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
      if (heroBlobRef2.current) {
        gsap.to(heroBlobRef2.current, {
          y: -10,
          x: 8,
          scale: 1.06,
          duration: 18,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      // CTA section ambient orbs
      if (ctaBlobRef1.current) {
        gsap.to(ctaBlobRef1.current, {
          y: 15,
          x: -10,
          scale: 1.08,
          duration: 20,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
      if (ctaBlobRef2.current) {
        gsap.to(ctaBlobRef2.current, {
          y: -12,
          x: 10,
          scale: 1.05,
          duration: 22,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    });

    return () => ctx.revert();
  }, [reduced]);

  /* ─── Cursor-aware card highlight ────────────────────────────────────────── */
  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  }, []);

  const trackTabs = {
    frontend: {
      title: "Frontend & Web Architecture",
      badge: "Fast Track • 10 Weeks",
      desc: "From DOM reconciliation & reactive state patterns to React 19 server actions, microfrontends, and Core Web Vitals optimization.",
      stages: [
        { name: "Modern ECMAScript & Async Mental Model", tag: "Completed", done: true },
        { name: "React 19 Hooks, Fiber Diffing & Concurrent Mode", tag: "In Progress", done: false, active: true },
        { name: "Zustand & Server State Caching Pipelines", tag: "Upcoming", done: false },
        { name: "Enterprise Testing with Vitest & Playwright", tag: "Upcoming", done: false },
      ],
      codeSnippet: `// PathAI Adaptive State Machine
const useAdaptiveCurriculum = (velocity, target) => {
  return useMemo(() => {
    return dynamicPruneStages(target, { depth: 'deep', pace: velocity });
  }, [velocity, target]);
};`,
    },
    ai: {
      title: "Full-Stack AI Agents & LLM Systems",
      badge: "Trending • 12 Weeks",
      desc: "Build production-grade autonomous agent systems with LangChain, Next.js App Router, vector embeddings, and tool calling protocols.",
      stages: [
        { name: "Prompt Engineering & Structured JSON Outputs", tag: "Completed", done: true },
        { name: "RAG Architectures & Vector Similarity Search", tag: "In Progress", done: false, active: true },
        { name: "Multi-Agent Orchestration & ReAct Loops", tag: "Upcoming", done: false },
        { name: "Production Fastify & Streaming Backends", tag: "Upcoming", done: false },
      ],
      codeSnippet: `// Autonomous Agent Tool Calling Execution
const agentLoop = async (userIntent) => {
  const plan = await llm.generatePlan(userIntent);
  return executeToolChain(plan.tools, { maxTokens: 4096 });
};`,
    },
    devops: {
      title: "DevOps, Cloud Containers & CI/CD",
      badge: "Industry Ready • 8 Weeks",
      desc: "Master Linux system internals, multi-stage Docker builds, Kubernetes cluster management, and automated GitHub Actions deployment.",
      stages: [
        { name: "Linux System Internals & Bash Scripting", tag: "Completed", done: true },
        { name: "Multi-Stage Dockerfile Optimization", tag: "In Progress", done: false, active: true },
        { name: "Kubernetes Pods, Ingress & Helm Charts", tag: "Upcoming", done: false },
        { name: "Automated GitHub Actions CI/CD Pipeline", tag: "Upcoming", done: false },
      ],
      codeSnippet: `// Docker multi-stage zero-vulnerability build
FROM node:20-alpine AS builder
WORKDIR /app && COPY . . && RUN npm run build
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html`,
    },
  };

  const currentTrack = trackTabs[activeTab];

  const faqs = [
    {
      q: "How does PathAI personalize my curriculum compared to static courses?",
      a: "Unlike static playlists, PathAI assesses your starting skills, weekly hours, and target goal. It algorithmically prunes redundant topics and dynamically recalculates timelines as you check off verified milestones.",
    },
    {
      q: "How does the AI Tutor relate to my specific learning path?",
      a: "When you click into the AI Tutor from any roadmap milestone, PathAI passes your current stage context, tested concepts, and difficulty level so answers provide exact practical examples without generic fluff.",
    },
    {
      q: "Can I use PathAI completely free without signing in?",
      a: "Yes! PathAI includes full Open Guest Access with localStorage persistence. You can craft roadmaps, check milestones, practice in the assistant, and track verified skills without any paywall.",
    },
    {
      q: "Can I export or adapt my roadmap as my goals evolve?",
      a: "Absolutely. You can export your full roadmap as a formatted JSON document, generate shareable links, or ask the AI to re-adapt the curriculum on the fly whenever your priorities shift.",
    },
  ];

  return (
    <div className="flex flex-col gap-28 pb-20 w-full relative px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-[#f8faff] via-[#f1f6ff]/60 to-[#f5f8ff]">
      {/* ─── Rich Dot & Linear Grid Background Patterns ───────────────────────── */}
      <div className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-50 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_20%,#000_60%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25" />

      {/* ─── Glowing Ambient Multi-Tone Light Layers ────────────────────────── */}
      {/* Hero Ambient Flare */}
      <div
        ref={heroBlobRef}
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-tr from-[#2b7fff]/30 via-indigo-500/20 to-purple-500/15 blur-[140px] rounded-full"
      />
      {/* Interactive Track Area Glow */}
      <div
        ref={heroBlobRef2}
        className="pointer-events-none absolute top-[650px] -right-32 w-[650px] h-[650px] bg-gradient-to-br from-cyan-400/20 via-[#2b7fff]/18 to-indigo-500/12 blur-[150px] rounded-full"
      />
      {/* Core Features Glow */}
      <div className="pointer-events-none absolute top-[1450px] -left-32 w-[700px] h-[700px] bg-gradient-to-tr from-purple-500/18 via-indigo-400/15 to-blue-400/10 blur-[150px] rounded-full" />
      {/* Workflow Glow */}
      <div className="pointer-events-none absolute top-[2300px] right-0 w-[750px] h-[600px] bg-gradient-to-bl from-teal-400/15 via-blue-500/15 to-indigo-500/12 blur-[160px] rounded-full" />
      {/* FAQ & CTA Backdrop Glow */}
      <div className="pointer-events-none absolute top-[3100px] left-1/2 -translate-x-1/2 w-[950px] h-[600px] bg-gradient-to-b from-indigo-400/15 via-[#2b7fff]/15 to-purple-500/10 blur-[160px] rounded-full" />

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative pt-6 sm:pt-14 text-center flex flex-col items-center gap-7 max-w-5xl mx-auto z-10">
        {/* Floating Decorative Chips (Desktop) */}




        {/* Hero Title */}
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="font-display text-[clamp(3.2rem,6.5vw,6.2rem)] font-semibold leading-[0.98] tracking-[-0.06em] text-zinc-950">
            <motion.span
              className="inline-block"
              initial={reduced ? undefined : { opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...defaultTransition, delay: 0.15 }}
            >
              Stop guessing
            </motion.span>
            <br />
            <motion.span
              className="inline-block text-zinc-400"
              initial={reduced ? undefined : { opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...defaultTransition, delay: 0.28 }}
            >
              what to learn next.
            </motion.span>
            <br />
            <motion.span
              className="inline-block"
              initial={reduced ? undefined : { opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...defaultTransition, delay: 0.42 }}
            >
              <AnimatedGradientText className="bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
                PathAI knows.
              </AnimatedGradientText>
            </motion.span>
          </h1>
        </div>


        {/* Action Buttons */}
        <StaggerContainer staggerMs={100} delayMs={600} className="flex flex-col sm:flex-row items-center gap-3.5 mt-2 w-full sm:w-auto">
          <motion.div variants={staggerChild} transition={{ ...defaultTransition, duration: 0.45 }}>
            <MagneticButton>
              <Button
                size="lg"
                onClick={() => navigate("/conversations/new/questionnaire")}
                className="w-full sm:w-auto h-12 px-8 rounded-xl bg-[#2b7fff] hover:bg-[#2563eb] text-white font-bold text-sm shadow-[0_12px_28px_-6px_rgba(43,127,255,0.45)] gap-2.5 cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                <Sparkles className="size-4" />
                Build My Custom Roadmap
                <ArrowRight className="size-4" />
              </Button>
            </MagneticButton>
          </motion.div>

          <motion.div variants={staggerChild} transition={{ ...defaultTransition, duration: 0.45 }}>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/roadmap")}
              className="w-full sm:w-auto h-12 px-7 rounded-xl border-white/80 bg-white/70 hover:bg-white/95 backdrop-blur-xl text-zinc-800 font-semibold text-sm shadow-sm gap-2 cursor-pointer transition-all hover:border-[#2b7fff]/30"
            >
              <Compass className="size-4 text-[#2b7fff]" />
              Explore Flagship Roadmap
            </Button>
          </motion.div>
        </StaggerContainer>

        {/* Floating Decorative Chips (Desktop) — positioned below hero to avoid overlap */}
        <div className="hidden lg:flex items-center justify-center gap-6 w-full mt-2">
          <div className="flex items-center gap-2.5 glass-pill px-3.5 py-2 rounded-2xl border border-white/95 shadow-[0_12px_32px_rgba(43,127,255,0.12)] animate-float-slow pointer-events-none">
            <div className="size-8 rounded-xl bg-blue-50 text-[#2b7fff] flex items-center justify-center font-bold text-xs border border-blue-100">
              <Zap className="size-4 text-[#2b7fff]" />
            </div>
            <div className="text-left">
              <span className="block text-[11px] font-bold text-zinc-900">Adaptive Learning Path</span>
              <span className="block text-[10px] text-emerald-600 font-medium">● 98% Match Rate</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 glass-pill px-3.5 py-2 rounded-2xl border border-white/95 shadow-[0_12px_32px_rgba(99,102,241,0.12)] animate-float pointer-events-none">
            <div className="size-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100">
              <Bot className="size-4 text-indigo-600" />
            </div>
            <div className="text-left">
              <span className="block text-[11px] font-bold text-zinc-900">Live AI Learning Mentor</span>
              <span className="block text-[10px] text-[#2b7fff] font-medium">Always Available</span>
            </div>
          </div>
        </div>

        {/* ─── Interactive Glassmorphism Hero Showcase ──────────────────────── */}
        <RevealOnScroll scale distance={30} delay={0.2} duration={0.65} className="w-full mt-10">
          <div className="rounded-3xl p-1.5 sm:p-2.5 bg-gradient-to-b from-white/90 via-white/40 to-white/10 backdrop-blur-2xl border border-white shadow-[0_25px_60px_-15px_rgba(43,127,255,0.12)]">
            <div className="glass-card rounded-[22px] p-6 sm:p-8 flex flex-col gap-6 text-left">
              {/* Interactive Tab Switcher */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-200/50">
                <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-100/70 border border-zinc-200/60 backdrop-blur-md relative">
                  {(["frontend", "ai", "devops"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border-0 cursor-pointer z-10 ${activeTab === tab
                        ? "text-[#2b7fff]"
                        : "text-zinc-600 hover:text-zinc-950 bg-transparent"
                        }`}
                    >
                      {/* Animated active indicator pill */}
                      {activeTab === tab && (
                        <motion.div
                          layoutId="activeTabPill"
                          className="absolute inset-0 bg-white rounded-lg shadow-sm"
                          style={{ zIndex: -1 }}
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                      {tab === "frontend" ? "Frontend Core" : tab === "ai" ? "AI Agents & LLM" : "Cloud DevOps"}
                    </button>
                  ))}
                </div>

                <Badge className="bg-[#2b7fff]/10 text-[#2b7fff] border-0 text-xs px-3 py-1 font-semibold">
                  {currentTrack.badge}
                </Badge>
              </div>

              {/* Track Headline & Description with tab transition */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={reduced ? undefined : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                >
                  <h3 className="font-display font-bold text-xl text-zinc-950 mb-1">{currentTrack.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-2xl">{currentTrack.desc}</p>
                </motion.div>
              </AnimatePresence>

              {/* Split View: Stages Timeline + Code Preview Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Stages List (7 cols) */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`stages-${activeTab}`}
                    className="lg:col-span-7 flex flex-col gap-2.5"
                    initial={reduced ? undefined : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduced ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {currentTrack.stages.map((stg, idx) => (
                      <motion.div
                        key={stg.name}
                        initial={reduced ? undefined : { opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          ...defaultTransition,
                          delay: idx * 0.08,
                          duration: 0.35,
                        }}
                        whileHover={reduced ? undefined : { x: 3, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${stg.done
                          ? "bg-emerald-50/60 border-emerald-200/80 text-emerald-900"
                          : stg.active
                            ? "bg-[#2b7fff]/10 border-[#2b7fff]/30 shadow-sm"
                            : "bg-white/50 border-zinc-200/60 text-zinc-600"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="size-6 rounded-lg bg-white/80 border border-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-700">
                            {idx + 1}
                          </span>
                          <span className={`text-xs font-bold ${stg.active ? "text-[#2b7fff]" : "text-zinc-800"}`}>
                            {stg.name}
                          </span>
                        </div>

                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-2 py-0.5 font-semibold ${stg.done
                            ? "bg-emerald-100 text-emerald-800 border-0"
                            : stg.active
                              ? "bg-[#2b7fff] text-white border-0"
                              : "bg-zinc-100 text-zinc-500"
                            }`}
                        >
                          {stg.tag}
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Code Snippet Card (5 cols) */}
                <div className="lg:col-span-5 rounded-2xl bg-zinc-950 p-4 text-white shadow-xl flex flex-col gap-3 font-mono text-xs border border-zinc-800">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="size-3.5 text-[#2b7fff]" />
                      architecture-pipeline.ts
                    </span>
                    <div className="flex gap-1.5">
                      <span className="size-2 rounded-full bg-red-500/80" />
                      <span className="size-2 rounded-full bg-amber-500/80" />
                      <span className="size-2 rounded-full bg-emerald-500/80" />
                    </div>
                  </div>

                  <TypewriterCode
                    code={currentTrack.codeSnippet}
                    speed={22}
                    className="text-[11px] leading-relaxed text-blue-200 overflow-x-auto whitespace-pre font-mono"
                  />

                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="size-3" /> Ready to learn
                    </span>
                    <Button
                      size="sm"
                      onClick={() => navigate("/roadmap")}
                      className="h-7 text-[11px] px-2.5 bg-[#2b7fff] text-white hover:bg-[#2563eb] rounded-lg gap-1"
                    >
                      Open Track <ArrowRight className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* ─── Core Value Pillars ───────────────────────────────────────────── */}
      <section className="flex flex-col gap-10 z-10 max-w-7xl mx-auto w-full">
        <RevealOnScroll className="text-center max-w-2xl mx-auto flex flex-col items-center gap-3">
          <div className="glass-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#2b7fff] shadow-sm">
            <Sparkles className="size-3.5 text-[#2b7fff]" />
            <span>YOUR LEARNING JOURNEY</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-zinc-950 tracking-[-0.040em]">
            <span className="bg-gradient-to-r from-[#2b7fff] via-indigo-600 to-purple-600 bg-clip-text text-transparent">A Smarter Path From Learning to Building</span>
          </h2>
        </RevealOnScroll>

        <StaggerContainer staggerMs={90} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Adaptive Learning Trees */}
          <motion.div
            variants={staggerChild}
            transition={{ ...defaultTransition, duration: 0.45 }}
            onMouseMove={handleCardMouseMove}
            className="glass-card glass-card-hover card-cursor-highlight rounded-3xl p-6 flex flex-col justify-between gap-5 text-left group border border-white/90 shadow-[0_10px_30px_-10px_rgba(43,127,255,0.08)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />
            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="size-12 rounded-2xl bg-gradient-to-br from-[#2b7fff]/20 via-[#2b7fff]/10 to-transparent text-[#2b7fff] flex items-center justify-center border border-[#2b7fff]/25 shadow-sm group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(43,127,255,0.3)] transition-all">
                  <Route className="size-6" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-[#2b7fff] border border-blue-100">
                  Dynamic Tree
                </span>
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-[#2b7fff] block mb-1">
                  Adaptive Sequence
                </span>
                <h3 className="font-display font-bold text-lg text-zinc-950 mb-2">Adaptive Learning Path</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Get a learning path built around your skills, goals, and gaps.                </p>
              </div>
            </div>

            {/* Micro-preview illustration */}
            <div className="rounded-xl p-2.5 bg-zinc-50/80 border border-zinc-200/60 flex flex-col gap-1.5 relative z-10">
              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-medium">
                <span>Milestone Graph</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500" /> 98% Match
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-zinc-700">
                <span className="px-2 py-0.5 rounded bg-white border border-zinc-200 shadow-2xs">Foundations</span>
                <span className="text-zinc-400">➔</span>
                <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#2b7fff] shadow-2xs">Async State</span>
                <span className="text-zinc-400">➔</span>
                <span className="px-2 py-0.5 rounded bg-white border border-zinc-200 text-zinc-400">Edge</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Grounded AI Tutor */}
          <motion.div
            variants={staggerChild}
            transition={{ ...defaultTransition, duration: 0.45 }}
            onMouseMove={handleCardMouseMove}
            className="glass-card glass-card-hover card-cursor-highlight rounded-3xl p-6 flex flex-col justify-between gap-5 text-left group border border-white/90 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.08)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-indigo-500/10 to-transparent text-indigo-600 flex items-center justify-center border border-indigo-500/25 shadow-sm group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all">
                  <Bot className="size-6" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                  Smart Tutor
                </span>
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-indigo-600 block mb-1">
                  Contextual AI Tutor
                </span>
                <h3 className="font-display font-bold text-lg text-zinc-950 mb-2">AI Learning Assistant</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Get clear answers, code examples, and guidance based on what you’re learning.
                </p>
              </div>
            </div>

            {/* Micro-preview illustration */}
            <div className="rounded-xl p-2.5 bg-zinc-50/80 border border-zinc-200/60 flex flex-col gap-1.5 relative z-10">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-600 font-medium">AI Chat Preview</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500" /> Online
                </span>
              </div>
              <div className="flex flex-col gap-1 text-[10px]">
                <div className="px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium">Q: Explain useEffect cleanup</div>
                <div className="px-2 py-1 rounded-lg bg-white border border-zinc-200 text-zinc-700 font-medium">A: When your component unmounts…</div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Verified Skill Competency */}
          <motion.div
            variants={staggerChild}
            transition={{ ...defaultTransition, duration: 0.45 }}
            onMouseMove={handleCardMouseMove}
            className="glass-card glass-card-hover card-cursor-highlight rounded-3xl p-6 flex flex-col justify-between gap-5 text-left group border border-white/90 shadow-[0_10px_30px_-10px_rgba(139,92,246,0.08)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />
            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="size-12 rounded-2xl bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent text-purple-600 flex items-center justify-center border border-purple-500/25 shadow-sm group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all">
                  <Award className="size-6" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                  Skill Radar
                </span>
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-purple-600 block mb-1">
                  Quantifiable Progress
                </span>
                <h3 className="font-display font-bold text-lg text-zinc-950 mb-2">Skill Progress Tracker</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Track your progress with clear milestones and skill metrics.                </p>
              </div>
            </div>

            {/* Micro-preview illustration */}
            <div className="rounded-xl p-2.5 bg-zinc-50/80 border border-zinc-200/60 flex flex-col gap-1.5 relative z-10">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-600 font-medium">Architecture Mastery</span>
                <span className="font-bold text-purple-600">88%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-200 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-[#2b7fff] rounded-full w-[88%]" />
              </div>
            </div>
          </motion.div>

          {/* Card 4: Curated Resource Engine */}
          <motion.div
            variants={staggerChild}
            transition={{ ...defaultTransition, duration: 0.45 }}
            onMouseMove={handleCardMouseMove}
            className="glass-card glass-card-hover card-cursor-highlight rounded-3xl p-6 flex flex-col justify-between gap-5 text-left group border border-white/90 shadow-[0_10px_30px_-10px_rgba(6,182,212,0.08)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="size-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-cyan-500/10 to-transparent text-cyan-600 flex items-center justify-center border border-cyan-500/25 shadow-sm group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
                  <BookOpen className="size-6" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-600 border border-cyan-100">
                  Curated Catalog
                </span>
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-cyan-600 block mb-1">
                  Curated Resources
                </span>
                <h3 className="font-display font-bold text-lg text-zinc-950 mb-2">Learn From the Right Sources</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Get relevant docs, tutorials, and real projects selected for your learning path.
                </p>
              </div>
            </div>

            {/* Micro-preview illustration */}
            <div className="rounded-xl p-2.5 bg-zinc-50/80 border border-zinc-200/60 flex items-center justify-between gap-1 text-[10px] relative z-10">
              <span className="px-2 py-0.5 rounded-md bg-white border border-zinc-200 font-semibold text-zinc-700 flex items-center gap-1 shadow-2xs">
                <Star className="size-2.5 text-amber-500 fill-amber-500" /> GitHub 14k★
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-zinc-200 font-semibold text-zinc-700 shadow-2xs">
                Official Docs
              </span>
            </div>
          </motion.div>
        </StaggerContainer>
      </section>

      {/* ─── How It Works (3-Step Workflow) ─────────────────────────────── */}
      <RevealOnScroll distance={35} duration={0.6}>
        <section className="flex flex-col gap-10 z-10 max-w-7xl mx-auto w-full relative">
          <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-3 relative z-10">
            <div className="glass-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#2b7fff] shadow-sm">
              <Sparkles className="size-3.5 text-[#2b7fff]" />
              <span>HOW IT WORKS</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-zinc-950 tracking-[-0.040em]">
              <span className="bg-gradient-to-r from-[#2b7fff] via-indigo-600 to-purple-600 bg-clip-text text-transparent">How Your Personalized Learning Journey Works</span>
            </h2>
          </div>

          {/* Interactive Step Cards */}
          <StaggerContainer staggerMs={120} className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Card 1 — DISCOVER */}
            <motion.div
              variants={staggerChild}
              transition={{ ...defaultTransition, duration: 0.45 }}
              className="flex flex-col justify-between gap-6 p-7 rounded-[24px] bg-white/95 backdrop-blur-sm border border-zinc-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_-12px_rgba(43,127,255,0.14)] hover:border-blue-400/80 transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden"
            >
              {/* Top Accent Line on Hover */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="size-11 rounded-2xl bg-blue-50/90 border border-blue-200/70 text-[#2b7fff] flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform duration-300">
                    <Compass className="size-5" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-blue-600 animate-pulse" />
                    98% Fit Match
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-zinc-950 mb-1.5 group-hover:text-blue-600 transition-colors">
                    Define Your Learning Goal
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                    Choose the skill you want to master, your current level, and how much time you can commit each week.
                  </p>
                </div>
              </div>

              {/* Step 1 Live Interactive Intake Configurator */}
              <div className="p-4 rounded-xl bg-gradient-to-b from-zinc-50/90 via-white to-blue-50/30 border border-zinc-200/80 flex flex-col gap-3 shadow-2xs">
                {/* Target Track */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-zinc-200/80 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                      <Target className="size-3.5" />
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold text-zinc-900">React + AI Engineering</span>
                      <span className="block text-[9px] text-zinc-400">Full-Stack Track</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active
                  </span>
                </div>

                {/* Level Selector */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-500 font-medium">Skill Proficiency</span>
                    <span className="font-bold text-blue-700">Intermediate (~1-2 yrs)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] font-semibold text-center">
                    <span className="py-1.5 rounded-lg bg-white border border-zinc-200/70 text-zinc-400">Beginner</span>
                    <span className="py-1.5 rounded-lg bg-blue-50 border border-blue-300 text-blue-700 font-bold shadow-2xs flex items-center justify-center gap-1">
                      <Check className="size-3 text-blue-600" /> Mid
                    </span>
                    <span className="py-1.5 rounded-lg bg-white border border-zinc-200/70 text-zinc-400">Senior</span>
                  </div>
                </div>

                {/* Commitment Meter */}
                <div className="flex flex-col gap-1.5 pt-1.5 border-t border-zinc-200/60">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-medium">Time Commitment</span>
                    <span className="font-bold text-blue-700 text-xs">6–8 hrs / week</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-200/80 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full w-[65%]" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-0.5">
                    <span>Pace: Adaptive</span>
                    <span className="text-zinc-600 font-semibold">Est. 6 Weeks to Capstone</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2 — PLAN */}
            <motion.div
              variants={staggerChild}
              transition={{ ...defaultTransition, duration: 0.45 }}
              className="flex flex-col justify-between gap-6 p-7 rounded-[24px] bg-white/95 backdrop-blur-sm border border-zinc-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_-12px_rgba(99,102,241,0.14)] hover:border-indigo-400/80 transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden"
            >
              {/* Top Accent Line on Hover */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="size-11 rounded-2xl bg-indigo-50/90 border border-indigo-200/70 text-indigo-600 flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform duration-300">
                    <Route className="size-5" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-2xs flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-indigo-600 animate-pulse" />
                    Auto-Calibrated
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-zinc-950 mb-1.5 group-hover:text-indigo-600 transition-colors">
                    Get Your Learning Roadmap
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                    Turn your goals and skill gaps into a focused roadmap with milestones, resources, and hands-on projects.
                  </p>
                </div>
              </div>

              {/* Step 2 Live Connected Milestone Timeline */}
              <div className="p-4 rounded-xl bg-gradient-to-b from-zinc-50/90 via-white to-indigo-50/30 border border-zinc-200/80 flex flex-col gap-2.5 shadow-2xs">
                {/* Milestone 1 */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-emerald-200/80 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="size-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Check className="size-3" />
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold text-zinc-900">01. Foundations &amp; State</span>
                      <span className="block text-[9px] text-zinc-400">TypeScript, Hooks, Async</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    100% ✓
                  </span>
                </div>

                {/* Milestone 2 (Active) */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50/90 border border-indigo-300 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="size-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <span className="size-2 rounded-full bg-white animate-pulse" />
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold text-indigo-950">02. Full-Stack AI Agents</span>
                      <span className="block text-[9px] text-indigo-600/80">LangChain, Vectors, RAG</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-extrabold text-white bg-indigo-600 px-1.5 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>

                {/* Milestone 3 */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-zinc-200/80 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="size-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">
                      03
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold text-zinc-900">03. Production Capstone</span>
                      <span className="block text-[9px] text-zinc-400">2 Verified Deployments</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-zinc-400 font-medium">Upcoming</span>
                </div>

                {/* Timeline Status Footer */}
                <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-200/60 font-medium">
                  <span className="text-indigo-700 font-semibold flex items-center gap-1">
                    <Sparkles className="size-3" /> Live Prerequisite Graph
                  </span>
                  <span className="text-zinc-600">4 Milestones</span>
                </div>
              </div>
            </motion.div>

            {/* Card 3 — BUILD */}
            <motion.div
              variants={staggerChild}
              transition={{ ...defaultTransition, duration: 0.45 }}
              className="flex flex-col justify-between gap-6 p-7 rounded-[24px] bg-white/95 backdrop-blur-sm border border-zinc-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_-12px_rgba(139,92,246,0.14)] hover:border-purple-400/80 transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden"
            >
              {/* Top Accent Line on Hover */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 via-pink-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="size-11 rounded-2xl bg-purple-50/90 border border-purple-200/70 text-purple-600 flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform duration-300">
                    <Zap className="size-5" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    AI Mentor Live
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-zinc-950 mb-1.5 group-hover:text-purple-600 transition-colors">
                    Learn, Practice &amp; Build
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                    Use the AI mentor to solve doubts, practice concepts, complete projects, and track your improvement.
                  </p>
                </div>
              </div>

              {/* Step 3 Live Interactive IDE & AI Playground */}
              <div className="p-4 rounded-xl bg-gradient-to-b from-zinc-50/90 via-white to-purple-50/30 border border-zinc-200/80 flex flex-col gap-2.5 shadow-2xs">
                {/* 4 Feature Capabilities */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-white border border-zinc-200/80 shadow-2xs flex items-center gap-2 hover:border-purple-300 transition-colors">
                    <div className="size-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Bot className="size-3.5" />
                    </div>
                    <div>
                      <span className="block font-bold text-zinc-900 text-[11px] leading-tight">Ask AI</span>
                      <span className="block text-[9px] text-zinc-400">Live Doubts</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-zinc-200/80 shadow-2xs flex items-center gap-2 hover:border-purple-300 transition-colors">
                    <div className="size-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Code2 className="size-3.5" />
                    </div>
                    <div>
                      <span className="block font-bold text-zinc-900 text-[11px] leading-tight">Practice</span>
                      <span className="block text-[9px] text-zinc-400">Code Drills</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-zinc-200/80 shadow-2xs flex items-center gap-2 hover:border-purple-300 transition-colors">
                    <div className="size-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Zap className="size-3.5" />
                    </div>
                    <div>
                      <span className="block font-bold text-zinc-900 text-[11px] leading-tight">Build</span>
                      <span className="block text-[9px] text-zinc-400">Real Apps</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-zinc-200/80 shadow-2xs flex items-center gap-2 hover:border-purple-300 transition-colors">
                    <div className="size-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Award className="size-3.5" />
                    </div>
                    <div>
                      <span className="block font-bold text-zinc-900 text-[11px] leading-tight">Feedback</span>
                      <span className="block text-[9px] text-zinc-400">Verified Rank</span>
                    </div>
                  </div>
                </div>

                {/* Live Build / Code Test Status */}
                <div className="p-2 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-[10px] flex items-center justify-between border border-zinc-800 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>✓ 12/12 Tests Passing</span>
                  </div>
                  <span className="text-zinc-400 text-[9px]">98.4% Mastery</span>
                </div>
              </div>
            </motion.div>
          </StaggerContainer>

        </section>
      </RevealOnScroll>

      {/* ─── Frequently Asked Questions (Interactive Accordion) ───────────── */}
      <section className="flex flex-col gap-9 max-w-3xl mx-auto w-full z-10 relative">
        {/* Subtle Ambient Glow Behind FAQs */}
        <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />

        <RevealOnScroll className="text-center flex flex-col items-center gap-3">
          <div className="glass-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#2b7fff] shadow-sm border border-blue-100/80">
            <HelpCircle className="size-3.5 text-[#2b7fff]" />
            <span>COMMON INQUIRIES</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-zinc-950 tracking-tight">
            <span className="bg-gradient-to-r from-[#2b7fff] via-indigo-600 to-purple-600 bg-clip-text text-transparent">Frequently Asked Questions</span>
          </h2>

        </RevealOnScroll>

        <StaggerContainer staggerMs={80} className="flex flex-col gap-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <motion.div
                key={idx}
                variants={staggerChild}
                transition={{ ...defaultTransition, duration: 0.35 }}
                className={`group rounded-2xl p-5 cursor-pointer transition-all duration-300 border ${isOpen
                  ? "border-[#2b7fff]/50 bg-white/95 shadow-[0_12px_32px_-8px_rgba(43,127,255,0.15)] ring-1 ring-[#2b7fff]/20"
                  : "border-zinc-200/80 bg-white/75 hover:bg-white/95 hover:border-zinc-300 shadow-sm hover:shadow-md"
                  }`}
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`size-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 shrink-0 ${isOpen
                      ? "bg-[#2b7fff] text-white shadow-[0_0_15px_rgba(43,127,255,0.4)]"
                      : "bg-blue-50/80 text-[#2b7fff] border border-blue-100 group-hover:bg-blue-100"
                      }`}>
                      0{idx + 1}
                    </div>
                    <h3 className={`font-semibold text-sm leading-snug transition-colors ${isOpen ? "text-zinc-950 font-bold" : "text-zinc-800 group-hover:text-zinc-950"
                      }`}>
                      {faq.q}
                    </h3>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: easeOut }}
                    className={`size-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isOpen ? "bg-blue-50 text-[#2b7fff]" : "text-zinc-400 group-hover:text-zinc-600"
                      }`}
                  >
                    <ChevronDown className="size-4" />
                  </motion.div>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: easeOut }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="mt-3.5 pl-11.5 pt-2 border-t border-zinc-100/90 flex flex-col gap-2">
                        <p className="text-xs sm:text-[13px] text-zinc-600 leading-relaxed font-normal">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </StaggerContainer>

        {/* Floating AI Tutor Support Card */}
        <RevealOnScroll delay={0.2} distance={20}>
          <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-purple-50/50">
            <div className="flex items-center gap-3 text-left">
              <div className="size-10 rounded-xl bg-[#2b7fff]/15 text-[#2b7fff] flex items-center justify-center shrink-0 border border-[#2b7fff]/30 shadow-sm">
                <Bot className="size-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-zinc-900">Have a custom question or specific tech stack in mind?</h4>
                <p className="text-[11px] text-zinc-600">Our Socratic AI Tutor can help break down prerequisites and adjust your pace.</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/assistant")}
              className="bg-[#2b7fff] hover:bg-[#2563eb] text-white text-xs font-bold px-4 h-9 rounded-xl shrink-0 cursor-pointer shadow-sm hover:scale-105 transition-all gap-1.5"
            >
              <Sparkles className="size-3.5" />
              Chat With Tutor
            </Button>
          </div>
        </RevealOnScroll>
      </section>

      {/* ─── Premium Modern CTA Section ───────────────────────────────────── */}
      <RevealOnScroll distance={35} duration={0.6}>
        <section className="relative text-center flex flex-col items-center gap-8 sm:gap-10 py-12 z-10 max-w-7xl mx-auto w-full">
          {/* 3 Extremely subtle ambient blurred gradient orbs */}
          <div
            ref={ctaBlobRef1}
            className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-blue-400/15 via-indigo-300/10 to-transparent rounded-full blur-[110px]"
          />
          <div
            ref={ctaBlobRef2}
            className="pointer-events-none absolute -bottom-24 -right-24 w-[32rem] h-[32rem] bg-gradient-to-tl from-purple-400/12 via-blue-300/8 to-transparent rounded-full blur-[120px]"
          />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/8 rounded-full blur-[100px]" />
          <div className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-30 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="glass-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase text-[#2b7fff] shadow-2xs border border-blue-100/90 bg-white/90 relative z-10"
          >
            <Sparkles className="size-3.5 text-[#2b7fff]" />
            <span>START YOUR JOURNEY</span>
          </motion.div>

          {/* Staggered Heading Reveal */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="flex flex-col gap-4 max-w-3xl mx-auto relative z-10 text-center"
          >
            <h2
              className="text-[clamp(2.4rem,5vw,4.2rem)] font-bold leading-[1.12] tracking-[-0.03em] pb-1"
              style={{
                backgroundImage: "linear-gradient(135deg, #2b7fff 0%, #4f46e5 50%, #9333ea 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
                display: "inline-block",
              }}
            >
              Build a Learning Path <br className="hidden sm:inline" /> That Fits You.
            </h2>
          </motion.div>

          {/* ─── Interactive Learning Path Journey (Goal → Roadmap → Practice → Skills) ─── */}
          <div className="w-full max-w-4xl mx-auto my-2 py-3 sm:py-6 relative z-10">
            {/* 4 Interactive Flow Nodes with inline connector */}
            <div className="relative">
              {/* Connector line from 1st to 4th node center */}
              <div
                className="hidden sm:block absolute pointer-events-none"
                style={{
                  top: "34px",
                  left: "12.5%",
                  width: "75%",
                  height: "0px",
                }}
              >
                {/* Dashed background track */}
                <div
                  className="absolute w-full"
                  style={{
                    top: "0",
                    left: "0",
                    height: "2px",
                    background: "repeating-linear-gradient(to right, #e0e0e4 0px, #e0e0e4 6px, transparent 6px, transparent 12px)",
                  }}
                />

                {/* Gradient active track (draws in on scroll) */}
                <motion.div
                  className="absolute"
                  style={{
                    top: "0",
                    left: "0",
                    height: "2.5px",
                    background: "linear-gradient(to right, #2b7fff, #6366f1, #8b5cf6, #10b981)",
                    borderRadius: "2px",
                    boxShadow: "0 0 8px rgba(43,127,255,0.35)",
                  }}
                  initial={{ width: "0%" }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: reduced ? 0.01 : 1.4, ease: "easeInOut", delay: 0.3 }}
                />

                {/* Travelling glowing dot */}
                {!reduced && (
                  <motion.div
                    className="absolute"
                    style={{
                      top: "-4px",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: "#2b7fff",
                      boxShadow: "0 0 10px 3px rgba(43,127,255,0.5)",
                    }}
                    animate={{
                      left: ["0%", "100%"],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 0.6,
                    }}
                  />
                )}
              </div>

              {/* 4 Interactive Flow Nodes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-0 relative z-10">
                {[
                  {
                    icon: Target,
                    title: "Goal",
                    desc: "Target & pace",
                    bg: "bg-blue-50/90",
                    color: "text-[#2b7fff]",
                    border: "border-blue-200/70",
                    pulseBg: "bg-blue-400",
                  },
                  {
                    icon: Route,
                    title: "Roadmap",
                    desc: "Adaptive tree",
                    bg: "bg-indigo-50/90",
                    color: "text-indigo-600",
                    border: "border-indigo-200/70",
                    pulseBg: "bg-indigo-400",
                  },
                  {
                    icon: Code2,
                    title: "Practice",
                    desc: "Guided projects",
                    bg: "bg-purple-50/90",
                    color: "text-purple-600",
                    border: "border-purple-200/70",
                    pulseBg: "bg-purple-400",
                  },
                  {
                    icon: Award,
                    title: "Skills",
                    desc: "Real competency",
                    bg: "bg-emerald-50/90",
                    color: "text-emerald-600",
                    border: "border-emerald-200/70",
                    pulseBg: "bg-emerald-400",
                  },
                ].map((step, idx) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + idx * 0.12 }}
                    whileHover={reduced ? undefined : { y: -3, transition: { duration: 0.2 } }}
                    className="flex flex-col items-center text-center gap-2.5 group py-2.5 px-1 rounded-2xl transition-all"
                  >
                    {/* Node Icon */}
                    <div className="relative">
                      <div className={`size-12 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center border ${step.border} shadow-sm group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(43,127,255,0.25)] transition-all duration-300 relative z-10`}>
                        <step.icon className="size-5" />
                      </div>
                      {/* Subtle pulsing ring */}
                      <span className={`absolute -inset-1 rounded-2xl ${step.pulseBg} animate-ping opacity-15 pointer-events-none`} />
                    </div>

                    <div>
                      <span className="block text-xs font-bold text-zinc-900 group-hover:text-[#2b7fff] transition-colors">
                        {step.title}
                      </span>
                      <span className="block text-[11px] text-zinc-500 font-medium mt-0.5">
                        {step.desc}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons & Primary CTA with Shimmer & Radial Glow */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 relative z-10 w-full sm:w-auto"
          >
            {/* Primary CTA Button with Shimmer & Soft Lift */}
            <MagneticButton>
              <div className="relative group w-full sm:w-auto">
                {/* Subtle animated radial glow behind primary button */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#2b7fff] via-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-45 transition duration-500 -z-10" />

                <Button
                  size="lg"
                  onClick={() => navigate("/conversations/new/questionnaire")}
                  className="w-full sm:w-auto h-12 px-7 rounded-xl bg-[#2b7fff] hover:bg-[#2563eb] text-white font-bold text-sm shadow-[0_8px_22px_-4px_rgba(43,127,255,0.38)] hover:shadow-[0_14px_30px_-4px_rgba(43,127,255,0.5)] gap-2 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] relative overflow-hidden group"
                >
                  {/* Subtle animated shimmer across button */}
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-out pointer-events-none" />

                  <Sparkles className="size-4 text-blue-100" />
                  <span>Create My Learning Path</span>
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </div>
            </MagneticButton>

            {/* Secondary CTA Button with subtle hover border glow */}
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/roadmap")}
              className="w-full sm:w-auto h-12 px-7 rounded-xl border-zinc-200/90 hover:border-[#2b7fff]/40 bg-white/80 hover:bg-white text-zinc-800 hover:text-zinc-950 font-semibold text-sm shadow-2xs hover:shadow-sm gap-2 cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
            >
              <Compass className="size-4 text-[#2b7fff]" />
              Explore a Sample Roadmap
            </Button>
          </motion.div>

          {/* Supporting Line */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="flex items-center justify-center flex-wrap gap-2 text-xs font-medium text-zinc-500 pt-1 relative z-10"
          >
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#2b7fff]" /> Personalized
            </span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-indigo-500" /> Practical
            </span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" /> Built Around Your Goals
            </span>
          </motion.div>
        </section>
      </RevealOnScroll>

      {/* ─── Ultra-Modern Interactive Footer ─────────────────────────────── */}
      <RevealOnScroll distance={30} duration={0.55}>
        <footer className="relative overflow-hidden rounded-[32px] sm:rounded-[36px] p-8 sm:p-12 lg:p-14 bg-gradient-to-b from-white/95 via-white/80 to-[#f4f7ff]/70 backdrop-blur-xl border border-zinc-200/80 shadow-[0_20px_50px_-20px_rgba(43,127,255,0.07)] z-10 max-w-7xl mx-auto w-full">
          {/* Subtle Ambient Orbs in footer background */}
          <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 bg-blue-400/8 rounded-full blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-400/8 rounded-full blur-[100px]" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 relative z-10">
            {/* Brand Col (2 cols) */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-gradient-to-br from-[#2b7fff] to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 ring-4 ring-blue-50">
                  <Route className="size-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-bold text-2xl tracking-tight text-zinc-950">PathAI</span>
                  <span className="text-[10px] font-semibold text-zinc-400 -mt-1 tracking-wider uppercase">Adaptive Roadmap Engine</span>
                </div>
              </div>



              {/* Status & Live Uptime Badge */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/80 text-[11px] font-semibold text-emerald-800 shadow-2xs">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  All Systems Operational
                </div>
                <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-200/60">
                  v2.4 Live
                </span>
              </div>
            </div>

            {/* Product Links */}
            <div className="flex flex-col gap-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#2b7fff]" /> Product
              </span>
              <button
                onClick={() => navigate("/dashboard")}
                className="group flex items-center text-left text-xs text-zinc-600 hover:text-[#2b7fff] transition-all bg-transparent border-0 cursor-pointer p-0"
              >
                <span className="group-hover:translate-x-1 transition-transform">Learning Dashboard</span>
              </button>
              <button
                onClick={() => navigate("/roadmap")}
                className="group flex items-center text-left text-xs text-zinc-600 hover:text-[#2b7fff] transition-all bg-transparent border-0 cursor-pointer p-0"
              >
                <span className="group-hover:translate-x-1 transition-transform">Interactive Roadmap</span>
              </button>
              <button
                onClick={() => navigate("/skills")}
                className="group flex items-center text-left text-xs text-zinc-600 hover:text-[#2b7fff] transition-all bg-transparent border-0 cursor-pointer p-0"
              >
                <span className="group-hover:translate-x-1 transition-transform">Competency Radar</span>
              </button>
              <button
                onClick={() => navigate("/recommendations")}
                className="group flex items-center text-left text-xs text-zinc-600 hover:text-[#2b7fff] transition-all bg-transparent border-0 cursor-pointer p-0"
              >
                <span className="group-hover:translate-x-1 transition-transform">Curated Resources</span>
              </button>
              <button
                onClick={() => navigate("/assistant")}
                className="group flex items-center text-left text-xs text-zinc-600 hover:text-[#2b7fff] transition-all bg-transparent border-0 cursor-pointer p-0"
              >
                <span className="group-hover:translate-x-1 transition-transform">AI Code Tutor</span>
              </button>
            </div>

            {/* Curated Pathways */}
            <div className="flex flex-col gap-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-indigo-500" /> Tracks
              </span>
              <button
                onClick={() => navigate("/roadmap")}
                className="group flex items-center justify-between text-left text-xs text-zinc-600 hover:text-[#2b7fff] transition-all bg-transparent border-0 cursor-pointer p-0"
              >
                <span className="group-hover:translate-x-1 transition-transform">React 19 & Frontend</span>
              </button>
              <button
                onClick={() => navigate("/roadmap")}
                className="group flex items-center justify-between text-left text-xs text-[#2b7fff] font-medium transition-all bg-transparent border-0 cursor-pointer p-0"
              >
                <span className="group-hover:translate-x-1 transition-transform">Full-Stack AI Agents</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">HOT</span>
              </button>
              <button
                onClick={() => navigate("/roadmap")}
                className="group flex items-center justify-between text-left text-xs text-zinc-600 hover:text-[#2b7fff] transition-all bg-transparent border-0 cursor-pointer p-0"
              >
                <span className="group-hover:translate-x-1 transition-transform">Docker & Kubernetes</span>
              </button>
              <button
                onClick={() => navigate("/roadmap")}
                className="group flex items-center justify-between text-left text-xs text-zinc-600 hover:text-[#2b7fff] transition-all bg-transparent border-0 cursor-pointer p-0"
              >
                <span className="group-hover:translate-x-1 transition-transform">Distributed Systems</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">PRO</span>
              </button>
            </div>

            {/* Platform & Trust */}
            <div className="flex flex-col gap-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500" /> Platform
              </span>
              <span className="text-xs text-zinc-600 flex items-center gap-2 hover:text-zinc-900 transition-colors">
                <span className="size-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                  <ShieldCheck className="size-3.5" />
                </span>
                Open Guest Mode
              </span>
              <span className="text-xs text-zinc-600 flex items-center gap-2 hover:text-zinc-900 transition-colors">
                <span className="size-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                  <Lock className="size-3.5" />
                </span>
                Local Storage Sync
              </span>
              <span className="text-xs text-zinc-600 flex items-center gap-2 hover:text-zinc-900 transition-colors">
                <span className="size-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0">
                  <Code2 className="size-3.5" />
                </span>
                AST Code Verification
              </span>
              <span className="text-xs text-zinc-600 flex items-center gap-2 hover:text-zinc-900 transition-colors">
                <span className="size-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                  <Activity className="size-3.5" />
                </span>
                Real-time Pacing
              </span>
            </div>
          </div>

          {/* Bottom Sub-bar */}
          <div className="mt-10 pt-6 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 relative z-10">
            <span className="flex items-center gap-1.5">
              © 2026 PathAI. Built for ambitious software engineers worldwide.
            </span>
            <div className="flex items-center gap-4 sm:gap-6 font-medium">
              <button
                onClick={() => navigate("/conversations/new/questionnaire")}
                className="text-xs text-zinc-600 hover:text-[#2b7fff] transition-colors bg-transparent border-0 cursor-pointer"
              >
                Start Free Journey
              </button>
              <span className="text-zinc-300">•</span>
              <button
                onClick={() => navigate("/roadmap")}
                className="text-xs text-zinc-600 hover:text-[#2b7fff] transition-colors bg-transparent border-0 cursor-pointer"
              >
                Demo Roadmap
              </button>
              <span className="text-zinc-300">•</span>
              <button
                onClick={() => navigate("/assistant")}
                className="text-xs text-zinc-600 hover:text-[#2b7fff] transition-colors bg-transparent border-0 cursor-pointer"
              >
                AI Tutor
              </button>
            </div>
          </div>
        </footer>
      </RevealOnScroll>
    </div>
  );
}
