import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dailyReportsApi } from "@/api/constructionService";
import { useDailyReportsSWR, useProjectsSWR, invalidateDailyReports } from "@/hooks/useConstructionSWR";
import type {
  DailyReport,
  DailyReportCreateInput,
  DailyReportStatus,
} from "@/types/construction.types";
import {
  AlertCircle,
  CheckCircle,
  ClipboardList,
  Clock,
  FileEdit,
  Loader2,
  Plus,
  Send,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";

const statusConfig: Record<
  DailyReportStatus,
  { label: string; variant: "secondary" | "default" | "success" | "destructive" | "warning"; icon: LucideIcon }
> = {
  draft: { label: "Draft", variant: "secondary", icon: FileEdit },
  submitted: { label: "Submitted", variant: "default", icon: Clock },
  approved: { label: "Approved", variant: "success", icon: CheckCircle },
  rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
  revision_requested: { label: "Revision", variant: "warning", icon: AlertCircle },
};

export const DailyReports = () => {
  const { results: reports, isLoading } = useDailyReportsSWR({ page_size: 50, ordering: "-report_date" });
  const { results: projects } = useProjectsSWR({ page_size: 50 });

  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [selectedProject, setSelectedProject] = useState<number | "">("");
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0]);
  const [workDone, setWorkDone] = useState("");
  const [remarks, setRemarks] = useState("");

  const resetForm = () => {
    setSelectedProject("");
    setReportDate(new Date().toISOString().split("T")[0]);
    setWorkDone("");
    setRemarks("");
    setEditingReport(null);
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!selectedProject || !workDone.trim()) return;
    setSubmitting(true);
    try {
      const payload: DailyReportCreateInput = {
        project: Number(selectedProject),
        report_date: reportDate,
        work_summary: workDone,
        issues_or_delays: remarks || undefined,
      };
      await dailyReportsApi.create(payload);
      toast.success("Report created as draft");
      resetForm();
      await invalidateDailyReports();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create report");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingReport || !workDone.trim()) return;
    setSubmitting(true);
    try {
      await dailyReportsApi.patch(editingReport.id, {
        work_summary: workDone,
        issues_or_delays: remarks || undefined,
      });
      toast.success("Report updated");
      resetForm();
      await invalidateDailyReports();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update report");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (report: DailyReport) => {
    try {
      await dailyReportsApi.submit(report.id);
      toast.success("Report submitted for approval");
      await invalidateDailyReports();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit report");
    }
  };

  const startEdit = (report: DailyReport) => {
    setEditingReport(report);
    setSelectedProject(report.project);
    setReportDate(report.report_date);
    setWorkDone(report.work_summary || "");
    setRemarks(report.issues_or_delays || "");
    setShowForm(true);
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
          <h1 className="text-2xl font-bold text-gray-900">Daily Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and submit daily work reports
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-700">
            <Plus className="h-4 w-4 mr-1" />
            New Report
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-base">
              {editingReport ? "Edit Daily Report" : "New Daily Report"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project</Label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value ? Number(e.target.value) : "")}
                  disabled={!!editingReport}
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
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  disabled={!!editingReport}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Work Done *</Label>
              <textarea
                value={workDone}
                onChange={(e) => setWorkDone(e.target.value)}
                placeholder="Describe the work done today..."
                rows={4}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-2">
              <Label>Remarks / Issues</Label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Any issues or delays (optional)..."
                rows={2}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                onClick={editingReport ? handleUpdate : handleCreate}
                disabled={submitting || !selectedProject || !workDone.trim()}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : null}
                {editingReport ? "Update" : "Create as Draft"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {reports.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No reports yet</p>
          <p className="text-sm">Create your first daily report to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const config = statusConfig[report.status] || statusConfig.draft;
            const StatusIcon = config.icon;
            const canEdit = report.status === "draft" || report.status === "rejected" || report.status === "revision_requested";
            const canSubmit = report.status === "draft" || report.status === "rejected" || report.status === "revision_requested";

            return (
              <Card key={report.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {report.project_name || `Project #${report.project}`}
                        </h3>
                        <Badge variant={config.variant} className="flex-shrink-0">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {report.work_summary}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(report.report_date).toLocaleDateString()}
                      </p>

                      {report.status === "rejected" && report.rejection_reason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                          <span className="font-medium">Rejection reason:</span>{" "}
                          {report.rejection_reason}
                        </div>
                      )}
                      {report.status === "revision_requested" && report.ceo_remarks && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded-lg text-sm text-yellow-700">
                          <span className="font-medium">Revision note:</span>{" "}
                          {report.ceo_remarks}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(report)}
                        >
                          <FileEdit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                      )}
                      {canSubmit && (
                        <Button
                          size="sm"
                          onClick={() => handleSubmit(report)}
                          className="bg-amber-600 hover:bg-amber-700"
                        >
                          <Send className="h-3.5 w-3.5 mr-1" />
                          Submit
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
