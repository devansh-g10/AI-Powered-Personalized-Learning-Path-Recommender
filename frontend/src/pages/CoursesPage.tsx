import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
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
  ChevronDown,
  Check,
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

  // Category Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      if (selectedCategory !== "All" && course.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [selectedCategory]);

  return (
    <div className="flex flex-col gap-5 pb-20 w-full max-w-7xl mx-auto -mt-2 sm:-mt-4">
      {/* ─── 1. Single Top Line: All Courses Heading & Category Dropdown ─────── */}
      <RevealOnScroll distance={8} duration={0.25}>
        <div className="flex flex-row justify-between items-center gap-3 pt-0 pb-1 border-b border-zinc-200/80">
          {/* Left: All Courses Heading */}
          <div className="flex items-center gap-2.5">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#2b7fff] tracking-tight">
              All Courses
            </h1>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2b7fff] text-xs font-bold border border-blue-200">
              {filteredCourses.length} courses
            </span>
          </div>

          {/* Right: Modern Category Dropdown Selector (Matching Screenshot Style) */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="h-10 sm:h-11 px-3.5 sm:px-4 rounded-2xl bg-white/95 backdrop-blur-md border border-blue-200/90 shadow-2xs hover:border-[#2b7fff] text-zinc-800 text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-between gap-2.5 cursor-pointer min-w-[190px] sm:min-w-[240px]"
            >
              <div className="flex items-center gap-2 truncate">
                {selectedCategory === "All" ? (
                  <Sparkles className="size-4 text-[#2b7fff] shrink-0" />
                ) : (
                  <Code2 className="size-4 text-[#2b7fff] shrink-0" />
                )}
                <span className="truncate">
                  {selectedCategory === "All" ? `All Categories (${allCoursesCatalog.length})` : selectedCategory}
                </span>
              </div>
              <ChevronDown
                className={`size-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                  isCategoryDropdownOpen ? "rotate-180 text-[#2b7fff]" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isCategoryDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-72 max-h-80 overflow-y-auto rounded-2xl bg-white shadow-2xl border border-zinc-200 p-1.5 z-50 [scrollbar-width:thin]"
                >
                  {/* Option: All Categories */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("All");
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border-0 ${
                      selectedCategory === "All"
                        ? "bg-blue-50 text-[#2b7fff]"
                        : "text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-3.5 text-[#2b7fff]" />
                      <span>All Categories ({allCoursesCatalog.length})</span>
                    </div>
                    {selectedCategory === "All" && <Check className="size-4 text-[#2b7fff]" />}
                  </button>

                  <div className="my-1 border-t border-zinc-100" />

                  {courseCategoriesList.map((cat) => {
                    const isSelected = selectedCategory === cat.name;
                    const Icon = categoryIconMap[cat.name] || Code2;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border-0 ${
                          isSelected
                            ? "bg-blue-50 text-[#2b7fff]"
                            : "text-zinc-700 hover:bg-zinc-100"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Icon className="size-3.5 text-[#2b7fff] shrink-0" />
                          <span className="truncate">{cat.name}</span>
                        </div>
                        {isSelected && <Check className="size-4 text-[#2b7fff] shrink-0" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </RevealOnScroll>

      {/* ─── 2. Main Course Grid ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">

        {filteredCourses.length === 0 ? (
          <div className="p-12 rounded-3xl border border-dashed border-zinc-200 bg-white/60 flex flex-col items-center justify-center text-center gap-3">
            <div className="size-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400">
              <Compass className="size-6" />
            </div>
            <h3 className="font-bold text-base text-zinc-900">
              No courses found
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm">
              Try exploring other categories or view all courses.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory("All");
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
