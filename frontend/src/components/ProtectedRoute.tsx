import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Route } from "lucide-react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // While the auth state is being hydrated from localStorage, show a spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-2 mb-2">
          <div className="size-10 shadow-lg shadow-[#2b7fff]/30 rounded-xl bg-[#2b7fff] text-blue-50 flex justify-center items-center">
            <Route className="size-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">PathAI</span>
        </div>
        <Loader2 className="size-7 text-[#2b7fff] animate-spin" />
        <p className="text-sm text-[#71717b]">Loading your session…</p>
      </div>
    );
  }

  // If not authenticated, redirect to login and preserve the attempted path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
