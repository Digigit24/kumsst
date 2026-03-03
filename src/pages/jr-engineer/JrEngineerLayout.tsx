import { cn } from "@/lib/utils";
import {
  Building2,
  Camera,
  ClipboardList,
  DollarSign,
  FolderOpen,
  HardHat,
  LogOut,
  Menu,
  Package,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/jr-engineer/projects", label: "My Projects", icon: FolderOpen },
  { to: "/jr-engineer/daily-reports", label: "Daily Reports", icon: ClipboardList },
  { to: "/jr-engineer/photos", label: "Photo Upload", icon: Camera },
  { to: "/jr-engineer/labour-logs", label: "Labour Logs", icon: Users },
  { to: "/jr-engineer/expenses", label: "Expenses", icon: DollarSign },
  { to: "/jr-engineer/material-requests", label: "Material Requests", icon: Package },
];

export const JrEngineerLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const collegeName = localStorage.getItem("jr_selected_college_name") || "College";
  const userStr = localStorage.getItem("kumss_user");
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("kumss_user");
    localStorage.removeItem("kumss_college_id");
    localStorage.removeItem("jr_selected_college_name");
    localStorage.removeItem("jr_accessible_colleges");
    localStorage.removeItem("jr_tenant_ids");
    navigate("/jr-engineer/login", { replace: true });
  };

  const handleChangeCollege = () => {
    localStorage.removeItem("kumss_college_id");
    localStorage.removeItem("jr_selected_college_name");
    navigate("/jr-engineer/select-college", { replace: true });
  };

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-col h-full w-64 bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <HardHat className="h-5 w-5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gray-900 truncate">Jr Engineer</h2>
            <button
              onClick={handleChangeCollege}
              className="text-xs text-amber-600 hover:text-amber-700 truncate block"
            >
              {collegeName}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-amber-50 text-amber-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )
            }
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-gray-100">
        {user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.username}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all w-full"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  // Check auth via useEffect to avoid calling navigate() during render
  const token = localStorage.getItem("access_token");
  const collegeId = localStorage.getItem("kumss_college_id");

  useEffect(() => {
    if (!token) {
      navigate("/jr-engineer/login", { replace: true });
    } else if (!collegeId) {
      navigate("/jr-engineer/select-college", { replace: true });
    }
  }, [token, collegeId, navigate]);

  if (!token || !collegeId) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <HardHat className="h-5 w-5 text-amber-600" />
            <span className="font-semibold text-gray-900 text-sm">Jr Engineer</span>
          </div>
          <div className="w-8" />
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Jr Engineer Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg">
              <Building2 className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">{collegeName}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
