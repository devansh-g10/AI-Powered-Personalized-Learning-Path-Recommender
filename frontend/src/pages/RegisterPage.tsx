import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Route, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter your password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register(fullName, email, password);
      if (res?.requiresEmailConfirmation) {
        setEmailConfirmationRequired(true);
      } else {
        navigate("/");
      }
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        axiosErr.response?.data?.message ||
        (axiosErr.message === "Network Error"
          ? "Cannot connect to server. Please try again later."
          : axiosErr.message || "Registration failed. Please try again.");
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch {
      setError("Failed to initiate Google login.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden py-12">
      {/* Background glows */}
      <img
        src="https://images.unsplash.com/photo-1557683316-973673baf926?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGJsdWUlMjB2aW9sZXQlMjBncmFkaWVudCUyMHNvZnQlMjBnbG93fGVufDF8MHx8fDE3ODcwMzk1NTB8MA&ixlib=rb-4.1.0&q=80&w=400"
        alt=""
        className="pointer-events-none object-cover blur-3xl opacity-25 rounded-full absolute -right-32 -top-40 w-[520px] h-[520px]"
      />
      <div className="pointer-events-none blur-3xl bg-[radial-gradient(circle,oklch(0.623_0.214_259.815)_0%,transparent_70%)] opacity-15 rounded-full absolute -left-40 -bottom-48 w-[560px] h-[560px]" />

      <div className="relative w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Route className="size-7 text-[#2b7fff] stroke-[2.5]" />
          <span className="font-bold text-xl tracking-tight">PathAI</span>
        </div>

        {/* Card */}
        <div className="backdrop-blur-xl bg-white/70 border border-zinc-200/60 rounded-2xl shadow-xl shadow-[#2b7fff]/5 p-8">
          <div className="text-center mb-6">
            <h1 className="font-bold text-2xl tracking-tight mb-1">
              Create your account
            </h1>
            <p className="text-sm text-[#71717b]">
              Start your personalized learning journey with AI
            </p>
          </div>

          {emailConfirmationRequired ? (
            <div className="text-center py-4">
              <div className="size-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="size-7" />
              </div>
              <h2 className="font-bold text-2xl tracking-tight mb-2 text-zinc-900">
                Verification Email Sent!
              </h2>
              <p className="text-sm text-zinc-600 mb-6 leading-relaxed">
                We've sent a confirmation link to <strong>{email}</strong>.<br />
                Please check your inbox and verify your email to log in.
              </p>
              <Button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full h-10 bg-[#2b7fff] text-white font-semibold rounded-lg hover:bg-[#2563eb]"
              >
                Go to Sign In
              </Button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fullName" className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Devansh Maheshwari"
                    required
                    className="h-10 px-3 rounded-lg border border-zinc-200 bg-white/90 text-sm outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-email" className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="h-10 px-3 rounded-lg border border-zinc-200 bg-white/90 text-sm outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-password" className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                    Password (8+ characters)
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="h-10 w-full px-3 pr-10 rounded-lg border border-zinc-200 bg-white/90 text-sm outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717b] hover:text-zinc-900 bg-transparent border-0 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirm-password" className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="h-10 w-full px-3 pr-10 rounded-lg border border-zinc-200 bg-white/90 text-sm outline-none focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717b] hover:text-zinc-900 bg-transparent border-0 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 bg-[#2b7fff] text-white font-semibold rounded-lg hover:bg-[#2563eb] transition-colors cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-zinc-200" />
                <span className="text-xs text-[#71717b]">or</span>
                <div className="flex-1 h-px bg-zinc-200" />
              </div>

              {/* Google */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full h-10 gap-2 border-zinc-200 hover:bg-zinc-50 font-medium text-xs cursor-pointer"
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>
            </>
          )}

          <p className="text-center text-sm text-[#71717b] mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#2b7fff] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
