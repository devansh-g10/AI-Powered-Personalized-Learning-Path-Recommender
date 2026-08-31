import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";

// Pages
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import LandingPage from "@/pages/LandingPage";
import DashboardPage from "@/pages/DashboardPage";
import QuestionnairePage from "@/pages/QuestionnairePage";
import RoadmapPage from "@/pages/RoadmapPage";
import SkillsPage from "@/pages/SkillsPage";
import CoursesPage from "@/pages/CoursesPage";
import CourseDetailPage from "@/pages/CourseDetailPage";
import RecommendationsPage from "@/pages/RecommendationsPage";
import AssistantPage from "@/pages/AssistantPage";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Direct Access Application Shell */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Landing Page (Root & /landing) */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />

            {/* Primary Navigation Views */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/roadmap/:courseId" element={<RoadmapPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/assistant" element={<AssistantPage />} />

            {/* AI Profiler & Course Creator Views */}
            <Route path="/questionnaire" element={<QuestionnairePage />} />
            <Route path="/create" element={<QuestionnairePage />} />
            <Route path="/create-course" element={<QuestionnairePage />} />
            <Route path="/courses/create" element={<QuestionnairePage />} />
            <Route
              path="/conversations/:id/questionnaire"
              element={<QuestionnairePage />}
            />
            <Route
              path="/conversations/:id/roadmap"
              element={<RoadmapPage />}
            />
            <Route
              path="/conversations/:id/assistant"
              element={<AssistantPage />}
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
