import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Login from "../auth/Login";
import Register from "../auth/Register";
import ProtectedRoute from "../components/ProtectedRoute";
import GuestRoute from "../components/GuestRoute";
import DashboardPage from "../pages/dashboard/DashboardPage";
import GroupsDashboard from "../pages/groups/GroupsDashboard";
import GroupsPage from "../pages/groups/GroupsPage";
import CreateGroup from "../pages/groups/CreateGroup";
import GroupKpi from "../pages/groups/GroupKpi";
import KpiPage from "../pages/kpi/KpisPage";
import DashboardLayout from "../layouts/DashBoardLayout";
import FriendsPage from "../pages/friends/FriendsPage";
import ProfilePage from "../pages/profile/ProfilePage";
import CreateKpi from "../pages/kpi/CreateKpi";
import CreateGroupKpi from "../pages/groups/CreateGroupKpi";
import GroupsMembers from "../pages/groups/GroupsMembers";
import Kpi from "../pages/kpi/Kpi";
import SettingsPage from "../pages/settingsPage/settingsPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute children={<Outlet />} />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute children={<Outlet />} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/groups" element={<GroupsDashboard />} />
            <Route path="/groups/:groupId" element={<GroupsPage />} />
            <Route
              path="/groups/:groupId/members"
              element={<GroupsMembers />}
            />
            <Route path="/groups/:groupId/:kpiId" element={<GroupKpi />} />
            <Route
              path="/groups/:groupId/create-kpi"
              element={<CreateGroupKpi />}
            />
            <Route path="/groups/create" element={<CreateGroup />} />
            <Route path="/kpis" element={<KpiPage />} />
            <Route path="/kpis/:kpiId" element={<Kpi />} />
            <Route path="/kpis/create" element={<CreateKpi />} />
            {/* <Route path="/" element={<LeaderboardPage />} /> */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
