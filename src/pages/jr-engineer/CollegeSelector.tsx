import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { College } from "@/types/core.types";
import { useCollegesSWR } from "@/hooks/useConstructionSWR";
import { Building2, Loader2, LogOut } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const CollegeSelector = () => {
  const navigate = useNavigate();
  const { data: colleges = [], isLoading: loading, error, refresh } = useCollegesSWR();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/jr-engineer/login", { replace: true });
    }
  }, [navigate]);

  const selectCollege = (college: College) => {
    localStorage.setItem("kumss_college_id", String(college.id));
    localStorage.setItem("jr_selected_college_name", college.name);
    navigate("/jr-engineer/projects", { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("kumss_user");
    localStorage.removeItem("kumss_college_id");
    localStorage.removeItem("jr_selected_college_name");
    navigate("/jr-engineer/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-white/60 backdrop-blur">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-amber-600" />
          <span className="font-semibold text-gray-900">Select College</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500">
          <LogOut className="h-4 w-4 mr-1" />
          Logout
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Choose Your College</h1>
            <p className="text-gray-500">Select the college you want to work with</p>
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error.message || "Failed to load colleges"}</p>
              <Button onClick={() => refresh()} variant="outline">
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && colleges.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No colleges available. Contact your administrator.
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {colleges.map((college) => (
                <Card
                  key={college.id}
                  className="cursor-pointer hover:shadow-lg hover:border-amber-300 transition-all duration-200 bg-white/80 backdrop-blur"
                  onClick={() => selectCollege(college)}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {college.name}
                      </h3>
                      {college.code && (
                        <p className="text-sm text-gray-500">{college.code}</p>
                      )}
                    </div>
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
