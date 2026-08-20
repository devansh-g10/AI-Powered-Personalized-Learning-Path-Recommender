import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Route,
  LogOut,
  LogIn,
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { initSmoothScroll } from "@/lib/smooth-scroll";
import { subscribeToProgressUpdates } from "@/lib/learning-data";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Roadmap", path: "/roadmap" },
  { label: "Courses", path: "/courses" },
  { label: "Recommendations", path: "/recommendations" },
  { label: "Assistant", path: "/assistant" },
];

const demoNotifications = [
  {
    id: "n1",
    title: "Milestone Verified",
    desc: "You completed 'Semantic HTML & CSS Layouts'. Verified badge unlocked in Skills!",
    time: "10m ago",
    unread: true,
  },
  {
    id: "n2",
    title: "AI Curriculum Insight",
    desc: "Based on your velocity, you can complete the Core React stage 3 days ahead of schedule.",
    time: "2h ago",
    unread: true,
  },
  {
    id: "n3",
    title: "14-Day Streak!",
    desc: "Keep up the momentum. 2 more days to reach the 16-Day Streak achievement.",
    time: "1d ago",
    unread: false,
  },
];

export default function AppLayout() {
  const { user, isAuthenticated, logout, updateUserProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notifications, setNotifications] = useState(demoNotifications);

  // Profile Edit State
  const [editName, setEditName] = useState(user?.fullName || "Alex Rivera");
  const [editBio, setEditBio] = useState(user?.bio || "Aspiring Full-Stack & AI Engineer");

  const getInitials = (name?: string) => {
    if (!name) return "AR";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ fullName: editName, bio: editBio });
    setProfileModalOpen(false);
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Initialize Lenis smooth scrolling & live notification sync
  useEffect(() => {
    const cleanup = initSmoothScroll();
    const unsubscribe = subscribeToProgressUpdates(() => {
      // Dynamic notification for real milestone activity
      setNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          title: "Milestone Verified",
          desc: "Your learning path progress has been synchronized with live competency radar.",
          time: "Just now",
          unread: true,
        },
        ...prev.slice(0, 5),
      ]);
    });

    return () => {
      cleanup?.();
      unsubscribe();
    };
  }, []);

  return (
    <div className="relative bg-white text-zinc-950 w-full min-h-screen overflow-x-hidden flex flex-col">
      {/* Background ambient gradient glows across full width */}
      <img
        src="https://images.unsplash.com/photo-1557683316-973673baf926?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGJsdWUlMjB2aW9sZXQlMjBncmFkaWVudCUyMHNvZnQlMjBnbG93fGVufDF8MHx8fDE3ODcwMzk1NTB8MA&ixlib=rb-4.1.0&q=80&w=400"
        alt=""
        className="pointer-events-none object-cover blur-3xl opacity-25 rounded-full absolute -right-24 -top-32 w-[650px] h-[650px]"
      />
      <div className="pointer-events-none blur-3xl bg-[radial-gradient(circle,oklch(0.623_0.214_259.815)_0%,transparent_70%)] opacity-15 rounded-full absolute -left-32 bottom-0 w-[700px] h-[700px]" />

      {/* ─── Full-Width Header Bar ───────────────────────────────────────── */}
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full border-b border-zinc-200/70 backdrop-blur-xl bg-white/80 sticky top-0 z-40 transition-all"
      >
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6 lg:gap-10">
            {/* Logo -> Navigates to Landing Page on Click */}
            <button
              onClick={() => navigate("/")}
              title="PathAI Home & Landing Page"
              className="flex items-center gap-2.5 bg-transparent border-0 cursor-pointer p-0 select-none group"
            >
              <div className="size-9 shadow-lg shadow-[#2b7fff]/30 rounded-xl bg-[#2b7fff] text-blue-50 flex justify-center items-center group-hover:scale-105 transition-transform">
                <Route className="size-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-zinc-900 group-hover:text-[#2b7fff] transition-colors">
                PathAI
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`font-medium rounded-xl text-sm leading-5 px-4 py-2 transition-all border-0 cursor-pointer ${
                    isActive(item.path)
                      ? "font-semibold bg-[#2b7fff]/10 text-[#2b7fff]"
                      : "text-[#71717b] hover:text-zinc-950 hover:bg-zinc-100/70 bg-transparent"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="size-9 rounded-full border-zinc-200/80 cursor-pointer relative hover:bg-zinc-100/70"
              >
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span className="size-2 rounded-full bg-[#2b7fff] absolute top-2 right-2 ring-2 ring-white" />
                )}
              </Button>

              {/* Notification Popover */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-zinc-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-zinc-900">Notifications</span>
                      {unreadCount > 0 && (
                        <Badge className="bg-[#2b7fff]/10 text-[#2b7fff] text-[10px] px-1.5 py-0">
                          {unreadCount} new
                        </Badge>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-[#2b7fff] hover:underline bg-transparent border-0 cursor-pointer font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl border transition-colors ${
                          n.unread
                            ? "bg-[#2b7fff]/5 border-[#2b7fff]/20"
                            : "bg-zinc-50/50 border-zinc-100"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-zinc-900 mb-1">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-[#71717b] font-normal">{n.time}</span>
                        </div>
                        <p className="text-xs text-zinc-600 leading-relaxed">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setProfileModalOpen(true)}
                className="bg-transparent border-0 p-0 cursor-pointer flex items-center"
              >
                <Avatar className="size-9 ring-2 ring-[#2b7fff]/20 hover:ring-[#2b7fff]/50 transition-all">
                  {user?.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                  ) : (
                    <AvatarImage
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200"
                      alt="user"
                    />
                  )}
                  <AvatarFallback className="text-xs font-semibold bg-[#2b7fff]/10 text-[#2b7fff]">
                    {getInitials(user?.fullName)}
                  </AvatarFallback>
                </Avatar>
              </button>

              {isAuthenticated && user ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-full text-[#71717b] hover:text-red-500 cursor-pointer"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut className="size-4" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="rounded-xl h-9 gap-1.5 font-medium border-zinc-200 cursor-pointer text-xs"
                >
                  <LogIn className="size-3.5" />
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden size-9 rounded-xl border border-zinc-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-b border-zinc-200 px-6 py-4 flex flex-col gap-2 z-30"
          >
            <button
              onClick={() => {
                navigate("/");
                setMobileMenuOpen(false);
              }}
              className="text-left font-semibold text-[#2b7fff] rounded-xl text-sm px-4 py-3 bg-[#2b7fff]/10 border-0 cursor-pointer"
            >
              🏠 Home & Landing Page
            </button>
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`text-left font-medium rounded-xl text-sm px-4 py-3 transition-colors border-0 cursor-pointer ${
                  isActive(item.path)
                    ? "font-semibold bg-[#2b7fff]/10 text-[#2b7fff]"
                    : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Full-Width Main Viewport Container ──────────────────────────── */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-8">
        <Outlet />
      </main>

      {/* ─── Profile Settings Modal ────────────────────────────────────────── */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 max-w-md w-full p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="size-12 ring-2 ring-[#2b7fff]/30">
                  <AvatarImage
                    src={
                      user?.avatarUrl ||
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200"
                    }
                    alt="user"
                  />
                  <AvatarFallback className="bg-[#2b7fff]/10 text-[#2b7fff] font-bold">
                    {getInitials(user?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-base text-zinc-900">
                    {user?.fullName || "Learner Profile"}
                  </h3>
                  <p className="text-xs text-[#71717b]">{user?.email || "learner@pathai.dev"}</p>
                </div>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg bg-transparent border-0 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                  Bio / Learning Goal Headline
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  className="p-3 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setProfileModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#2b7fff] text-white hover:bg-[#2563eb] rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Save Profile
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
