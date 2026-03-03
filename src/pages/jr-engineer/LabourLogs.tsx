import { dailyReportsApi } from "@/api/constructionService";
import { useLabourLogsSWR, useProjectsSWR, invalidateLabourLogs } from "@/hooks/useConstructionSWR";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LabourCategory } from "@/types/construction.types";
import { Loader2, Plus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const categories: { value: LabourCategory; label: string }[] = [
  { value: "mason", label: "Mason" },
  { value: "carpenter", label: "Carpenter" },
  { value: "electrician", label: "Electrician" },
  { value: "plumber", label: "Plumber" },
  { value: "painter", label: "Painter" },
  { value: "welder", label: "Welder" },
  { value: "helper", label: "Helper" },
  { value: "supervisor", label: "Supervisor" },
  { value: "other", label: "Other" },
];

export const LabourLogs = () => {
  const { results: logs, isLoading } = useLabourLogsSWR({ page_size: 100 });
  const { results: projects } = useProjectsSWR({ page_size: 50 });

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedProject, setSelectedProject] = useState<number | "">("");
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [workerCount, setWorkerCount] = useState("");
  const [hours, setHours] = useState("8");
  const [category, setCategory] = useState<LabourCategory>("mason");

  const handleCreate = async () => {
    if (!selectedProject || !workerCount) return;
    setSubmitting(true);
    try {
      await dailyReportsApi.create({
        project: Number(selectedProject),
        report_date: logDate,
        work_summary: `Labour log: ${workerCount} ${category} workers, ${hours} hours`,
        labour_count_skilled: category !== "helper" && category !== "other" ? Number(workerCount) : 0,
        labour_count_unskilled: category === "helper" || category === "other" ? Number(workerCount) : 0,
        labour_logs: [
          {
            labour_category: category,
            count: Number(workerCount),
            hours_worked: hours,
            wage_per_day: "0",
          },
        ],
      });
      toast.success("Labour log added");
      resetForm();
      await invalidateLabourLogs();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add labour log");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedProject("");
    setLogDate(new Date().toISOString().split("T")[0]);
    setWorkerCount("");
    setHours("8");
    setCategory("mason");
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Labour Logs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track worker attendance and hours per project
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-700">
            <Plus className="h-4 w-4 mr-1" />
            Add Log
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-base">New Labour Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project</Label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value ? Number(e.target.value) : "")}
                  className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
                >
                  <option value="">Select project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.project_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as LabourCategory)}
                  className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Worker Count</Label>
                <Input
                  type="number"
                  min="1"
                  value={workerCount}
                  onChange={(e) => setWorkerCount(e.target.value)}
                  placeholder="e.g. 5"
                />
              </div>
              <div className="space-y-2">
                <Label>Hours</Label>
                <Input
                  type="number"
                  min="1"
                  max="24"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="e.g. 8"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={submitting || !selectedProject || !workerCount}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Add Log
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {logs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No labour logs yet</p>
          <p className="text-sm">Add your first labour log entry.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log, idx) => (
            <Card key={log.id || idx}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {log.project_name || `Project #${log.project}`}
                      </h3>
                      <Badge variant="secondary" className="capitalize">
                        {log.labour_category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{log.count} workers</span>
                      <span>{log.hours_worked} hrs</span>
                      {log.date && (
                        <span className="text-gray-400">
                          {new Date(log.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
