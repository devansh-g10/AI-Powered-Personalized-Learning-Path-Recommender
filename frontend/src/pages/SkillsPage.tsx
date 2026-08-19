import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  CheckCircle2,
  Award,
  TrendingUp,
  Brain,
  Code2,
  Shield,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SkillItem {
  id: string;
  name: string;
  category: "Frontend" | "Backend" | "DevOps" | "Architecture";
  level: "Mastered" | "In Progress" | "Recommended";
  progress: number;
  topicsCount: number;
  description: string;
  keyConcepts: string[];
}

const initialSkills: SkillItem[] = [
  {
    id: "html-css",
    name: "Semantic HTML & CSS3 Layouts",
    category: "Frontend",
    level: "Mastered",
    progress: 100,
    topicsCount: 8,
    description: "Responsive web design, Flexbox, CSS Grid, animations & web accessibility standards (WCAG).",
    keyConcepts: ["Flexbox", "CSS Grid", "ARIA tags", "Responsive Units", "Transitions"],
  },
  {
    id: "js-es6",
    name: "Modern JavaScript (ES6+)",
    category: "Frontend",
    level: "Mastered",
    progress: 95,
    topicsCount: 12,
    description: "Event Loop, Closures, Promises, Async/Await, Web APIs, and functional programming patterns.",
    keyConcepts: ["Closures", "Event Loop", "Promises & Async", "Prototypes", "Fetch & Axios"],
  },
  {
    id: "react",
    name: "React 19 & Core Hooks",
    category: "Frontend",
    level: "In Progress",
    progress: 75,
    topicsCount: 14,
    description: "Component hierarchy, Virtual DOM, useState, useEffect, useMemo, custom hooks & concurrency.",
    keyConcepts: ["Hooks", "Virtual DOM", "Context API", "Component Lifecycle", "Custom Hooks"],
  },
  {
    id: "ts",
    name: "TypeScript Deep Dive",
    category: "Frontend",
    level: "In Progress",
    progress: 60,
    topicsCount: 9,
    description: "Strict typing, Generics, Utility types, Interfaces vs Types, Discriminated Unions.",
    keyConcepts: ["Generics", "Type Inference", "Interfaces", "Utility Types", "Narrowing"],
  },
  {
    id: "state",
    name: "State Management & Caching",
    category: "Frontend",
    level: "In Progress",
    progress: 45,
    topicsCount: 7,
    description: "Zustand, Redux Toolkit, TanStack Query, optimistics updates & persistent stores.",
    keyConcepts: ["Zustand", "TanStack Query", "Redux Toolkit", "Server State", "Selectors"],
  },
  {
    id: "api-backend",
    name: "REST APIs & Express Backend",
    category: "Backend",
    level: "In Progress",
    progress: 65,
    topicsCount: 10,
    description: "Node.js runtime, Express routing, JWT authentication, middleware patterns & rate limiting.",
    keyConcepts: ["Express.js", "JWT Auth", "Middleware", "CORS", "Error Handling"],
  },
  {
    id: "database",
    name: "PostgreSQL & Prisma ORM",
    category: "Backend",
    level: "In Progress",
    progress: 50,
    topicsCount: 8,
    description: "Relational schema design, migrations, indexing, transactions, and connection pooling with PgBouncer.",
    keyConcepts: ["Prisma v7", "PostgreSQL", "Migrations", "Indexes", "Foreign Keys"],
  },
  {
    id: "testing",
    name: "Automated Testing (Vitest & Playwright)",
    category: "DevOps",
    level: "Recommended",
    progress: 30,
    topicsCount: 6,
    description: "Unit testing with Vitest, component testing with RTL, and End-to-End browser tests with Playwright.",
    keyConcepts: ["Unit Tests", "RTL", "Playwright E2E", "Mocks", "Coverage"],
  },
  {
    id: "sys-design",
    name: "Frontend System Design & Architecture",
    category: "Architecture",
    level: "Recommended",
    progress: 20,
    topicsCount: 7,
    description: "Microfrontends, asset caching, CDN distribution, web vitals, and scalable state architecture.",
    keyConcepts: ["Core Web Vitals", "Code Splitting", "Microfrontends", "Caching Headers", "Design Patterns"],
  },
];

export default function SkillsPage() {
  const navigate = useNavigate();
  const [skills] = useState<SkillItem[]>(initialSkills);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSkill, setActiveSkill] = useState<SkillItem | null>(initialSkills[2]);

  const categories = ["All", "Frontend", "Backend", "DevOps", "Architecture"];

  const filteredSkills = skills.filter((skill) => {
    const matchesCategory =
      selectedCategory === "All" || skill.category === selectedCategory;
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.keyConcepts.some((c) =>
        c.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const masteredCount = skills.filter((s) => s.level === "Mastered").length;
  const inProgressCount = skills.filter((s) => s.level === "In Progress").length;
  const avgMastery = Math.round(
    skills.reduce((acc, s) => acc + s.progress, 0) / skills.length
  );

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex flex-col gap-2">
          <Badge
            variant="secondary"
            className="font-medium rounded-full bg-[#2b7fff]/10 text-[#2b7fff] text-xs leading-4 px-3 py-1 gap-1.5 w-fit"
          >
            <Sparkles className="size-3.5" />
            Skills Matrix & Mastery
          </Badge>
          <h1 className="font-bold text-3xl leading-9 tracking-tight">
            Competency & Skill Radar
          </h1>
          <p className="text-[#71717b] text-sm leading-5">
            Track your verified skills, mastery percentages, and unlock curriculum milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-100 text-emerald-800 border-0 px-3 py-1 text-xs">
            {masteredCount} Mastered
          </Badge>
          <Badge className="bg-[#2b7fff]/10 text-[#2b7fff] border-0 px-3 py-1 text-xs">
            {inProgressCount} Active
          </Badge>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 backdrop-blur-xl bg-white/60 border border-zinc-200/60 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-xl bg-[#2b7fff]/10 text-[#2b7fff] flex items-center justify-center">
            <TrendingUp className="size-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{avgMastery}%</div>
            <div className="text-xs text-[#71717b]">Overall Skill Mastery</div>
          </div>
        </Card>

        <Card className="p-5 backdrop-blur-xl bg-white/60 border border-zinc-200/60 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="size-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{masteredCount} / {skills.length}</div>
            <div className="text-xs text-[#71717b]">Verified Core Skills</div>
          </div>
        </Card>

        <Card className="p-5 backdrop-blur-xl bg-white/60 border border-zinc-200/60 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Brain className="size-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">Level 4</div>
            <div className="text-xs text-[#71717b]">Developer Competency</div>
          </div>
        </Card>

        <Card className="p-5 backdrop-blur-xl bg-white/60 border border-zinc-200/60 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Shield className="size-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">14 Days</div>
            <div className="text-xs text-[#71717b]">Daily Learning Streak</div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100/80 rounded-xl w-full sm:w-auto overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all border-0 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-white text-[#2b7fff] shadow-sm"
                  : "text-[#71717b] hover:text-zinc-900 bg-transparent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="size-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills, concepts..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-zinc-200 bg-white text-xs outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff]"
          />
        </div>
      </div>

      {/* Skills Grid and Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Skill Cards List (2 cols) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSkills.map((skill) => {
            const isSelected = activeSkill?.id === skill.id;
            return (
              <Card
                key={skill.id}
                onClick={() => setActiveSkill(skill)}
                className={`p-5 cursor-pointer backdrop-blur-xl transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? "bg-white border-[#2b7fff] ring-2 ring-[#2b7fff]/20 shadow-lg shadow-[#2b7fff]/5"
                    : "bg-white/70 hover:bg-white border-zinc-200/60 hover:border-zinc-300"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase font-semibold text-zinc-600 bg-zinc-50"
                    >
                      {skill.category}
                    </Badge>

                    {skill.level === "Mastered" ? (
                      <Badge className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0 border-0 flex items-center gap-1">
                        <CheckCircle2 className="size-3" /> Mastered
                      </Badge>
                    ) : skill.level === "In Progress" ? (
                      <Badge className="bg-[#2b7fff]/15 text-[#2b7fff] text-[10px] px-2 py-0 border-0">
                        In Progress
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-zinc-500">
                        Recommended
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-zinc-900 mb-1 group-hover:text-[#2b7fff]">
                    {skill.name}
                  </h3>
                  <p className="text-xs text-[#71717b] line-clamp-2 mb-4 leading-relaxed">
                    {skill.description}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-[#71717b]">Mastery level</span>
                    <span className="font-semibold text-[#2b7fff]">{skill.progress}%</span>
                  </div>
                  <Progress value={skill.progress} className="h-1.5" />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Right Column: Selected Skill Deep-Dive & Action Card */}
        {activeSkill && (
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Card className="backdrop-blur-xl shadow-xl shadow-[#2b7fff]/5 bg-white/75 border-zinc-200/60 p-6 flex flex-col gap-5">
              <CardHeader className="p-0 gap-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-[#2b7fff]/10 text-[#2b7fff] text-xs">
                    {activeSkill.category} Competency
                  </Badge>
                  <span className="text-xs font-semibold text-zinc-500">
                    {activeSkill.topicsCount} Module Topics
                  </span>
                </div>
                <CardTitle className="text-xl font-bold text-zinc-900">
                  {activeSkill.name}
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  {activeSkill.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 flex flex-col gap-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-2">
                    <span>Overall Proficiency</span>
                    <span className="text-[#2b7fff]">{activeSkill.progress}%</span>
                  </div>
                  <Progress value={activeSkill.progress} className="h-2" />
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider mb-2">
                    Key Tested Concepts
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeSkill.keyConcepts.map((concept) => (
                      <Badge
                        key={concept}
                        variant="secondary"
                        className="bg-zinc-100 text-zinc-800 text-xs px-2.5 py-1 rounded-lg"
                      >
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-[#2b7fff]/10 to-transparent border border-[#2b7fff]/20 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2b7fff]">
                    <Sparkles className="size-4" />
                    AI Mastery Tip
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed">
                    Build an interactive project implementing {activeSkill.keyConcepts[0]} and {activeSkill.keyConcepts[1]} to boost proficiency to the next milestone level.
                  </p>
                </div>
              </CardContent>

              <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100">
                <Button
                  onClick={() => navigate("/assistant")}
                  className="bg-[#2b7fff] text-white hover:bg-[#2563eb] rounded-xl w-full gap-2 text-xs font-semibold h-10"
                >
                  <Code2 className="size-4" /> Practice in Assistant
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="rounded-xl w-full text-xs font-medium h-10 border-zinc-200"
                >
                  View Related Roadmap Topics
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
