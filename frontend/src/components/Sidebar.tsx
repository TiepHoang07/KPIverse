// components/layout/Sidebar.tsx
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { sidebarItems } from "../config/Sidebar";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Target,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  Bell,
  Search,
  BarChart3,
  Folder,
  HelpCircle,
  Menu,
  X,
  GroupIcon,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { getFriendRequests } from "../api/friend";

// Map icon names to components
const iconMap: Record<string, any> = {
  dashboard: LayoutDashboard,
  groups: GroupIcon,
  kpis: Target,
  friends: Users,
  profile: User,
  settings: Settings,
  notifications: Bell,
  search: Search,
  analytics: BarChart3,
  projects: Folder,
  help: HelpCircle,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [me, setMe] = useState<any>(null);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchFriendRequests = () => {
    getFriendRequests().then((res) => setFriendRequests(res.data));
  };

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/users/me");
        setMe(res.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Get current page title
  const currentPage =
    sidebarItems.find((item) => item.path === location.pathname)?.label ||
    "KPIverse";

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-2 left-4 z-40 cursor-pointer rounded-lg border-[1.5px] border-primary bg-primary/10 p-2 text-primary hover:bg-primary/20 md:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-border/10 bg-white shadow-none transition-all duration-300 overflow-hidden ${
          collapsed ? "w-26" : "w-64"
        } ${mobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-border/5">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-lg font-black text-white">K</span>
              </div>
              <span className="text-xl font-black tracking-tight text-primary">KPIverse</span>
            </div>
          )}
          {collapsed && (
            <div className="flex w-full justify-center">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-xl font-black text-white">K</span>
              </div>
            </div>
          )}

          {/* Collapse button - hidden on mobile */}
          <button
            onClick={onToggle}
            className="hidden rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-primary md:block transition-all"
          >
            {collapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4 custom-scrollbar">
          {sidebarItems.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center rounded-xl transition-all duration-200 ${
                    collapsed ? "justify-center px-0 py-3.5" : "px-4 py-3"
                  } ${
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-secondary/5 hover:text-secondary"
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <div className={`relative flex items-center ${collapsed ? "" : "gap-4"}`}>
                  <Icon
                    size={20}
                    className={`${isActive ? "text-white" : "text-muted-foreground group-hover:text-secondary opacity-70 group-hover:opacity-100"} transition-all`}
                  />
                  {!collapsed && !mobileOpen && (
                    <span className="text-xs font-black uppercase tracking-[0.1em]">{item.label}</span>
                  )}
                  {mobileOpen && (
                    <span className="text-xs font-black uppercase tracking-[0.1em]">{item.label}</span>
                  )}
                  {item.label === 'Friends' && friendRequests.length >= 1 && (
                    <span className={`absolute ${collapsed ? "-top-1 -right-1" : "-right-3 -top-1"} bg-secondary rounded-full w-2.5 h-2.5 border-2 border-white ring-2 ring-secondary/20`}></span>
                  )}
                </div>


              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border/5">
          {loading ? (
            <div className="flex justify-center py-2">
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary opacity-20"></div>
            </div>
          ) : me?.user ? (
            <div className="space-y-3">
              <div
                className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${collapsed ? "justify-center" : "bg-accent/30"}`}
              >
                <img
                  onClick={() => navigate("/profile")}
                  src={
                    me.user.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${me.user.name || "User"}&background=2E4057&color=fff`
                  }
                  alt={me.user.name || "User"}
                  className="h-9 w-9 shrink-0 cursor-pointer rounded-xl object-cover ring-2 ring-white shadow-sm hover:scale-105 transition-transform"
                />

                {!collapsed && !mobileOpen && (
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-xs font-black text-primary uppercase tracking-tighter">
                      {me.user.name || "User"}
                    </p>
                  </div>
                )}
                {mobileOpen && (
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-xs font-black text-primary uppercase tracking-tighter">
                      {me.user.name || "User"}
                    </p>
                  </div>
                )}
              </div>

              {!collapsed && !mobileOpen && (
                <button
                  onClick={logout}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-destructive/5 py-3 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive hover:text-white transition-all"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              )}
              {mobileOpen && (
                <button
                  onClick={logout}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-destructive/5 py-3 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive hover:text-white transition-all"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              )}
            </div>
          ) : null}
        </div>
      </aside>

      {/* Mobile header with current page */}
      <header className="fixed top-0 right-0 left-0 z-30 border-b border-border bg-card/80 px-4 py-3 shadow-lg backdrop-blur-md md:hidden">
        <div className="flex items-center justify-center">
          <h2 className="text-lg font-semibold text-foreground">{currentPage}</h2>
        </div>
      </header>
    </>
  );
}
