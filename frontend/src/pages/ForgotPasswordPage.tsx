import { useState } from "react";
import { Link } from "react-router-dom";
import { Route, Loader2, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      setError("Failed to send reset email. Please try again.");
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
          {sent ? (
            <div className="text-center">
              <div className="size-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Mail className="size-6" />
              </div>
              <h1 className="font-bold text-2xl tracking-tight mb-2">
                Check your email
              </h1>
              <p className="text-sm text-[#71717b] mb-6">
                If an account with <strong>{email}</strong> exists, we've sent a
                password reset link.
              </p>
              <Link
                to="/login"
                className="text-[#2b7fff] font-medium hover:underline text-sm"
              >
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="font-bold text-2xl tracking-tight mb-1">
                  Forgot password?
                </h1>
                <p className="text-sm text-[#71717b]">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="forgot-email"
                    className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
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
                    "Send Reset Link"
                  )}
                </Button>
              </form>

              <div className="text-center mt-5">
                <Link
                  to="/login"
                  className="text-sm text-[#71717b] hover:text-zinc-900 dark:hover:text-zinc-50 inline-flex items-center gap-1"
                >
                  <ArrowLeft className="size-3.5" />
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
