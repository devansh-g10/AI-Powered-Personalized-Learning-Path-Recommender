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
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Terminal,
  Check,
  Flame,
  Star,
  Zap,
  HelpCircle,
  Activity,
  Code2,
  Lock,
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

  const features = [
    {
      icon: Route,
      title: "Self-Adapting Curriculums",
      tagline: "Dynamic Milestone Tree",
      desc: "Never get lost in generic 50-hour video playlists. PathAI maps an interconnected learning sequence calibrated to what you already know.",
    },
    {
      icon: Bot,
      title: "Grounded AI Engineering Tutor",
      tagline: "Contextual Q&A Assistant",
      desc: "Ask deep-dive questions on any concept. Receive clean TypeScript code snippets, mock interview questions, and practical mini-projects.",
    },
    {
      icon: Award,
      title: "Verified Skill Competency",
      tagline: "Live Progress Matrix",
      desc: "Check off milestones to level up your competency radar across Frontend, Backend, DevOps, and System Design with quantifiable metrics.",
    },
    {
      icon: BookOpen,
      title: "Curated Resource Engine",
      tagline: "Multi-Format Library",
      desc: "Skip outdated tutorials. Access verified YouTube masterclasses, official docs, and GitHub production starters matched to your active stage.",
    },
  ];

  const faqs = [
    {
      q: "How does PathAI personalize my curriculum compared to static courses?",
      a: "Unlike static playlists, PathAI assesses your starting skills, weekly hours, and target goal. It algorithmically prunes redundant topics and dynamically recalculates timelines as you check off verified milestones.",
    },
    {
      q: "How is the AI Tutor grounded in my specific learning path?",
      a: "When you click into the AI Tutor from any roadmap milestone, PathAI passes your current stage context, tested concepts, and difficulty level so answers provide exact architectural examples without generic fluff.",
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
    <div className="flex flex-col gap-28 pb-20 w-full relative">
      {/* ─── Glowing Ambient Background Atmosphere ────────────────────────── */}
      <div
        ref={heroBlobRef}
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-gradient-to-tr from-[#2b7fff]/20 via-blue-400/15 to-purple-400/10 blur-[130px] rounded-full"
      />
      <div
        ref={heroBlobRef2}
        className="pointer-events-none absolute top-[800px] -right-32 w-[600px] h-[600px] bg-gradient-to-br from-cyan-400/15 to-[#2b7fff]/10 blur-[140px] rounded-full"
      />

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative pt-6 sm:pt-14 text-center flex flex-col items-center gap-7 max-w-4xl mx-auto z-10">
        {/* Floating Frosted Pill */}
        <RevealOnScroll delay={0.1} distance={15}>
          <div className="glass-pill inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-800 shadow-sm hover:scale-105 transition-transform cursor-default">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2b7fff] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2b7fff]" />
            </span>
            <span className="text-zinc-600 font-medium">Next-Gen Personalized Engineering Platform</span>
            <span className="text-[#2b7fff] font-bold flex items-center gap-0.5">
              PathAI 2.0 <ChevronRight className="size-3.5" />
            </span>
          </div>
        </RevealOnScroll>

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

        {/* Hero Description */}
        <RevealOnScroll delay={0.5} distance={20}>
          <p className="text-base sm:text-lg text-zinc-600 max-w-2xl leading-relaxed font-normal">
            Stop wondering what to learn next. PathAI analyzes your current background and target career ambitions to synthesize tailored, milestone-driven curriculums with built-in AI tutoring.
          </p>
        </RevealOnScroll>

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

        {/* Social Proof Strip */}
        <StaggerContainer staggerMs={80} delayMs={750} className="flex items-center justify-center gap-6 pt-3 text-xs text-zinc-500 flex-wrap">
          <motion.span variants={staggerChild} className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="size-4 text-emerald-500" /> Open Guest Access
          </motion.span>
          <motion.span variants={staggerChild} className="flex items-center gap-1.5 font-medium">
            <Flame className="size-4 text-amber-500" /> 10,000+ Generated Roadmaps
          </motion.span>
          <motion.span variants={staggerChild} className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="size-4 text-[#2b7fff]" /> Real-time Progress Sync
          </motion.span>
        </StaggerContainer>

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
                      <Check className="size-3" /> Grounded in AST
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
      <section className="flex flex-col gap-12 z-10">
        <RevealOnScroll className="text-center max-w-2xl mx-auto flex flex-col gap-2.5">
          <Badge variant="secondary" className="glass-pill text-[#2b7fff] text-xs px-3.5 py-1 w-fit mx-auto font-semibold">
            Bespoke Architecture
          </Badge>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-zinc-950 tracking-[-0.03em]">
            Engineered to replace unstructured tutorials
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed font-normal">
            Every layer of PathAI is built around deliberate practice, verified comprehension, and tangible project deliverables.
          </p>
        </RevealOnScroll>

        <StaggerContainer staggerMs={100} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                variants={staggerChild}
                transition={{ ...defaultTransition, duration: 0.45 }}
                onMouseMove={handleCardMouseMove}
                className="glass-card glass-card-hover card-cursor-highlight rounded-3xl p-6 flex flex-col gap-4 text-left group"
              >
                <div className="size-12 rounded-2xl bg-gradient-to-br from-[#2b7fff]/15 to-blue-500/5 text-[#2b7fff] flex items-center justify-center border border-[#2b7fff]/20 group-hover:scale-110 transition-transform">
                  <Icon className="size-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#2b7fff] block mb-1">
                    {feat.tagline}
                  </span>
                  <h3 className="font-display font-bold text-base text-zinc-950 mb-2">{feat.title}</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </StaggerContainer>
      </section>

      {/* ─── 3-Step Systematic Workflow ───────────────────────────────────── */}
      <RevealOnScroll distance={35} duration={0.6}>
        <section className="glass-card rounded-3xl p-8 sm:p-12 flex flex-col gap-10 z-10">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2b7fff]">How It Works</span>
            <h2 className="font-display font-black text-3xl text-zinc-950 tracking-tight">
              From Goal to Production-Ready Mastery
            </h2>
          </div>

          <StaggerContainer staggerMs={120} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Specify Your Goal & Hours", desc: "Tell the profiler whether you're learning React, AI Agents, or DevOps, your current comfort level, and weekly availability." },
              { num: "02", title: "Receive Interconnected Stages", desc: "Get an interconnected 5-stage timeline with verified milestones, time estimates, and curated tutorials." },
              { num: "03", title: "Build with Real-Time AI Tutor", desc: "Ask deep-dive questions on difficult concepts, write code samples, and track your verified skill competencies." },
            ].map((step) => (
              <motion.div
                key={step.num}
                variants={staggerChild}
                transition={{ ...defaultTransition, duration: 0.45 }}
                className="flex flex-col gap-3 p-5 rounded-2xl bg-white/60 border border-white shadow-sm"
              >
                <span className="font-display font-black text-4xl text-[#2b7fff] tracking-tight">{step.num}</span>
                <h3 className="font-display font-bold text-lg text-zinc-950">{step.title}</h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-normal">{step.desc}</p>
              </motion.div>
            ))}
          </StaggerContainer>

          <div className="text-center pt-2">
            <MagneticButton>
              <Button
                onClick={() => navigate("/conversations/new/questionnaire")}
                className="bg-[#2b7fff] text-white hover:bg-[#2563eb] rounded-xl px-7 h-11 text-xs font-bold gap-2 shadow-lg shadow-[#2b7fff]/25 cursor-pointer"
              >
                Launch Custom Profiler
                <ArrowRight className="size-4" />
              </Button>
            </MagneticButton>
          </div>
        </section>
      </RevealOnScroll>

      {/* ─── Frequently Asked Questions (Interactive Accordion) ───────────── */}
      <section className="flex flex-col gap-8 max-w-3xl mx-auto w-full z-10">
        <RevealOnScroll className="text-center flex flex-col gap-2">
          <Badge variant="secondary" className="glass-pill text-[#2b7fff] text-xs px-3.5 py-1 w-fit mx-auto font-semibold">
            Common Inquiries
          </Badge>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-zinc-950 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Everything you need to know about how PathAI creates, adapts, and verifies your engineering pathway.
          </p>
        </RevealOnScroll>

        <StaggerContainer staggerMs={80} className="flex flex-col gap-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <motion.div
                key={idx}
                variants={staggerChild}
                transition={{ ...defaultTransition, duration: 0.35 }}
                className={`glass-card rounded-2xl p-5 cursor-pointer transition-all duration-200 border ${isOpen ? "border-[#2b7fff]/40 bg-white/90 shadow-md" : "hover:bg-white/80"
                  }`}
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <HelpCircle className={`size-4 shrink-0 transition-colors ${isOpen ? "text-[#2b7fff]" : "text-zinc-400"}`} />
                    <h3 className="font-semibold text-sm text-zinc-900 leading-snug">{faq.q}</h3>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: easeOut }}
                  >
                    <ChevronDown className={`size-4 shrink-0 ${isOpen ? "text-[#2b7fff]" : "text-zinc-400"}`} />
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
                      <p className="text-xs text-zinc-600 leading-relaxed mt-3 pl-7 pt-2 border-t border-zinc-100">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </StaggerContainer>
      </section>

      {/* ─── Ultra-Attractive Glassmorphic CTA Masterpiece Section ────────── */}
      <RevealOnScroll distance={40} duration={0.7}>
        <section className="relative rounded-[32px] overflow-hidden p-10 sm:p-16 bg-gradient-to-br from-[#111827] via-[#1e3a8a] to-[#2563eb] text-white text-center flex flex-col items-center gap-8 shadow-[0_30px_90px_-20px_rgba(37,99,235,0.45)] border border-white/20 z-10">
          {/* Dynamic Multi-Color Glowing Mesh Atmosphere */}
          <div ref={ctaBlobRef1} className="pointer-events-none absolute -right-24 -top-24 w-96 h-96 bg-cyan-400/35 rounded-full blur-3xl" />
          <div ref={ctaBlobRef2} className="pointer-events-none absolute -left-24 -bottom-24 w-96 h-96 bg-purple-500/35 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),transparent_70%)]" />

          {/* Floating Frosted Chips */}
          <StaggerContainer staggerMs={120} delayMs={200} className="flex items-center gap-3 flex-wrap justify-center relative z-10">
            <motion.div variants={staggerChild} className="glass-pill px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-100 flex items-center gap-2 border-white/30 bg-white/10 backdrop-blur-xl">
              <Zap className="size-3.5 text-amber-300" />
              <span>Zero Guesswork • 100% Tailored</span>
            </motion.div>
            <motion.div variants={staggerChild} className="glass-pill px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-100 flex items-center gap-2 border-white/30 bg-white/10 backdrop-blur-xl">
              <Award className="size-3.5 text-emerald-300" />
              <span>Verified Industry Benchmarks</span>
            </motion.div>
          </StaggerContainer>

          {/* High-Impact Headline */}
          <RevealOnScroll delay={0.15} distance={25} className="flex flex-col gap-3 max-w-2xl relative z-10">
            <h2 className="font-display text-[clamp(2.4rem,5vw,4.2rem)] font-bold leading-[1.05] tracking-[-0.04em]">
              Accelerate Your Engineering Career Today
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-normal">
              Synthesize your personalized tech curriculum in under 2 minutes. Master complex architectures with interactive milestones, grounded AI tutoring, and verified portfolio proofs.
            </p>
          </RevealOnScroll>

          {/* Action Buttons & Glowing Primary CTA */}
          <StaggerContainer staggerMs={100} delayMs={300} className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full sm:w-auto">
            <motion.div variants={staggerChild}>
              <MagneticButton>
                <Button
                  size="lg"
                  onClick={() => navigate("/conversations/new/questionnaire")}
                  className="w-full sm:w-auto h-13 px-9 rounded-2xl bg-white text-[#1e3a8a] hover:bg-blue-50 font-extrabold text-sm shadow-[0_0_50px_rgba(255,255,255,0.45)] hover:shadow-[0_0_70px_rgba(255,255,255,0.7)] gap-2.5 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <Sparkles className="size-4 text-[#2563eb]" />
                  Generate My Roadmap Free
                  <ArrowRight className="size-4" />
                </Button>
              </MagneticButton>
            </motion.div>

            <motion.div variants={staggerChild}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/roadmap")}
                className="w-full sm:w-auto h-13 px-8 rounded-2xl border-white/40 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white font-semibold text-sm shadow-sm gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <Compass className="size-4 text-cyan-300" />
                Explore Flagship Roadmap
              </Button>
            </motion.div>
          </StaggerContainer>

          {/* Live Social Proof Rating Strip */}
          <RevealOnScroll delay={0.4} distance={15} className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-white/15 text-xs text-blue-100 relative z-10">
            <div className="flex -space-x-2">
              {[
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
              ].map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="user"
                  className="size-7 rounded-full border-2 border-white object-cover ring-2 ring-[#1e3a8a]/50"
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-300">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3.5 fill-amber-300" />
                ))}
              </div>
              <span className="font-semibold text-white">4.9 / 5.0</span>
              <span className="text-blue-200">from 12,400+ developers</span>
            </div>
          </RevealOnScroll>
        </section>
      </RevealOnScroll>

      {/* ─── Rich 4-Column Professional Footer ─────────────────────────────── */}
      <RevealOnScroll distance={30} duration={0.55}>
        <footer className="glass-card rounded-3xl p-8 sm:p-12 flex flex-col gap-10 border border-zinc-200/70 shadow-lg z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Col (2 cols) */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-[#2b7fff] text-white flex items-center justify-center shadow-lg shadow-[#2b7fff]/30">
                  <Route className="size-5" />
                </div>
                <span className="font-display font-bold text-2xl tracking-tight text-zinc-950">PathAI</span>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed max-w-sm">
                The hyper-personalized curriculum engine for engineers. Transform career goals into structured, milestone-driven technical pathways with grounded AI tutoring.
              </p>

              <div className="flex items-center gap-2 pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  All AI Synthesis Systems Operational
                </div>
              </div>
            </div>

            {/* Product Links */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-950">Product</span>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-left text-xs text-zinc-600 hover:text-[#2b7fff] transition-colors bg-transparent border-0 cursor-pointer p-0"
              >
                Learning Dashboard
              </button>
              <button
                onClick={() => navigate("/roadmap")}
                className="text-left text-xs text-zinc-600 hover:text-[#2b7fff] transition-colors bg-transparent border-0 cursor-pointer p-0"
              >
                Interactive Roadmap
              </button>
              <button
                onClick={() => navigate("/skills")}
                className="text-left text-xs text-zinc-600 hover:text-[#2b7fff] transition-colors bg-transparent border-0 cursor-pointer p-0"
              >
                Competency Radar
              </button>
              <button
                onClick={() => navigate("/recommendations")}
                className="text-left text-xs text-zinc-600 hover:text-[#2b7fff] transition-colors bg-transparent border-0 cursor-pointer p-0"
              >
                Curated Resources
              </button>
              <button
                onClick={() => navigate("/assistant")}
                className="text-left text-xs text-zinc-600 hover:text-[#2b7fff] transition-colors bg-transparent border-0 cursor-pointer p-0"
              >
                AI Code Tutor
              </button>
            </div>

            {/* Curated Pathways */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-950">Tracks</span>
              <button
                onClick={() => navigate("/roadmap")}
                className="text-left text-xs text-zinc-600 hover:text-[#2b7fff] transition-colors bg-transparent border-0 cursor-pointer p-0"
              >
                React 19 & Frontend
              </button>
              <button
                onClick={() => navigate("/roadmap")}
                className="text-left text-xs text-zinc-600 hover:text-[#2b7fff] transition-colors bg-transparent border-0 cursor-pointer p-0"
              >
                Full-Stack AI Agents
              </button>
              <button
                onClick={() => navigate("/roadmap")}
                className="text-left text-xs text-zinc-600 hover:text-[#2b7fff] transition-colors bg-transparent border-0 cursor-pointer p-0"
              >
                Docker & Kubernetes CI/CD
              </button>
              <button
                onClick={() => navigate("/roadmap")}
                className="text-left text-xs text-zinc-600 hover:text-[#2b7fff] transition-colors bg-transparent border-0 cursor-pointer p-0"
              >
                Distributed System Design
              </button>
            </div>

            {/* Platform & Trust */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-950">Platform</span>
              <span className="text-xs text-zinc-600 flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-600" /> Open Guest Mode
              </span>
              <span className="text-xs text-zinc-600 flex items-center gap-1.5">
                <Lock className="size-3.5 text-blue-600" /> Local Storage Sync
              </span>
              <span className="text-xs text-zinc-600 flex items-center gap-1.5">
                <Code2 className="size-3.5 text-purple-600" /> AST Code Verification
              </span>
              <span className="text-xs text-zinc-600 flex items-center gap-1.5">
                <Activity className="size-3.5 text-amber-600" /> Real-time Pacing
              </span>
            </div>
          </div>

          {/* Bottom Sub-bar */}
          <div className="pt-6 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <span>© 2026 PathAI. Built for ambitious software engineers worldwide.</span>
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate("/conversations/new/questionnaire")}
                className="text-xs text-zinc-600 hover:text-zinc-900 bg-transparent border-0 cursor-pointer"
              >
                Start Free Journey
              </button>
              <span>•</span>
              <button
                onClick={() => navigate("/roadmap")}
                className="text-xs text-zinc-600 hover:text-zinc-900 bg-transparent border-0 cursor-pointer"
              >
                Demo Roadmap
              </button>
            </div>
          </div>
        </footer>
      </RevealOnScroll>
    </div>
  );
}
