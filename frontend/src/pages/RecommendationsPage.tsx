import { useState } from "react";
import {
  Sparkles,
  ExternalLink,
  BookOpen,
  Video,
  Code2,
  FolderGit2,
  Bookmark,
  CheckCircle2,
  Calendar,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ResourceItem {
  id: string;
  title: string;
  type: "Video" | "Documentation" | "Project" | "GitHub";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  provider: string;
  url: string;
  description: string;
  tags: string[];
}

const initialResources: ResourceItem[] = [
  {
    id: "rec-1",
    title: "React 19 Complete Architecture & Hooks Guide",
    type: "Documentation",
    difficulty: "Intermediate",
    estimatedTime: "2 hours",
    provider: "react.dev",
    url: "https://react.dev/learn",
    description: "Official modern React documentation covering state preservation, effect dependencies, and server actions.",
    tags: ["React 19", "Hooks", "Virtual DOM"],
  },
  {
    id: "rec-2",
    title: "JavaScript Event Loop & Concurrency Masterclass",
    type: "Video",
    difficulty: "Intermediate",
    estimatedTime: "45 mins",
    provider: "YouTube (Tech Talk)",
    url: "https://www.youtube.com/results?search_query=javascript+event+loop+deep+dive",
    description: "Visual step-by-step breakdown of the call stack, microtask queue, macrotask queue, and render loop.",
    tags: ["JavaScript", "Event Loop", "Async"],
  },
  {
    id: "rec-3",
    title: "Full-Stack E-Commerce Store with Checkout",
    type: "Project",
    difficulty: "Intermediate",
    estimatedTime: "8 hours",
    provider: "PathAI Guided Project",
    url: "#",
    description: "Build a responsive store with cart state, product search filter, and fake payment checkout integration.",
    tags: ["React", "Zustand", "Tailwind CSS"],
  },
  {
    id: "rec-4",
    title: "TypeScript Generics & Production Utility Types",
    type: "Documentation",
    difficulty: "Advanced",
    estimatedTime: "1.5 hours",
    provider: "typescriptlang.org",
    url: "https://www.typescriptlang.org/docs/handbook/2/generics.html",
    description: "Learn how to write flexible, type-safe API clients, generic components, and complex conditional types.",
    tags: ["TypeScript", "Generics", "Type Safety"],
  },
  {
    id: "rec-5",
    title: "Vite + Tailwind CSS + Shadcn Production Starter",
    type: "GitHub",
    difficulty: "Beginner",
    estimatedTime: "30 mins",
    provider: "GitHub Starter",
    url: "https://github.com",
    description: "Clean architecture boilerplate with automated linting, tests, and preconfigured path aliases.",
    tags: ["Boilerplate", "Vite", "Shadcn"],
  },
  {
    id: "rec-6",
    title: "Web Performance & Core Web Vitals Optimization",
    type: "Documentation",
    difficulty: "Advanced",
    estimatedTime: "3 hours",
    provider: "web.dev",
    url: "https://web.dev/vitals/",
    description: "Diagnose and optimize Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS).",
    tags: ["Performance", "Lighthouse", "Core Web Vitals"],
  },
];

const weeklySchedule = [
  { day: "Mon", task: "React 19 Hooks & State Mental Model", duration: "1.5 hrs", done: true },
  { day: "Tue", task: "Event Loop & Async Promises Exercises", duration: "2.0 hrs", done: true },
  { day: "Wed", task: "Build Project Component Hierarchy", duration: "1.5 hrs", done: false },
  { day: "Thu", task: "Zustand Global State & Local Storage Sync", duration: "2.0 hrs", done: false },
  { day: "Fri", task: "TypeScript Strict Mode Refactoring", duration: "1.5 hrs", done: false },
  { day: "Weekend", task: "Mini-Project: Interactive Dashboard Demo", duration: "3.5 hrs", done: false },
];

export default function RecommendationsPage() {
  const [resources] = useState<ResourceItem[]>(initialResources);
  const [selectedType, setSelectedType] = useState<string>("All");
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(["rec-1", "rec-3"]));

  const types = ["All", "Documentation", "Video", "Project", "GitHub"];

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredResources = resources.filter((res) => {
    return selectedType === "All" || res.type === selectedType;
  });

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
            AI Learning Recommender
          </Badge>
          <h1 className="font-bold text-3xl leading-9 tracking-tight">
            Curated Resources & Projects
          </h1>
          <p className="text-[#71717b] text-sm leading-5">
            Hand-picked tutorials, official docs, repository templates, and practice projects synchronized with your roadmap stage.
          </p>
        </div>

        <Badge className="bg-[#2b7fff]/10 text-[#2b7fff] border-0 px-3 py-1 text-xs">
          Stage 2: Core Frontend
        </Badge>
      </div>

      {/* Weekly Schedule Plan */}
      <Card className="backdrop-blur-xl bg-white/70 border-zinc-200/60 shadow-xl shadow-[#2b7fff]/5 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="size-5 text-[#2b7fff]" />
            <h3 className="font-bold text-base text-zinc-900">
              Recommended Weekly Study Timetable
            </h3>
          </div>
          <span className="text-xs font-semibold text-zinc-500">
            Target: 12 Hours / Week
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {weeklySchedule.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all ${
                item.done
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                  : "bg-white border-zinc-200/80 hover:border-zinc-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-zinc-600">
                  {item.day}
                </span>
                {item.done ? (
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                ) : (
                  <Clock className="size-3.5 text-zinc-400" />
                )}
              </div>
              <p className="text-xs font-medium line-clamp-2 leading-relaxed">
                {item.task}
              </p>
              <span className="text-[11px] text-[#71717b] font-semibold">
                {item.duration}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-100/80 rounded-xl w-full sm:w-auto overflow-x-auto self-start">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all border-0 cursor-pointer ${
              selectedType === type
                ? "bg-white text-[#2b7fff] shadow-sm"
                : "text-[#71717b] hover:text-zinc-900 bg-transparent"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => {
          const isBookmarked = bookmarkedIds.has(res.id);
          return (
            <Card
              key={res.id}
              className="backdrop-blur-xl bg-white/70 hover:bg-white border-zinc-200/60 hover:shadow-xl hover:shadow-[#2b7fff]/5 hover:border-[#2b7fff]/30 transition-all duration-300 flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-semibold text-zinc-600 bg-zinc-50 flex items-center gap-1"
                  >
                    {res.type === "Video" && <Video className="size-3 text-red-500" />}
                    {res.type === "Documentation" && <BookOpen className="size-3 text-blue-500" />}
                    {res.type === "Project" && <Code2 className="size-3 text-emerald-500" />}
                    {res.type === "GitHub" && <FolderGit2 className="size-3 text-purple-500" />}
                    {res.type}
                  </Badge>

                  <button
                    type="button"
                    onClick={() => toggleBookmark(res.id)}
                    className={`p-1.5 rounded-lg border-0 bg-transparent cursor-pointer transition-colors ${
                      isBookmarked
                        ? "text-[#2b7fff]"
                        : "text-zinc-400 hover:text-zinc-700"
                    }`}
                  >
                    <Bookmark className="size-4" fill={isBookmarked ? "currentColor" : "none"} />
                  </button>
                </div>

                <CardTitle className="text-base font-bold text-zinc-900 leading-snug mt-1 line-clamp-2">
                  {res.title}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-3 leading-relaxed mt-1">
                  {res.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-3">
                <div className="flex flex-wrap gap-1 mb-3">
                  {res.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-zinc-100 text-zinc-700 text-[10px] px-2 py-0.5"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#71717b]">
                  <span>{res.provider}</span>
                  <span className="font-semibold text-zinc-600">{res.estimatedTime}</span>
                </div>
              </CardContent>

              <CardFooter className="pt-3 border-t border-zinc-100">
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-between text-xs font-semibold text-[#2b7fff] hover:underline cursor-pointer"
                >
                  <span>Open Resource</span>
                  <ExternalLink className="size-3.5" />
                </a>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
