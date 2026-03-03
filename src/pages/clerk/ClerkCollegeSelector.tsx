import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useClerkCollegesSWR } from "@/hooks/useClerkSWR";
import type { College } from "@/types/core.types";
import { Building2, Loader2, LogOut } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const ClerkCollegeSelector = () => {
  const navigate = useNavigate();
  const { data: colleges, isLoading, error } = useClerkCollegesSWR();

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      navigate("/clerk/login", { replace: true });
    }
  }, [navigate]);

  const select = (c: College) => {
    localStorage.setItem("kumss_college_id", String(c.id));
    localStorage.setItem("clerk_college_name", c.name);
    navigate("/clerk/students", { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("kumss_user");
    localStorage.removeItem("kumss_college_id");
    localStorage.removeItem("clerk_college_name");
    navigate("/clerk/login", { replace: true });
  };

  const collegeList = colleges || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-white/60 backdrop-blur">
        <span className="font-semibold text-gray-900">Select College</span>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-1" />Logout
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center"><h1 className="text-2xl font-bold">Choose Your College</h1></div>

          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error.message || "Failed to load colleges"}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
            </div>
          )}

          {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {collegeList.map(c => (
                <Card key={c.id} className="cursor-pointer hover:shadow-lg hover:border-indigo-300 transition-all bg-white/80" onClick={() => select(c)}>
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center"><Building2 className="h-6 w-6 text-indigo-600" /></div>
                    <div><h3 className="font-semibold text-gray-900">{c.name}</h3>{c.code && <p className="text-sm text-gray-500">{c.code}</p>}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
