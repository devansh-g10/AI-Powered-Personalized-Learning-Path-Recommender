import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Route, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallbackPage() {
  const { handleGoogleCallback } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Supabase OAuth puts tokens in the URL hash fragment
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (!accessToken) {
          setError("No access token found. Please try logging in again.");
          return;
        }

        await handleGoogleCallback(accessToken, refreshToken || "");
        navigate("/", { replace: true });
      } catch {
        setError("Failed to complete authentication. Please try again.");
      }
    };

    processCallback();
  }, [handleGoogleCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="size-10 shadow-lg shadow-[#2b7fff]/30 rounded-xl bg-[#2b7fff] text-blue-50 flex justify-center items-center">
            <Route className="size-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">PathAI</span>
        </div>

        {error ? (
          <div className="text-center">
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <a
              href="/login"
              className="text-[#2b7fff] font-medium hover:underline text-sm"
            >
              Back to sign in
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 text-[#2b7fff] animate-spin" />
            <p className="text-sm text-[#71717b]">
              Completing authentication...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
