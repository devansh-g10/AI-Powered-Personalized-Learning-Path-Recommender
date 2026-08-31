import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Route, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallbackPage() {
  const { handleGoogleCallback } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  // Guard so the callback only ever runs once, even if deps change
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const processCallback = async () => {
      try {
        // Supabase OAuth can place tokens in hash fragment or query string
        const hash = window.location.hash.startsWith("#")
          ? window.location.hash.substring(1)
          : window.location.hash;
        const search = window.location.search.startsWith("?")
          ? window.location.search.substring(1)
          : window.location.search;

        const hashParams = new URLSearchParams(hash);
        const searchParams = new URLSearchParams(search);

        const errorMsg =
          hashParams.get("error_description") ||
          searchParams.get("error_description") ||
          hashParams.get("error") ||
          searchParams.get("error");

        if (errorMsg) {
          setError(decodeURIComponent(errorMsg.replace(/\+/g, " ")));
          return;
        }

        const accessToken =
          hashParams.get("access_token") ||
          searchParams.get("access_token");
        const refreshToken =
          hashParams.get("refresh_token") ||
          searchParams.get("refresh_token");

        if (!accessToken) {
          setError("No access token found in callback URL. Please try logging in again.");
          return;
        }

        await handleGoogleCallback(accessToken, refreshToken || "");
        navigate("/dashboard", { replace: true });
      } catch (err: any) {
        console.error("Authentication callback processing failed:", err);
        setError(err.message || "Failed to complete authentication. Please try again.");
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
