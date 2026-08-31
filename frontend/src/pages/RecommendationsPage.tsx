import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Flame,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  allCoursesCatalog,
  getCourseByIdOrSlug,
  type CourseModuleItem,
} from "@/lib/courses-data";
import {
  dispatchProgressUpdate,
  subscribeToProgressUpdates,
} from "@/lib/learning-data";

// ─── Real Dynamic Date Calculation Helpers ────────────────────────────────────

interface CalendarDay {
  dateObj: Date;
  dayKey: string;
  dayShort: string;
  dayFull: string;
  dateFormatted: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

function computeCurrentWeekDates(weekOffset = 0): {
  days: CalendarDay[];
  weekRangeLabel: string;
} {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  // Monday is 1, so offset to Monday of this week:
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek + weekOffset * 7;

  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const dayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const dayShorts = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayFulls = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const days: CalendarDay[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    d.setHours(0, 0, 0, 0);
    const dTime = d.getTime();

    const isToday = dTime === todayMidnight;
    const isPast = dTime < todayMidnight;
    const isFuture = dTime > todayMidnight;

    const dateFormatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    days.push({
      dateObj: d,
      dayKey: dayKeys[i],
      dayShort: dayShorts[i],
      dayFull: dayFulls[i],
      dateFormatted,
      isToday,
      isPast,
      isFuture,
    });
  }

  const sunday = days[6].dateObj;
  const weekRangeLabel = `${days[0].dateFormatted} – ${sunday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return { days, weekRangeLabel };
}

// ─── Real Dynamic Session Type ────────────────────────────────────────────────

interface RealStudySession {
  id: string;
  moduleId: string;
  stageTitle: string;
  title: string;
  durationLabel: string;
  durationHours: number;
  type: "Concept" | "Practice" | "Project" | "Assessment" | "Revision";
  description: string;
  topics: string[];
  challengeTitle?: string;
  done: boolean;
  status: "COMPLETED" | "TODAY" | "UPCOMING" | "SKIPPED";
}

interface PlannedDaySchedule extends CalendarDay {
  sessions: RealStudySession[];
}

export default function RecommendationsPage() {
  // ─── Course Selection & State ───────────────────────────────────────────────
  const [activeCourseId, setActiveCourseId] = useState<string>(() => {
    return localStorage.getItem("pathai_active_study_course") || "react-19-development";
  });

  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(new Set());
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [selectedDayKey, setSelectedDayKey] = useState<string>("mon");
  const [viewMode, setViewMode] = useState<"focused" | "grid">("focused");

  // ─── Resolve Active Course ──────────────────────────────────────────────────
  const activeCourse = useMemo(() => {
    return getCourseByIdOrSlug(activeCourseId) || allCoursesCatalog[0];
  }, [activeCourseId]);

  // Read real completed topics for this course from localStorage
  const loadCompletions = useCallback(() => {
    if (!activeCourse) return;
    try {
      const saved1 = localStorage.getItem(`completed_topics_${activeCourse.id}`);
      const saved2 = localStorage.getItem(`completed_topics_${activeCourse.slug}`);
      const list = saved1 ? JSON.parse(saved1) : saved2 ? JSON.parse(saved2) : [];
      setCompletedTopicIds(new Set(Array.isArray(list) ? list : []));
    } catch {
      setCompletedTopicIds(new Set());
    }
  }, [activeCourse]);

  useEffect(() => {
    loadCompletions();
    const unsubscribe = subscribeToProgressUpdates(() => {
      loadCompletions();
    });
    return () => unsubscribe();
  }, [loadCompletions]);

  // Synchronize active course selection in localStorage
  const handleSelectCourse = (courseId: string) => {
    setActiveCourseId(courseId);
    localStorage.setItem("pathai_active_study_course", courseId);
    setWeekOffset(0);
    dispatchProgressUpdate({ action: "active_course_switched", courseId });
  };

  // ─── Real Dynamic Schedule Generation from Course Data ──────────────────────
  const { days: calendarDays } = useMemo(() => {
    return computeCurrentWeekDates(weekOffset);
  }, [weekOffset]);

  // Set default selected day key to TODAY on load
  useEffect(() => {
    const today = calendarDays.find((d) => d.isToday);
    if (today && weekOffset === 0) {
      setSelectedDayKey(today.dayKey);
    }
  }, [calendarDays, weekOffset]);

  // Generate course modules schedule
  const allCourseModules = useMemo(() => {
    if (!activeCourse?.stages) return [];
    return activeCourse.stages.flatMap((stage) =>
      stage.modules.map((mod) => ({
        ...mod,
        stageTitle: stage.title,
      }))
    );
  }, [activeCourse]);

  // Calculate real progress across the entire course
  const totalCourseModulesCount = allCourseModules.length;
  const completedCourseModulesCount = allCourseModules.filter((m) =>
    completedTopicIds.has(m.id)
  ).length;

  // Real Dynamic Week Number Calculation (Derived from completed count)
  const currentWeekNumber = useMemo(() => {
    if (!activeCourse) return 1;
    const totalEstWeeks = activeCourse.estimatedWeeks || 6;
    if (totalCourseModulesCount === 0 || completedCourseModulesCount === 0) {
      return 1 + weekOffset;
    }
    const computedWeek = Math.min(
      totalEstWeeks,
      Math.floor((completedCourseModulesCount / totalCourseModulesCount) * totalEstWeeks) + 1
    );
    return Math.max(1, Math.min(totalEstWeeks, computedWeek + weekOffset));
  }, [activeCourse, totalCourseModulesCount, completedCourseModulesCount, weekOffset]);

  // Distribute real course modules across the 7 days of the timetable
  const weeklySchedule: PlannedDaySchedule[] = useMemo(() => {
    if (allCourseModules.length === 0) {
      return calendarDays.map((d) => ({ ...d, sessions: [] }));
    }

    // Determine current window of modules for this week
    const modulesPerWeek = Math.max(1, Math.ceil(allCourseModules.length / (activeCourse.estimatedWeeks || 6)));
    const startModuleIndex = Math.max(
      0,
      (currentWeekNumber - 1) * modulesPerWeek
    );
    const weekModules = allCourseModules.slice(startModuleIndex, startModuleIndex + modulesPerWeek + 3);

    // Map modules into days (Mon-Sun)
    return calendarDays.map((day, dayIdx) => {
      const dayModules: CourseModuleItem[] = [];

      if (weekModules.length > 0) {
        if (weekModules.length <= 7) {
          if (weekModules[dayIdx]) {
            dayModules.push(weekModules[dayIdx]);
          }
        } else {
          const primaryIdx = dayIdx % weekModules.length;
          if (weekModules[primaryIdx]) {
            dayModules.push(weekModules[primaryIdx]);
          }
          if ((dayIdx === 2 || dayIdx === 5) && weekModules[primaryIdx + 1]) {
            dayModules.push(weekModules[primaryIdx + 1]);
          }
        }
      }

      const sessions: RealStudySession[] = dayModules.map((mod) => {
        const isDone = completedTopicIds.has(mod.id);
        const parsedHours = parseFloat(mod.duration) || 1.5;

        // Real session status
        let status: RealStudySession["status"] = "UPCOMING";
        if (isDone) {
          status = "COMPLETED";
        } else if (day.isToday) {
          status = "TODAY";
        } else if (day.isPast) {
          status = "UPCOMING";
        }

        const rawType = (mod.type || "concept").toLowerCase();
        const typeFormatted =
          rawType === "practice"
            ? "Practice"
            : rawType === "project"
            ? "Project"
            : rawType === "assessment"
            ? "Assessment"
            : "Concept";

        return {
          id: mod.id,
          moduleId: mod.id,
          stageTitle: (mod as any).stageTitle || activeCourse.stages[0]?.title || "Fundamentals",
          title: mod.title,
          durationLabel: mod.duration || "1.5 hrs",
          durationHours: parsedHours,
          type: typeFormatted,
          description: mod.description,
          topics: mod.topics || [],
          challengeTitle: mod.challengeTitle,
          done: isDone,
          status,
        };
      });

      return {
        ...day,
        sessions,
      };
    });
  }, [allCourseModules, activeCourse, currentWeekNumber, calendarDays, completedTopicIds]);

  // Real Streak Calculation (Based purely on real completions)
  const realStreak = useMemo(() => {
    if (completedCourseModulesCount === 0) return 0;
    const lastUpdate = localStorage.getItem("pathai_last_progress_update");
    if (!lastUpdate) return 1;
    const daysSince = Math.floor(
      (Date.now() - parseInt(lastUpdate, 10)) / (1000 * 60 * 60 * 24)
    );
    if (daysSince === 0) return Math.min(completedCourseModulesCount, 3);
    if (daysSince === 1) return Math.min(completedCourseModulesCount, 2);
    return 0;
  }, [completedCourseModulesCount]);

  // ─── Interactive Completion Toggle ──────────────────────────────────────────
  const toggleSessionDone = (sessionId: string) => {
    const next = new Set(completedTopicIds);
    if (next.has(sessionId)) {
      next.delete(sessionId);
    } else {
      next.add(sessionId);
    }
    setCompletedTopicIds(next);

    if (activeCourse) {
      localStorage.setItem(`completed_topics_${activeCourse.id}`, JSON.stringify(Array.from(next)));
      localStorage.setItem(`completed_topics_${activeCourse.slug}`, JSON.stringify(Array.from(next)));
    }
    localStorage.setItem("pathai_last_progress_update", Date.now().toString());

    dispatchProgressUpdate({
      action: "study_session_toggled",
      courseId: activeCourse?.id,
      sessionId,
    });
  };

  const activeDay =
    weeklySchedule.find((d) => d.dayKey === selectedDayKey) || weeklySchedule[0];

  return (
    <div className="relative flex flex-col gap-6 pb-20 max-w-7xl mx-auto w-full -mt-3 sm:-mt-5">
      {/* ─── Real Dynamic Timetable Section ────────────────────────────────── */}
      <section aria-label="Adaptive Study Timetable" className="w-full flex flex-col gap-4">
        {/* Header Title Bar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-[#2b7fff]">
            Weekly Study Plan
          </h1>
          <Badge
            variant="outline"
            className="bg-blue-50/80 text-[#2b7fff] border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-md"
          >
            Week {currentWeekNumber.toString().padStart(2, "0")} of {(activeCourse.estimatedWeeks || 6).toString().padStart(2, "0")}
          </Badge>
        </div>

        {/* ─── Unified Product Toolbar (ONE cohesive bar, not 4 separate boxes) ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-zinc-200/90 rounded-xl px-3.5 py-2 shadow-2xs">
          {/* LEFT: Primary Context - Course Selector */}
          <div className="flex items-center gap-2 flex-1 max-w-sm sm:max-w-md w-full">
            <div className="relative w-full">
              <select
                value={activeCourse.id}
                onChange={(e) => handleSelectCourse(e.target.value)}
                className="w-full h-8.5 pl-3 pr-8 text-xs font-semibold bg-zinc-50/70 border border-zinc-200/80 rounded-lg text-zinc-900 shadow-2xs hover:border-zinc-300 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2b7fff]/20 focus:border-[#2b7fff] transition-all cursor-pointer appearance-none"
              >
                {allCoursesCatalog.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400">
                <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* RIGHT: Compact Metadata + Week Navigation + View Toggle */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap self-end md:self-auto">
            {/* Study Streak (Compact metadata text, no card box) */}
            <div className="flex items-center gap-1.5 text-xs select-none">
              <Flame
                className={`size-3.5 transition-colors ${
                  realStreak > 0 ? "text-amber-500 fill-amber-500" : "text-zinc-400"
                }`}
              />
              <span className="font-bold text-zinc-900">{realStreak}</span>
              <span className="text-zinc-500 font-medium">day streak</span>
            </div>

            {/* Subtle Divider */}
            <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

            {/* Week Navigation (‹ Current Week ›) */}
            <div className="flex items-center gap-0.5 select-none">
              <button
                type="button"
                title="Previous Week"
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="size-7 flex items-center justify-center text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 active:scale-95 rounded-md transition-all cursor-pointer border-0 bg-transparent"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer border-0 ${
                  weekOffset === 0
                    ? "text-[#2b7fff] bg-blue-50/90 font-bold"
                    : "text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 bg-transparent"
                }`}
              >
                Current Week
              </button>
              <button
                type="button"
                title="Next Week"
                onClick={() => setWeekOffset((prev) => prev + 1)}
                className="size-7 flex items-center justify-center text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 active:scale-95 rounded-md transition-all cursor-pointer border-0 bg-transparent"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            {/* Subtle Divider */}
            <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

            {/* Day View / Full Week Segmented Control */}
            <div className="flex items-center p-0.5 bg-zinc-100 rounded-lg border border-zinc-200/70 text-xs select-none">
              <button
                type="button"
                onClick={() => setViewMode("focused")}
                className={`px-2.5 py-1 rounded-md text-xs transition-all duration-150 cursor-pointer border-0 ${
                  viewMode === "focused"
                    ? "bg-white text-zinc-950 font-semibold shadow-2xs"
                    : "text-zinc-600 hover:text-zinc-900 font-medium bg-transparent"
                }`}
              >
                Day View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-2.5 py-1 rounded-md text-xs transition-all duration-150 cursor-pointer border-0 ${
                  viewMode === "grid"
                    ? "bg-white text-zinc-950 font-semibold shadow-2xs"
                    : "text-zinc-600 hover:text-zinc-900 font-medium bg-transparent"
                }`}
              >
                Full Week
              </button>
            </div>
          </div>
        </div>

        {/* Real Days Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1 select-none">
          {weeklySchedule.map((day) => {
            const isSelected = selectedDayKey === day.dayKey;
            const hasSessions = day.sessions.length > 0;
            const isAllDone = hasSessions && day.sessions.every((s) => s.done);

            return (
              <button
                key={day.dayKey}
                type="button"
                onClick={() => setSelectedDayKey(day.dayKey)}
                className={`flex-1 min-w-[105px] p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col gap-1 ${
                  isSelected
                    ? "bg-white border-[#2b7fff] shadow-xs ring-1 ring-[#2b7fff]/25"
                    : isAllDone
                    ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-950 hover:bg-emerald-50"
                    : "bg-white border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50/50 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isSelected
                        ? "text-[#2b7fff]"
                        : isAllDone
                        ? "text-emerald-700"
                        : "text-zinc-500"
                    }`}
                  >
                    {day.dayShort}
                  </span>
                  {day.isToday ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-[#2b7fff] text-white shadow-xs">
                      <span className="size-1 rounded-full bg-white animate-pulse" />
                      TODAY
                    </span>
                  ) : isAllDone ? (
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                  ) : null}
                </div>
                <div className="text-[11px] font-bold text-zinc-900">
                  {day.dateFormatted}
                </div>
                <div className="text-[10px] text-zinc-500 font-medium">
                  {day.sessions.length === 0
                    ? "Rest Day"
                    : `${day.sessions.length} ${day.sessions.length === 1 ? "session" : "sessions"}`}
                </div>
              </button>
            );
          })}
        </div>

        {/* ─── Day Content: Focused View with AnimatePresence ─────────────── */}
        {viewMode === "focused" ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                  <span>{activeDay.dayFull}</span>
                  <span className="text-zinc-300">·</span>
                  <span className="text-xs font-semibold text-zinc-500">{activeDay.dateFormatted}</span>
                  {activeDay.isToday && (
                    <Badge className="bg-[#2b7fff]/15 text-[#2b7fff] border-0 text-[10px] font-bold px-2 py-0.5">
                      TODAY'S SCHEDULE
                    </Badge>
                  )}
                </h3>
              </div>
              <span className="text-xs font-medium text-zinc-500">
                {activeDay.sessions.filter((s) => s.done).length} of {activeDay.sessions.length} completed
              </span>
            </div>

            <AnimatePresence mode="wait">
              {activeDay.sessions.length === 0 ? (
                /* Empty / Rest Day State */
                <motion.div
                  key={`empty-${activeDay.dayKey}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="p-8 text-center bg-white/70 backdrop-blur-xl rounded-2xl border border-dashed border-zinc-200 shadow-sm flex flex-col items-center justify-center gap-2"
                >
                  <Compass className="size-8 text-zinc-300" />
                  <div className="text-sm font-bold text-zinc-700">No Sessions Scheduled for {activeDay.dayFull}</div>
                  <p className="text-xs text-zinc-500 max-w-md">
                    Use this time for revision, rest, or reviewing previously completed modules.
                  </p>
                </motion.div>
              ) : (
                /* Scheduled Real Sessions Grid with Glassmorphic Elevation & Motion */
                <motion.div
                  key={`sessions-${activeDay.dayKey}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {activeDay.sessions.map((session, idx) => {
                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.05 }}
                        whileHover={{ y: -3 }}
                        className={`rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between gap-4 backdrop-blur-2xl ${
                          session.done
                            ? "border border-white/70 bg-zinc-50/70 text-zinc-500 shadow-2xs"
                            : activeDay.isToday
                            ? "border border-[#2b7fff]/50 bg-gradient-to-br from-white/95 via-blue-50/30 to-white/80 ring-1 ring-[#2b7fff]/25 shadow-[0_12px_35px_-6px_rgba(43,127,255,0.14)]"
                            : "border border-white/90 bg-white/80 hover:border-[#2b7fff]/40 shadow-[0_8px_25px_-6px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_35px_-8px_rgba(43,127,255,0.12)]"
                        }`}
                      >
                        <div className="flex flex-col gap-2">
                          {/* Module & Type Header */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider truncate max-w-[200px]">
                              {session.stageTitle}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant="secondary"
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs ${
                                  session.type === "Project"
                                    ? "bg-purple-50/90 text-purple-700 border border-purple-200/80"
                                    : session.type === "Practice"
                                    ? "bg-blue-50/90 text-blue-700 border border-blue-200/80"
                                    : session.type === "Assessment"
                                    ? "bg-amber-50/90 text-amber-700 border border-amber-200/80"
                                    : "bg-emerald-50/90 text-emerald-700 border border-emerald-200/80"
                                }`}
                              >
                                {session.type}
                              </Badge>
                            </div>
                          </div>

                          {/* Session Title */}
                          <h4
                            className={`text-base font-bold leading-snug transition-colors ${
                              session.done ? "line-through text-zinc-400" : "text-zinc-950"
                            }`}
                          >
                            {session.title}
                          </h4>

                          {/* Duration & Topic Sub-Items */}
                          <div className="flex items-center gap-3 text-xs text-zinc-500">
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="size-3.5 text-zinc-400" />
                              {session.durationLabel}
                            </span>
                            {session.topics.length > 0 && (
                              <span className="text-[11px] text-zinc-400">
                                {session.topics.length} key {session.topics.length === 1 ? "concept" : "concepts"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description & Challenge Deliverable */}
                        {session.description && (
                          <div className="text-xs text-zinc-600 bg-white/70 backdrop-blur-md p-3 rounded-xl border border-white/80 leading-relaxed shadow-2xs">
                            {session.description}
                          </div>
                        )}

                        {session.challengeTitle && (
                          <div className="text-xs text-blue-950 bg-blue-50/70 backdrop-blur-md p-3 rounded-xl border border-blue-100/90 leading-relaxed shadow-2xs">
                            <span className="font-bold text-blue-950 block mb-0.5">Practical Milestone:</span>
                            {session.challengeTitle}
                          </div>
                        )}

                        {/* Footer Action Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => toggleSessionDone(session.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                              session.done
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-2xs"
                                : "bg-[#2b7fff] text-white border-[#2b7fff] hover:bg-blue-600 shadow-xs shadow-blue-500/20"
                            }`}
                          >
                            <Check className="size-3.5 stroke-[2.5]" />
                            <span>{session.done ? "Completed" : "Mark Complete"}</span>
                          </motion.button>

                          <a
                            href={`/courses/${activeCourse.slug}`}
                            className="text-xs font-bold text-[#2b7fff] hover:underline flex items-center gap-1 transition-transform hover:translate-x-0.5"
                          >
                            <span>Open in Course</span>
                            <ArrowRight className="size-3" />
                          </a>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* ─── Full Week Grid View with Framer Motion ───────────────────── */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3"
          >
            {weeklySchedule.map((day) => (
              <motion.div
                key={day.dayKey}
                whileHover={{ y: -2 }}
                className={`border rounded-2xl p-4 flex flex-col justify-between gap-3 backdrop-blur-xl transition-all ${
                  day.isToday
                    ? "border-[#2b7fff] bg-blue-50/40 shadow-xs ring-1 ring-[#2b7fff]/20"
                    : "border-white/90 bg-white/75 shadow-xs hover:border-blue-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                    <span className="text-xs font-bold uppercase text-zinc-600">
                      {day.dayShort}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium">{day.dateFormatted}</span>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    {day.sessions.length === 0 ? (
                      <div className="text-[11px] text-zinc-400 italic py-3 text-center">
                        Rest Day
                      </div>
                    ) : (
                      day.sessions.map((s) => (
                        <div
                          key={s.id}
                          className={`p-2.5 rounded-xl border text-left text-xs backdrop-blur-md ${
                            s.done
                              ? "bg-emerald-50/60 border-emerald-200 line-through text-zinc-400"
                              : "bg-white/80 border-white/90 shadow-2xs"
                          }`}
                        >
                          <div className="font-bold text-zinc-900 truncate mb-1">{s.title}</div>
                          <div className="flex items-center justify-between text-[10px] text-zinc-500">
                            <span>{s.durationLabel}</span>
                            <span className="font-semibold text-[#2b7fff]">{s.type}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedDayKey(day.dayKey);
                    setViewMode("focused");
                  }}
                  className="w-full py-1 text-center text-xs font-bold text-[#2b7fff] hover:underline cursor-pointer border-0 bg-transparent"
                >
                  View Details →
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
