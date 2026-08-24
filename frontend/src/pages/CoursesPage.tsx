import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  ArrowRight,
  Code2,
  Database,
  Cloud,
  Cpu,
  Shield,
  Smartphone,
  Briefcase,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  allCoursesCatalog,
  courseCategoriesList,
  type CourseCategoryType,
  type CourseItem,
} from "@/lib/courses-data";
import RevealOnScroll from "@/components/motion/RevealOnScroll";

const categoryIconMap: Record<CourseCategoryType, typeof Code2> = {
  "Software Development": Code2,
  "AI / Machine Learning": Sparkles,
  Data: Database,
  "Cloud & DevOps": Cloud,
  "Computer Science": Cpu,
  Cybersecurity: Shield,
  "Mobile Development": Smartphone,
  "Career & Engineering": Briefcase,
};

export default function CoursesPage() {
  const navigate = useNavigate();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<"all" | "recommended" | "in_progress" | "completed">("all");

  // Read stored progress dynamically per course
  const enrolledProgressMap = useMemo(() => {
    const map: Record<string, number> = {};
    allCoursesCatalog.forEach((course) => {
      const stored =
        localStorage.getItem(`completed_topics_${course.slug}`) ||
        localStorage.getItem(`completed_topics_${course.id}`);
      if (stored) {
        try {
          const completedSet = new Set(JSON.parse(stored));
          const totalMods = course.stages.flatMap((s) => s.modules).length || 6;
          map[course.id] = Math.round((completedSet.size / totalMods) * 100);
        } catch {
          // fallback
        }
      } else if (course.id === "course-react-19") {
        map[course.id] = 42;
      } else if (course.id === "course-langchain-agents") {
        map[course.id] = 25;
      } else if (course.id === "course-docker-k8s") {
        map[course.id] = 15;
      }
    });
    return map;
  }, []);

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return allCoursesCatalog.filter((course) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = course.title.toLowerCase().includes(query);
        const matchesCategory = course.category.toLowerCase().includes(query);
        const matchesSkills = course.skillsGained.some((s) => s.toLowerCase().includes(query));
        const matchesDesc = course.shortDescription.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCategory && !matchesSkills && !matchesDesc) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== "All" && course.category !== selectedCategory) {
        return false;
      }

      // 3. Tab Filter
      if (activeTab === "recommended" && !course.isRecommended) {
        return false;
      }
      if (activeTab === "in_progress" && !enrolledProgressMap[course.id]) {
        return false;
      }
      if (activeTab === "completed" && enrolledProgressMap[course.id] !== 100) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, activeTab, enrolledProgressMap]);

  return (
    <div className="flex flex-col gap-4 pb-20 w-full max-w-7xl mx-auto -mt-3 sm:-mt-5">
      {/* ─── 1. Top Navigation Bar with Status Tabs & Search ──────────────────── */}
      <RevealOnScroll distance={8} duration={0.25}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-zinc-200/80 pb-0.5">
          {/* Status Filter Tabs (All, Recommended, In Progress, Completed) */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none">
            {[
              { id: "all", label: "All Programs" },
              { id: "recommended", label: "✦ Recommended for You" },
              { id: "in_progress", label: "In Progress" },
              { id: "completed", label: "Completed" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`relative px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    isActive ? "text-[#2b7fff]" : "text-zinc-600 hover:text-zinc-950"
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeCoursesTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2b7fff] rounded-full"
                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Cleanly Aligned Search Bar on the Right */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 transition-colors pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search React, Docker, AI, SQL..."
              className="w-full h-9 pl-9 pr-9 rounded-xl border border-zinc-200/90 bg-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#2b7fff]/25 focus:border-[#2b7fff] shadow-2xs hover:border-zinc-300 transition-all duration-200 text-zinc-950 placeholder:text-zinc-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400 hover:text-zinc-700 bg-transparent border-0 cursor-pointer p-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </RevealOnScroll>

      {/* ─── 2. Clean Borderless Categories Bar ────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5 select-none">
        <button
          type="button"
          onClick={() => setSelectedCategory("All")}
          className={`px-3 py-1 rounded-full text-xs transition-all duration-150 cursor-pointer whitespace-nowrap ${
            selectedCategory === "All"
              ? "bg-[#2b7fff] text-white font-bold shadow-2xs"
              : "text-zinc-600 hover:text-zinc-950 font-medium hover:bg-zinc-100/80 border-0 bg-transparent"
          }`}
        >
          All Categories ({allCoursesCatalog.length})
        </button>

        {courseCategoriesList.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          const Icon = categoryIconMap[cat.name] || Code2;
          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all duration-150 cursor-pointer whitespace-nowrap ${
                isSelected
                  ? "bg-[#2b7fff] text-white font-bold shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-950 font-medium hover:bg-zinc-100/80 border-0 bg-transparent"
              }`}
            >
              <Icon className="size-3.5" />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* ─── 3. Main Course Grid ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-zinc-950">
            {selectedCategory === "All" ? "Explore All Courses" : selectedCategory}
          </h2>
          <span className="text-xs text-zinc-500 font-medium">
            Showing {filteredCourses.length} results
          </span>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="p-12 rounded-3xl border border-dashed border-zinc-200 bg-white/60 flex flex-col items-center justify-center text-center gap-3">
            <div className="size-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400">
              <Compass className="size-6" />
            </div>
            <h3 className="font-bold text-base text-zinc-900">
              No courses found {searchQuery ? `for "${searchQuery}"` : ""}
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm">
              Try searching for another technology (e.g. React, Python, Docker) or explore all categories.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setActiveTab("all");
              }}
              className="mt-2 text-xs rounded-xl cursor-pointer"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredCourses.map((course, idx) => (
                <motion.div
                  key={course.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    duration: 0.24,
                    delay: Math.min(0.2, idx * 0.03),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="h-full"
                >
                  <CourseCard
                    course={course}
                    progress={enrolledProgressMap[course.id]}
                    onSelect={() => navigate(`/courses/${course.slug}`)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Individual Reusable Course Card Component ────────────────────────────────

interface CourseCardProps {
  course: CourseItem;
  progress?: number;
  onSelect: () => void;
}

function CourseCard({ course, progress, onSelect }: CourseCardProps) {
  const Icon = categoryIconMap[course.category] || Code2;
  const isEnrolled = typeof progress === "number" && progress > 0;

  return (
    <Card
      onClick={onSelect}
      className="group relative overflow-hidden backdrop-blur-xl bg-white/90 border border-zinc-200/80 hover:border-[#2b7fff]/40 shadow-xs hover:shadow-2xl hover:shadow-[#2b7fff]/15 rounded-3xl p-5 sm:p-6 flex flex-col justify-between h-full gap-4 transition-all duration-300 cursor-pointer hover:-translate-y-1.5"
    >
      <div className="pointer-events-none absolute -top-12 -right-12 size-32 bg-gradient-to-br from-[#2b7fff]/5 to-transparent rounded-full blur-2xl group-hover:bg-[#2b7fff]/15 transition-all duration-700 ease-out" />
      <CardHeader className="p-0 gap-3 relative z-10">
        {/* Category → Recommended Badge Row */}
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className="text-[11px] font-semibold text-zinc-600 border-zinc-200/80 bg-zinc-50/80 flex items-center gap-1.5"
          >
            <Icon className="size-3 text-[#2b7fff]" />
            {course.category}
          </Badge>

          {course.isRecommended && (
            <Badge className="bg-[#2b7fff]/10 text-[#2b7fff] border border-[#2b7fff]/25 shadow-[0_0_10px_rgba(43,127,255,0.12)] text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="size-2.5" />
              Recommended
            </Badge>
          )}
        </div>

        {/* Title & Description */}
        <div className="flex flex-col gap-1">
          <CardTitle className="font-display font-bold text-base leading-snug text-zinc-950 group-hover:text-[#2b7fff] transition-colors">
            {course.title}
          </CardTitle>
          <CardDescription className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
            {course.shortDescription}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col gap-3 relative z-10">
        {/* Difficulty / Duration / Lessons Info */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] text-zinc-500">
          <span className="font-semibold text-zinc-700">Difficulty:</span>
          <Badge
            variant="secondary"
            className={`text-[10px] px-2 py-0 font-bold rounded-md ${course.difficulty === "Beginner"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : course.difficulty === "Intermediate"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-purple-50 text-purple-700 border-purple-200"
              }`}
          >
            {course.difficulty}
          </Badge>

          <span className="text-zinc-300">•</span>
          <span>{course.estimatedWeeks} Weeks</span>
          <span className="text-zinc-300">•</span>
          <span>{course.totalModules} Modules</span>
        </div>

        {/* Prerequisites Snippet */}
        <div className="p-2.5 rounded-xl bg-zinc-50/80 border border-zinc-100 text-[11px] text-zinc-600 flex items-center justify-between">
          <span className="font-medium text-zinc-700">Prerequisites:</span>
          <span className="font-semibold text-zinc-800 truncate max-w-[180px]" title={course.prerequisites?.map((p) => p.title).join(", ")}>
            {!course.prerequisites || course.prerequisites.length === 0
              ? "✓ No Prerequisites"
              : course.prerequisites.map((p) => p.title).join(", ")}
          </span>
        </div>

        {/* Live Progress Bar (if enrolled) */}
        {isEnrolled && (
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-700">Your Progress</span>
              <span className="font-bold text-[#2b7fff]">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/60 p-0.5">
              <motion.div
                className="h-full bg-gradient-to-r from-[#2b7fff] to-[#2563eb] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-0 pt-3 flex items-center justify-between border-t border-zinc-100/90 relative z-10 mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
          <span className="text-amber-500 font-bold">★ {course.rating}</span>
          <span className="text-zinc-400">({course.enrolledCount.toLocaleString()} learners)</span>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-[#2b7fff] group-hover:translate-x-1 transition-transform duration-200">
          <span>{isEnrolled ? "Continue" : "Explore"}</span>
          <ArrowRight className="size-3.5" />
        </div>
      </CardFooter>
    </Card>
  );
}
