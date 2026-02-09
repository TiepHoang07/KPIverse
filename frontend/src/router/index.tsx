import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Login from "../auth/Login";
import Register from "../auth/Register";
import ProtectedRoute from "../components/ProtectedRoute";
import GuestRoute from "../components/GuestRoute";
import Navbar from "../components/Navbar";
import DashboardPage from "../pages/dashboard/DashboardPage";
import GroupsDashboard from "../pages/groups/GroupsDashboard";
import GroupsPage from "../pages/groups/GroupsPage"
import CreateGroup from "../pages/groups/CreateGroup";
import KpiPage from "../pages/kpi/KpiPage";
import LeaderboardPage from "../pages/leaderboard/LeaderboardPage";
import DashboardLayout from "../layouts/DashBoardLayout";
import FriendsPage from "../pages/friends/FriendsPage";
import ProfilePage from "../pages/ProfilePage";

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
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/groups" element={<GroupsDashboard />} />
            <Route path="/groups/create" element={<CreateGroup />} />
            <Route path="/kpi" element={<KpiPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/groups/:groupId" element={<GroupsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
