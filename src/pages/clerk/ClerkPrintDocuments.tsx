import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPrintDocument, updatePrintDocument, getPrintDocumentPdf } from "@/api/clerkService";
import { useClerkPrintDocumentsSWR, useClerkPrintTemplatesSWR, invalidateClerkPrintDocuments } from "@/hooks/useClerkSWR";
import type { PrintDocument, PrintTemplate } from "@/types/print.types";
import { AlertCircle, CheckCircle, Clock, Download, FileEdit, FileText, Loader2, Plus, Send, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";

const statusCfg: Record<string, { label: string; variant: "secondary" | "default" | "success" | "destructive" | "warning"; icon: LucideIcon }> = {
  draft: { label: "Draft", variant: "secondary", icon: FileEdit },
  pending_approval: { label: "Pending", variant: "default", icon: Clock },
  approved: { label: "Approved", variant: "success", icon: CheckCircle },
  rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
  printed: { label: "Printed", variant: "success", icon: CheckCircle },
  cancelled: { label: "Cancelled", variant: "secondary", icon: AlertCircle },
};

export const ClerkPrintDocuments = () => {
  const { results: docs, isLoading } = useClerkPrintDocumentsSWR({ page_size: 50, ordering: "-requested_at" });
  const { results: templates } = useClerkPrintTemplatesSWR({ page_size: 100 });

  const [step, setStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<PrintTemplate | null>(null);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [docTitle, setDocTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pickTemplate = (t: PrintTemplate) => {
    setSelectedTemplate(t);
    const vars: Record<string, string> = {};
    if (t.available_variables) { t.available_variables.forEach((v) => { vars[v.key] = v.sample_value || ""; }); }
    const matches = (t.content || "").match(/\{\{(\w+)\}\}/g);
    if (matches) { matches.forEach((m: string) => { const key = m.replace(/\{\{|\}\}/g, ""); if (!vars[key]) vars[key] = ""; }); }
    setPlaceholderValues(vars);
    setDocTitle(`${t.name} - ${new Date().toLocaleDateString()}`);
    setStep(2);
  };

  const handleCreate = async () => {
    if (!selectedTemplate) return;
    setSubmitting(true);
    try {
      await createPrintDocument({ template: selectedTemplate.id, title: docTitle, context_data: placeholderValues, status: "draft" });
      setStep(0); setSelectedTemplate(null); setPlaceholderValues({});
      toast.success("Document created as draft");
      await invalidateClerkPrintDocuments();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create document");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForApproval = async (doc: PrintDocument) => {
    try {
      await updatePrintDocument(doc.id, { status: "pending_approval" });
      toast.success("Submitted for approval");
      await invalidateClerkPrintDocuments();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit for approval");
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>;

  if (step === 1) return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Step 1: Pick a Template</h1><Button variant="outline" onClick={() => setStep(0)}>Cancel</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {templates.map(t => (
          <Card key={t.id} className="cursor-pointer hover:shadow-lg hover:border-indigo-300 transition-all" onClick={() => pickTemplate(t)}>
            <CardContent className="p-4"><h3 className="font-semibold text-gray-900">{t.name}</h3><p className="text-xs text-gray-500 mt-1">{t.code}</p>{t.description && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{t.description}</p>}</CardContent>
          </Card>
        ))}
        {templates.length === 0 && <p className="col-span-full text-center text-gray-500 py-12">No templates available. Create one first.</p>}
      </div>
    </div>
  );

  if (step === 2 && selectedTemplate) {
    const keys = Object.keys(placeholderValues);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Step 2: Fill in Details</h1><Button variant="outline" onClick={() => setStep(0)}>Cancel</Button></div>
        <Card className="border-indigo-200 bg-indigo-50/50">
          <CardHeader><CardTitle className="text-base">Template: {selectedTemplate.name}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1"><Label>Document Title</Label><Input value={docTitle} onChange={e => setDocTitle(e.target.value)} /></div>
            {keys.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {keys.map(k => (
                  <div key={k} className="space-y-1">
                    <Label className="capitalize">{k.replace(/_/g, " ")}</Label>
                    <Input value={placeholderValues[k]} onChange={e => setPlaceholderValues(p => ({...p, [k]: e.target.value}))} placeholder={`Enter ${k.replace(/_/g, " ")}`} />
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-500">No placeholders found in this template.</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleCreate} disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700">{submitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Create as Draft</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Print Documents</h1>
        <Button onClick={() => setStep(1)} className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4 mr-1" />New Document</Button>
      </div>

      {docs.length === 0 ? (
        <div className="text-center py-20 text-gray-500"><FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p className="text-lg font-medium">No documents yet</p><p className="text-sm">Create a new document from a template.</p></div>
      ) : (
        <div className="space-y-3">
          {docs.map(doc => {
            const cfg = statusCfg[doc.status] || statusCfg.draft;
            const Icon = cfg.icon;
            const canSubmit = doc.status === "draft";
            const canDownload = doc.status === "approved" || doc.status === "printed";
            return (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">{doc.title || doc.reference_number}</h3>
                        <Badge variant={cfg.variant}><Icon className="h-3 w-3 mr-1" />{cfg.label}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">{doc.template_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{doc.requested_at ? new Date(doc.requested_at).toLocaleDateString() : ""}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {canSubmit && <Button size="sm" onClick={() => handleSubmitForApproval(doc)} className="bg-indigo-600 hover:bg-indigo-700"><Send className="h-3.5 w-3.5 mr-1" />Submit for Approval</Button>}
                      {canDownload && <a href={getPrintDocumentPdf(doc.id)} target="_blank" rel="noreferrer"><Button size="sm" variant="outline"><Download className="h-3.5 w-3.5 mr-1" />Download PDF</Button></a>}
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
