import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppLayout } from "@/components/layout/app-layout";
import { Toaster } from "@/components/ui/sonner";

import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { MembersPage } from "@/pages/MembersPage";
import { MemberDetailPage } from "@/pages/MemberDetailPage";
import { EventsPage } from "@/pages/EventsPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { AnnouncementsPage } from "@/pages/AnnouncementsPage";
import { ResourcesPage } from "@/pages/ResourcesPage";
import { ForumPage } from "@/pages/ForumPage";
import { ThreadDetailPage } from "@/pages/ThreadDetailPage";
import { MentorshipPage } from "@/pages/MentorshipPage";
import { LeaderboardPage } from "@/pages/LeaderboardPage";
import { AdminPage } from "@/pages/AdminPage";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="members/:id" element={<MemberDetailPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="forum" element={<ForumPage />} />
              <Route path="forum/:id" element={<ThreadDetailPage />} />
              <Route path="mentorship" element={<MentorshipPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />

              <Route element={<ProtectedRoute allowedRoles={["president"]} />}>
                <Route path="admin" element={<AdminPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
