import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Route,
  Sparkles,
  ArrowRight,
  Trash2,
  BookOpen,
  Calendar,
  Layers,
  Loader2,
  Search,
  Clock,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { conversationsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export interface ConversationItem {
  id: string;
  title: string;
  status: "ACTIVE" | "COMPLETED" | "DRAFT";
  createdAt: string;
  progress: number;
  category: string;
  roadmap?: {
    objective: string;
    phases: { id: string }[];
  } | null;
  learningContext?: {
    learningGoal: string;
    currentLevel: string;
  } | null;
}

const defaultCuratedRoadmaps: ConversationItem[] = [
  {
    id: "fe-roadmap-01",
    title: "Frontend Engineering Roadmap",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    progress: 42,
    category: "Frontend",
    learningContext: {
      learningGoal: "Frontend Engineering from foundations to career-ready",
      currentLevel: "Intermediate",
    },
    roadmap: {
      objective: "Frontend Engineering Roadmap",
      phases: [{ id: "p1" }, { id: "p2" }, { id: "p3" }, { id: "p4" }, { id: "p5" }],
    },
  },
  {
    id: "ai-roadmap-02",
    title: "Full-Stack AI Agents & LLM Systems",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    progress: 25,
    category: "AI & Full-Stack",
    learningContext: {
      learningGoal: "Build autonomous AI agents with LangChain, Next.js, and Vector Databases",
      currentLevel: "Intermediate",
    },
    roadmap: {
      objective: "Full-Stack AI Agents & LLM Systems",
      phases: [{ id: "p1" }, { id: "p2" }, { id: "p3" }, { id: "p4" }],
    },
  },
  {
    id: "devops-roadmap-03",
    title: "DevOps, Docker & Kubernetes CI/CD",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    progress: 10,
    category: "DevOps",
    learningContext: {
      learningGoal: "Containerization, microservices deployment, and automated GitHub Actions pipelines",
      currentLevel: "Beginner",
    },
    roadmap: {
      objective: "DevOps, Docker & Kubernetes CI/CD",
      phases: [{ id: "p1" }, { id: "p2" }, { id: "p3" }],
    },
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const { data } = await conversationsApi.list();
      if (data.conversations && data.conversations.length > 0) {
        const mapped: ConversationItem[] = data.conversations.map((c: any) => ({
          id: c.id,
          title: c.title || "Custom Learning Path",
          status: c.status || "ACTIVE",
          createdAt: c.createdAt || new Date().toISOString(),
          progress: Math.floor(Math.random() * 40) + 10,
          category: "Personalized",
          roadmap: c.roadmap,
          learningContext: c.learningContext,
        }));
        setConversations(mapped);
      } else {
        const stored = localStorage.getItem("local_conversations");
        if (stored) {
          setConversations(JSON.parse(stored));
        } else {
          setConversations(defaultCuratedRoadmaps);
          localStorage.setItem("local_conversations", JSON.stringify(defaultCuratedRoadmaps));
        }
      }
    } catch {
      const stored = localStorage.getItem("local_conversations");
      if (stored) {
        setConversations(JSON.parse(stored));
      } else {
        setConversations(defaultCuratedRoadmaps);
        localStorage.setItem("local_conversations", JSON.stringify(defaultCuratedRoadmaps));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleCreateNew = async () => {
    try {
      setIsCreating(true);
      const localId = `conv-${Date.now()}`;
      try {
        const { data } = await conversationsApi.create("New Learning Path");
        if (data?.conversation?.id) {
          navigate(`/conversations/${data.conversation.id}/questionnaire`);
          return;
        }
      } catch {
        // offline fallback
      }
      navigate(`/conversations/${localId}/questionnaire`);
    } catch (err) {
      console.error("Failed to create conversation", err);
      navigate(`/conversations/custom-${Date.now()}/questionnaire`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this learning path?")) return;
    try {
      conversationsApi.delete(id).catch(() => {});
    } catch {
      // offline
    }
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    localStorage.setItem("local_conversations", JSON.stringify(updated));
  };

  const filtered = conversations.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.learningContext?.learningGoal || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Hero Welcome */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex flex-col gap-2">
          <Badge
            variant="secondary"
            className="font-medium rounded-full bg-[#2b7fff]/10 text-[#2b7fff] text-xs leading-4 px-3 py-1 gap-1.5 w-fit"
          >
            <Sparkles className="size-3.5" />
            AI Learning Hub
          </Badge>
          <h1 className="font-bold text-3xl leading-9 tracking-tight">
            Welcome back, {user?.fullName?.split(" ")[0] || "Learner"}!
          </h1>
          <p className="text-[#71717b] text-sm leading-5">
            Manage your AI-crafted learning journeys and track your competency milestones.
          </p>
        </div>

        <Button
          onClick={handleCreateNew}
          disabled={isCreating}
          className="bg-[#2b7fff] text-white hover:bg-[#2563eb] gap-2 rounded-xl shadow-lg shadow-[#2b7fff]/25 px-5 h-11 text-sm font-semibold cursor-pointer"
        >
          {isCreating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Plus className="size-4" />
              New Learning Path
            </>
          )}
        </Button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 backdrop-blur-xl bg-white/60 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-xl bg-[#2b7fff]/10 text-[#2b7fff] flex items-center justify-center">
            <Route className="size-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{conversations.length}</div>
            <div className="text-xs text-[#71717b]">Total Learning Paths</div>
          </div>
        </Card>

        <Card className="p-5 backdrop-blur-xl bg-white/60 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BookOpen className="size-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">18</div>
            <div className="text-xs text-[#71717b]">Completed Milestones</div>
          </div>
        </Card>

        <Card className="p-5 backdrop-blur-xl bg-white/60 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Clock className="size-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">24 hrs</div>
            <div className="text-xs text-[#71717b]">Learning Time Spent</div>
          </div>
        </Card>

        <Card className="p-5 backdrop-blur-xl bg-white/60 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Compass className="size-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">4.8 / 5.0</div>
            <div className="text-xs text-[#71717b]">Curriculum Match Score</div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100/80 dark:bg-zinc-800/80 rounded-xl w-full sm:w-auto">
          {["ALL", "ACTIVE", "COMPLETED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all border-0 cursor-pointer ${
                statusFilter === st
                  ? "bg-white dark:bg-zinc-950 text-[#2b7fff] shadow-sm"
                  : "text-[#71717b] hover:text-zinc-900 dark:hover:text-zinc-50 bg-transparent"
              }`}
            >
              {st === "ALL" ? "All Paths" : st === "ACTIVE" ? "Active" : "Completed"}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="size-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search learning paths..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff]"
          />
        </div>
      </div>

      {/* Paths List Section */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 text-[#2b7fff] animate-spin" />
            <p className="text-sm text-[#71717b]">Loading your roadmaps...</p>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-white/40 border-dashed border-2 border-zinc-200 dark:border-zinc-800">
            <div className="size-16 rounded-2xl bg-[#2b7fff]/10 text-[#2b7fff] flex items-center justify-center">
              <Layers className="size-8" />
            </div>
            <div className="max-w-md">
              <h3 className="font-semibold text-lg mb-1">No learning paths found</h3>
              <p className="text-sm text-[#71717b]">
                Try adjusting your search criteria or create a new personalized learning path.
              </p>
            </div>
            <Button
              onClick={handleCreateNew}
              className="bg-[#2b7fff] text-white hover:bg-[#2563eb] gap-2 rounded-xl"
            >
              <Plus className="size-4" />
              Start Learning Path
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((conv) => (
              <Card
                key={conv.id}
                onClick={() => navigate(`/conversations/${conv.id}/roadmap`)}
                className="group relative cursor-pointer backdrop-blur-xl bg-white/70 hover:bg-white dark:hover:bg-zinc-950 hover:shadow-xl hover:shadow-[#2b7fff]/5 hover:border-[#2b7fff]/30 transition-all duration-300 flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      variant="outline"
                      className="bg-zinc-50 dark:bg-zinc-900 text-[10px] uppercase font-semibold text-zinc-600 dark:text-zinc-400"
                    >
                      {conv.category || "General"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-zinc-400 dark:text-zinc-500 hover:text-red-500 rounded-lg -mr-2 -mt-2"
                      onClick={(e) => handleDelete(e, conv.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-base group-hover:text-[#2b7fff] transition-colors line-clamp-1 mt-1 font-bold">
                    {conv.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs leading-relaxed mt-1">
                    {conv.roadmap?.objective ||
                      conv.learningContext?.learningGoal ||
                      "Personalized path powered by PathAI"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#71717b]">Mastery Progress</span>
                      <span className="font-semibold text-[#2b7fff]">{conv.progress}%</span>
                    </div>
                    <Progress value={conv.progress} className="h-1.5" />

                    <div className="flex items-center justify-between text-xs text-[#71717b] mt-2">
                      <span className="capitalize px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-700 dark:text-zinc-300 text-[11px]">
                        {conv.learningContext?.currentLevel || "Intermediate"}
                      </span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="size-3.5" />
                        {new Date(conv.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-xs font-semibold text-[#2b7fff]">
                  <span>Open Roadmap</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
