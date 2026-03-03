import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectsSWR } from "@/hooks/useConstructionSWR";
import { Building2, Loader2, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  planning: "secondary",
  in_progress: "default",
  on_hold: "warning",
  completed: "success",
  cancelled: "destructive",
};

const statusLabel: Record<string, string> = {
  planning: "Planning",
  in_progress: "In Progress",
  on_hold: "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const MyProjects = () => {
  const { results: projects, isLoading, error, refresh } = useProjectsSWR({ page_size: 50 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error.message || "Failed to load projects"}</p>
        <Button onClick={() => refresh()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
          <p className="text-sm text-gray-500 mt-1">
            {projects.length} assigned project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refresh()}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No projects assigned</p>
          <p className="text-sm">Projects assigned to you will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold leading-tight">
                    {project.project_name}
                  </CardTitle>
                  <Badge variant={statusVariant[project.status] || "secondary"}>
                    {statusLabel[project.status] || project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.location_address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span className="line-clamp-2">{project.location_address}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-semibold text-gray-900">
                      {project.progress_percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${project.progress_percentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t">
                  <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                  {project.expected_end_date && (
                    <span>
                      Due: {new Date(project.expected_end_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
