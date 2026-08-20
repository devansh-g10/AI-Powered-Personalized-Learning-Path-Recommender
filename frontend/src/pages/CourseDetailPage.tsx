import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  Bot,
  Layers,
  ChevronRight,
  Code2,
  Compass,
  Check,
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
import { getCourseByIdOrSlug } from "@/lib/courses-data";
import { dispatchProgressUpdate } from "@/lib/learning-data";
import RevealOnScroll from "@/components/motion/RevealOnScroll";

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const course = useMemo(() => {
    return getCourseByIdOrSlug(courseId || "") || getCourseByIdOrSlug("react-19-development");
  }, [courseId]);

  // Read live enrolled progress scoped to this specific course
  const [isEnrolled] = useState(true);
  const [completedModules, setCompletedModules] = useState<Set<string>>(() => {
    if (!course) return new Set();
    const saved = localStorage.getItem(`completed_topics_${course.slug}`) ||
                  localStorage.getItem(`completed_topics_${course.id}`);
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch {
        return new Set();
      }
    }
    return new Set();
  });
  const [justCompletedModule, setJustCompletedModule] = useState<string | null>(null);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <h2 className="text-xl font-bold text-zinc-900">Course not found</h2>
        <Button onClick={() => navigate("/courses")} variant="outline">
          Back to Courses
        </Button>
      </div>
    );
  }

  const allModules = course.stages.flatMap((s) => s.modules);
  const totalModuleCount = allModules.length || 1;
  const completedCount = allModules.filter((m) => completedModules.has(m.id)).length;
  const progressPercent = Math.round((completedCount / totalModuleCount) * 100);

  const toggleModuleCompletion = (modId: string) => {
    setCompletedModules((prev) => {
      const next = new Set(prev);
      const willBeCompleted = !next.has(modId);
      if (next.has(modId)) {
        next.delete(modId);
      } else {
        next.add(modId);
        setJustCompletedModule(modId);
        setTimeout(() => setJustCompletedModule(null), 1500);
      }

      // Persist course-scoped storage
      localStorage.setItem(`completed_topics_${course.id}`, JSON.stringify(Array.from(next)));
      localStorage.setItem(`completed_topics_${course.slug}`, JSON.stringify(Array.from(next)));

      // Sync across app
      dispatchProgressUpdate({
        action: "course_module_toggled",
        courseId: course.id,
        topicId: modId,
        completed: willBeCompleted,
      });

      return next;
    });
  };

  const handleStartRoadmap = () => {
    navigate(`/roadmap/${course.slug}`);
  };

  return (
    <div className="flex flex-col gap-10 pb-20 w-full max-w-5xl mx-auto">
      {/* ─── Top Breadcrumb Navigation ────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
        <Link
          to="/courses"
          className="hover:text-[#2b7fff] transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="size-3.5" />
          <span>Courses</span>
        </Link>
        <span>/</span>
        <span className="text-zinc-700">{course.category}</span>
        <span>/</span>
        <span className="text-zinc-950 font-bold truncate max-w-[200px]">
          {course.title}
        </span>
      </div>

      {/* ─── Hero Header & Overview ───────────────────────────────────────── */}
      <RevealOnScroll distance={15} duration={0.5}>
        <div className="flex flex-col gap-6 p-6 sm:p-8 rounded-3xl bg-white/90 border border-zinc-200/80 shadow-lg shadow-[#2b7fff]/5 backdrop-blur-xl">
          <div className="flex items-center gap-2 flex-wrap justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="secondary"
                className="bg-[#2b7fff]/10 text-[#2b7fff] border border-[#2b7fff]/20 text-xs font-bold px-3 py-1 rounded-full"
              >
                {course.category}
              </Badge>

              <Badge
                variant="outline"
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  course.difficulty === "Beginner"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                {course.difficulty} Level
              </Badge>

              {course.isRecommended && (
                <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="size-3 text-amber-500" />
                  Personalized Match
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
              <span className="text-amber-500 font-bold">★ {course.rating}</span>
              <span>•</span>
              <span>{course.enrolledCount.toLocaleString()} Engineers Enrolled</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-zinc-950 tracking-tight leading-tight">
              {course.title}
            </h1>
            <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-3xl">
              {course.fullDescription}
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/60">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Target Role
              </span>
              <p className="font-display font-bold text-xs sm:text-sm text-zinc-950 mt-0.5">
                {course.targetRole}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Duration
              </span>
              <p className="font-display font-bold text-xs sm:text-sm text-zinc-950 mt-0.5">
                ~{course.estimatedWeeks} Weeks ({course.totalModules} Modules)
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Projects
              </span>
              <p className="font-display font-bold text-xs sm:text-sm text-zinc-950 mt-0.5">
                {course.totalProjects} Portfolio Apps
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Your Progress
              </span>
              <p className="font-display font-bold text-xs sm:text-sm text-[#2b7fff] mt-0.5">
                {progressPercent}% Complete
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap pt-2">
            <Button
              onClick={handleStartRoadmap}
              className="bg-[#2b7fff] text-white hover:bg-[#2563eb] h-12 px-6 rounded-2xl font-bold text-xs sm:text-sm gap-2 shadow-lg shadow-[#2b7fff]/25 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="size-4" />
              <span>{isEnrolled ? "Continue Interactive Roadmap" : "Enroll & Generate Roadmap"}</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate(`/assistant?topic=${encodeURIComponent(course.title)}`)}
              className="h-12 px-5 rounded-2xl border-zinc-200 text-zinc-700 hover:text-[#2b7fff] hover:border-[#2b7fff]/30 text-xs sm:text-sm font-semibold gap-2 cursor-pointer bg-white"
            >
              <Bot className="size-4 text-[#2b7fff]" />
              <span>Ask AI Tutor About Course</span>
            </Button>
          </div>
        </div>
      </RevealOnScroll>

      {/* ─── Beginner-First Prerequisites Validation ───────────────────────── */}
      <Card className="glass-card backdrop-blur-xl bg-white/80 border-zinc-200/80 p-6 rounded-3xl gap-4 flex flex-col shadow-sm">
        <CardHeader className="p-0 gap-1">
          <CardTitle className="font-display font-bold text-base text-zinc-950 flex items-center gap-2">
            <Compass className="size-4 text-[#2b7fff]" />
            Prerequisites & Readiness Assessment
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            PathAI checks your completed milestones to ensure you have the foundational knowledge required for this program.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {course.prerequisites.length === 0 ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>No prior prerequisites required. This course is 100% beginner-friendly and starts from fundamentals.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {course.prerequisites.map((prereq, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                    prereq.isSatisfied
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-950 font-medium"
                      : "bg-amber-50 border-amber-200 text-amber-950"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {prereq.isSatisfied ? (
                      <CheckCircle2 className="size-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="size-4 text-amber-600" />
                    )}
                    <span className="font-semibold">{prereq.title}</span>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold ${
                      prereq.isSatisfied
                        ? "bg-emerald-100/60 text-emerald-800 border-emerald-300"
                        : "bg-amber-100 text-amber-800 border-amber-300"
                    }`}
                  >
                    {prereq.isSatisfied ? "Verified" : "Recommended"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Structured Course Progression Roadmap (Learn → Practice → Build → Verify) ─ */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-[#2b7fff]" />
            <h2 className="font-display font-bold text-xl text-zinc-950">
              Structured Course Syllabus & Roadmap
            </h2>
          </div>
          <span className="text-xs text-zinc-500 font-medium">
            {course.stages.length} Structured Learning Stages
          </span>
        </div>

        {course.stages.length === 0 ? (
          <div className="p-8 rounded-3xl border border-zinc-200 bg-white text-center text-xs text-zinc-500">
            Interactive syllabus is adapting with AI for this program. Click "Start Course Roadmap" to generate.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {course.stages.map((stage, sIdx) => (
              <Card
                key={stage.stageId || sIdx}
                className="glass-card backdrop-blur-xl bg-white/85 border-zinc-200/80 p-6 rounded-3xl gap-4 flex flex-col shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="size-7 rounded-xl bg-[#2b7fff]/10 text-[#2b7fff] font-bold text-xs flex items-center justify-center">
                      0{sIdx + 1}
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-base text-zinc-950">
                        {stage.title}
                      </h3>
                      <p className="text-xs text-zinc-500">
                        {stage.description}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold">
                    ~{stage.estimatedWeeks} Weeks
                  </Badge>
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 gap-3 pt-1">
                  {stage.modules.map((mod) => {
                    const isDone = completedModules.has(mod.id);
                    const isJustDone = justCompletedModule === mod.id;

                    return (
                      <div
                        key={mod.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isJustDone
                            ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-300/40"
                            : isDone
                            ? "bg-emerald-50/50 border-emerald-200 text-emerald-950"
                            : "bg-zinc-50/80 border-zinc-200/70 hover:bg-white text-zinc-900"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => toggleModuleCompletion(mod.id)}
                            className={`size-6 rounded-lg flex items-center justify-center border transition-all mt-0.5 cursor-pointer shrink-0 ${
                              isDone
                                ? "bg-[#2b7fff] border-[#2b7fff] text-white shadow-sm"
                                : "bg-white border-zinc-300 hover:border-[#2b7fff]"
                            }`}
                          >
                            {isDone && <Check className="size-3.5 stroke-[3]" />}
                          </button>

                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`font-display font-bold text-xs sm:text-sm ${
                                  isDone ? "line-through text-zinc-400" : "text-zinc-950"
                                }`}
                              >
                                {mod.title}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-2 py-0 font-semibold uppercase tracking-wider"
                              >
                                {mod.type}
                              </Badge>
                              <span className="text-[11px] text-zinc-400">
                                ({mod.duration})
                              </span>
                            </div>

                            <p className="text-xs text-zinc-600 leading-relaxed">
                              {mod.description}
                            </p>

                            {mod.challengeTitle && (
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2b7fff] mt-1">
                                <Code2 className="size-3.5" />
                                <span>Challenge: {mod.challengeTitle}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/assistant?topic=${encodeURIComponent(mod.title)}`)
                          }
                          className="h-8 px-3 text-xs text-zinc-600 hover:text-[#2b7fff] gap-1 self-end sm:self-center shrink-0 cursor-pointer rounded-xl"
                        >
                          <span>Ask AI</span>
                          <ChevronRight className="size-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ─── Skills Gained & Competency Verification ──────────────────────── */}
      <Card className="glass-card backdrop-blur-xl bg-white/85 border-zinc-200/80 p-6 sm:p-8 rounded-3xl gap-4 flex flex-col shadow-sm">
        <CardHeader className="p-0 gap-1">
          <CardTitle className="font-display font-bold text-lg text-zinc-950 flex items-center gap-2">
            <Sparkles className="size-4 text-[#2b7fff]" />
            Verified Skills Unlocked
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Completing all milestones and capstones in this course verifies your proficiency across these technical competencies.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-2">
          <div className="flex items-center gap-2 flex-wrap">
            {course.skillsGained.map((skill, idx) => (
              <div
                key={idx}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs font-semibold text-zinc-800 flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
