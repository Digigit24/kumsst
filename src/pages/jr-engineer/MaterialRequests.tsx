import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { materialRequestsApi } from "@/api/constructionService";
import { useMaterialRequestsSWR, useProjectsSWR, invalidateMaterialRequests } from "@/hooks/useConstructionSWR";
import type {
  MaterialRequest,
  MaterialRequestPriority,
} from "@/types/construction.types";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Package,
  Plus,
  Send,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";

const statusConfig: Record<
  string,
  { label: string; variant: "secondary" | "default" | "success" | "destructive"; icon: LucideIcon }
> = {
  draft: { label: "Draft", variant: "secondary", icon: AlertCircle },
  submitted: { label: "Pending", variant: "default", icon: Clock },
  approved: { label: "Approved", variant: "success", icon: CheckCircle },
  rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
};

const priorities: { value: MaterialRequestPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export const MaterialRequests = () => {
  const { results: requests, isLoading } = useMaterialRequestsSWR({ page_size: 50, ordering: "-created_at" });
  const { results: projects } = useProjectsSWR({ page_size: 50 });

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedProject, setSelectedProject] = useState<number | "">("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [urgency, setUrgency] = useState<MaterialRequestPriority>("medium");
  const [justification, setJustification] = useState("");

  const handleCreate = async () => {
    if (!selectedProject || !itemName.trim() || !quantity) return;
    setSubmitting(true);
    try {
      await materialRequestsApi.create({
        project: Number(selectedProject),
        priority: urgency,
        justification: justification || `Request for ${itemName}`,
        items: [
          {
            item_name: itemName,
            quantity,
            unit: "pcs",
          },
        ],
      });
      toast.success("Material request created");
      resetForm();
      await invalidateMaterialRequests();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (req: MaterialRequest) => {
    try {
      await materialRequestsApi.submit(req.id);
      toast.success("Request submitted for approval");
      await invalidateMaterialRequests();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit request");
    }
  };

  const resetForm = () => {
    setSelectedProject("");
    setItemName("");
    setQuantity("");
    setUrgency("medium");
    setJustification("");
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
          <h1 className="text-2xl font-bold text-gray-900">Material Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            Request materials for your projects
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-700">
            <Plus className="h-4 w-4 mr-1" />
            New Request
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-base">New Material Request</CardTitle>
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
                <Label>Urgency</Label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as MaterialRequestPriority)}
                  className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
                >
                  {priorities.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Cement bags"
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Justification</Label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Why is this material needed?"
                rows={2}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={submitting || !selectedProject || !itemName.trim() || !quantity}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Create Request
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No material requests</p>
          <p className="text-sm">Create your first material request.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const config = statusConfig[req.status] || statusConfig.draft;
            const StatusIcon = config.icon;
            const canSubmit = req.status === "draft";

            return (
              <Card key={req.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {req.project_name || `Project #${req.project}`}
                        </h3>
                        <Badge variant={config.variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                        <Badge variant="secondary" className="capitalize text-xs">
                          {req.priority}
                        </Badge>
                      </div>

                      {req.items && req.items.length > 0 && (
                        <div className="text-sm text-gray-600">
                          {req.items.map((item, i) => (
                            <span key={i}>
                              {item.item_name} x{item.quantity}
                              {i < req.items.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(req.created_at).toLocaleDateString()}
                      </p>

                      {req.status === "rejected" && req.rejection_reason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                          <span className="font-medium">Rejection reason:</span>{" "}
                          {req.rejection_reason}
                        </div>
                      )}
                    </div>

                    {canSubmit && (
                      <Button
                        size="sm"
                        onClick={() => handleSubmit(req)}
                        className="bg-amber-600 hover:bg-amber-700 flex-shrink-0"
                      >
                        <Send className="h-3.5 w-3.5 mr-1" />
                        Submit
                      </Button>
                    )}
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
