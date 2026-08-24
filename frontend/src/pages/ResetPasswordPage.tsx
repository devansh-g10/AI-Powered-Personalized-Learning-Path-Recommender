import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Route, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Supabase puts access_token in the URL hash or query params
  const accessToken =
    searchParams.get("access_token") ||
    new URLSearchParams(window.location.hash.substring(1)).get("access_token") ||
    "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!accessToken) {
      setError("Invalid or missing reset token. Please request a new reset link.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword({ accessToken, newPassword });
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to reset password. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 relative overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1557683316-973673baf926?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGJsdWUlMjB2aW9sZXQlMjBncmFkaWVudCUyMHNvZnQlMjBnbG93fGVufDF8MHx8fDE3ODcwMzk1NTB8MA&ixlib=rb-4.1.0&q=80&w=400"
        alt=""
        className="pointer-events-none object-cover blur-3xl opacity-25 rounded-full absolute -right-32 -top-40 w-[520px] h-[520px]"
      />
      <div className="pointer-events-none blur-3xl bg-[radial-gradient(circle,oklch(0.623_0.214_259.815)_0%,transparent_70%)] opacity-15 rounded-full absolute -left-40 -bottom-48 w-[560px] h-[560px]" />

      <div className="relative w-full max-w-md px-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="size-10 shadow-lg shadow-[#2b7fff]/30 rounded-xl bg-[#2b7fff] text-blue-50 flex justify-center items-center">
            <Route className="size-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">PathAI</span>
        </div>

        <div className="backdrop-blur-xl bg-white/60 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl shadow-xl shadow-[#2b7fff]/5 p-8">
          {success ? (
            <div className="text-center">
              <div className="size-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="size-6" />
              </div>
              <h1 className="font-bold text-2xl tracking-tight mb-2">
                Password reset!
              </h1>
              <p className="text-sm text-[#71717b] mb-6">
                Your password has been changed. You can now sign in.
              </p>
              <Link to="/login">
                <Button className="bg-[#2b7fff] text-white font-semibold">
                  Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="font-bold text-2xl tracking-tight mb-1">
                  Reset your password
                </h1>
                <p className="text-sm text-[#71717b]">
                  Enter your new password below.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="new-password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="h-10 w-full px-3 pr-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/80 text-sm outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717b] hover:text-zinc-900 dark:hover:text-zinc-50 bg-transparent border-0 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirm-new-password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-new-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/80 text-sm outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff] transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 bg-[#2b7fff] text-white font-semibold rounded-lg"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
