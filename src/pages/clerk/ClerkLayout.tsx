import { cn } from "@/lib/utils";
import { Building2, FileText, GraduationCap, LogOut, Menu, Megaphone, Printer, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const nav = [
  { to: "/clerk/students", label: "Students", icon: GraduationCap },
  { to: "/clerk/fees", label: "Fees", icon: Receipt },
  { to: "/clerk/print-templates", label: "Print Templates", icon: Printer },
  { to: "/clerk/print-documents", label: "Print Documents", icon: FileText },
  { to: "/clerk/communication", label: "Communication", icon: Megaphone },
];

export const ClerkLayout = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const collegeName = localStorage.getItem("clerk_college_name") || "College";
  const userStr = localStorage.getItem("kumss_user");
  const user = userStr ? JSON.parse(userStr) : null;

  const logout = () => { localStorage.removeItem("access_token"); localStorage.removeItem("refresh_token"); localStorage.removeItem("kumss_user"); localStorage.removeItem("kumss_college_id"); localStorage.removeItem("clerk_college_name"); navigate("/clerk/login", { replace: true }); };

  const token = localStorage.getItem("access_token");
  const collegeId = localStorage.getItem("kumss_college_id");

  useEffect(() => {
    if (!token) {
      navigate("/clerk/login", { replace: true });
    } else if (!collegeId) {
      navigate("/clerk/select-college", { replace: true });
    }
  }, [token, collegeId, navigate]);

  if (!token || !collegeId) return null;

  const Sidebar = ({ onNav }: { onNav?: () => void }) => (
    <div className="flex flex-col h-full w-64 bg-white border-r">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center"><FileText className="h-5 w-5 text-indigo-600" /></div>
          <div><h2 className="text-sm font-bold text-gray-900">Clerk Portal</h2>
            <button onClick={() => { localStorage.removeItem("kumss_college_id"); navigate("/clerk/select-college"); }} className="text-xs text-indigo-600 hover:underline">{collegeName}</button>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map(n => (
          <NavLink key={n.to} to={n.to} onClick={onNav} className={({ isActive }) => cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all", isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50")}>
            <n.icon className="h-4 w-4" /><span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t">
        {user && <div className="px-3 py-2 mb-2"><p className="text-sm font-medium truncate">{user.first_name} {user.last_name}</p><p className="text-xs text-gray-500 truncate">{user.username}</p></div>}
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 w-full"><LogOut className="h-4 w-4" />Sign Out</button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="hidden lg:block"><Sidebar /></div>
      {open && <><div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} /><div className="fixed inset-y-0 left-0 z-50 lg:hidden"><Sidebar onNav={() => setOpen(false)} /></div></>}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b lg:px-6">
          <button onClick={() => setOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100 lg:hidden"><Menu className="h-5 w-5" /></button>
          <h1 className="text-lg font-semibold text-gray-900 hidden lg:block">Clerk Dashboard</h1>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg"><Building2 className="h-4 w-4 text-indigo-600" /><span className="text-sm font-medium text-indigo-700">{collegeName}</span></div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6"><Outlet /></main>
      </div>
    </div>
  );
};
