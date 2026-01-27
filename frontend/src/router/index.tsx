import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Login from "../auth/Login";
import Register from "../auth/Register";
import ProtectedRoute from "../components/ProtectedRoute";
import GuestRoute from "../components/GuestRoute";
import Navbar from "../components/Navbar";
import DashboardPage from "../pages/dashboard/DashboardPage";
import GroupsPage from "../pages/groups/GroupsPage";
import KpiPage from "../pages/kpi/KpiPage";
import LeaderboardPage from "../pages/leaderboard/LeaderboardPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route element={<GuestRoute children={<Outlet />} />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute children={<Outlet />} />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="groups" element={<GroupsPage />} />
          <Route path="kpi" element={<KpiPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
