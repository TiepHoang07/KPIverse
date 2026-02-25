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
  GroupIcon
} from "lucide-react";

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
  onCollapse?: (collapsed: boolean) => void;
}

export default function Sidebar({ onCollapse }: SidebarProps) {
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navigate = useNavigate();

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

  // Handle collapse state changes
  const toggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    if (onCollapse) onCollapse(newState);
  };

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
        className="fixed top-2 left-4 z-40 cursor-pointer rounded-lg border-[1.5px] border-blue-600 bg-blue-100 p-2 text-blue-600 hover:bg-blue-200 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 ">
          {!collapsed && (
            <img className="ml-5 h-12 w-28" src="/images/logo.png" alt="logo" />
          )}
          {collapsed && (
            <div className="flex w-full justify-center">
              <span className="text-2xl font-bold text-blue-600">K</span>
            </div>
          )}

          {/* Collapse button - hidden on mobile */}
          <button
            onClick={toggleCollapse}
            className="hidden rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:block"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Close button - visible on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="cursor-pointer rounded-lg p-1.5 mr-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {sidebarItems.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center rounded-lg transition-all ${
                    collapsed ? "justify-center px-2 py-3" : "px-4 py-2.5"
                  } ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={20}
                    className={isActive ? "text-blue-600" : "text-gray-500"}
                  />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </div>

                {/* Active indicator */}
                {isActive && !collapsed && (
                  <div className="absolute right-2 h-2 w-2 rounded-full bg-blue-600" />
                )}

                {/* Tooltip for collapsed mode */}
                {collapsed && (
                  <div className="absolute left-full ml-2 hidden rounded-lg bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User section - with null check */}
        <div
          className={`border-t border-gray-200 p-3 ${collapsed ? "text-center" : ""}`}
        >
          {loading ? (
            <div className="flex justify-center py-2">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          ) : me?.user ? (
            <>
              <div
                className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}
              >
                <div className="relative">
                  <img
                    onClick={() => navigate("/profile")}
                    src={
                      me.user.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${me.user.name || "User"}&background=3b82f6&color=fff`
                    }
                    alt={me.user.name || "User"}
                    className="h-8 w-8 cursor-pointer rounded-full object-cover ring-2 ring-blue-100"
                  />
                </div>

                {!collapsed && (
                  <div className="flex-1">
                    <p className="truncate text-sm font-medium text-gray-700">
                      {me.user.name || "User"}
                    </p>
                  </div>
                )}
              </div>

              {!collapsed && (
                <button className="mt-3 flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              )}
            </>
          ) : (
            <div className="py-2 text-center text-sm text-gray-500">
              <p>Please log in</p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile header with current page */}
      <header className="fixed top-0 right-0 left-0 z-30 border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-sm lg:hidden">
        <div className="flex items-center justify-center">
          <h2 className="text-lg font-semibold text-gray-800">{currentPage}</h2>
        </div>
      </header>

      {/* Main content offset - for desktop */}
      <div
        className={`hidden transition-all duration-300 lg:block ${
          collapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      />
    </>
  );
}
