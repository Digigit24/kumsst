import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPrintTemplate, updatePrintTemplate } from "@/api/clerkService";
import { useClerkPrintTemplatesSWR, invalidateClerkPrintTemplates } from "@/hooks/useClerkSWR";
import type { PrintTemplate } from "@/types/print.types";
import { FileEdit, Loader2, Plus, Printer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const ClerkPrintTemplates = () => {
  const { results: templates, isLoading } = useClerkPrintTemplatesSWR({ page_size: 50 });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PrintTemplate | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", content: "", description: "" });

  const resetForm = () => { setForm({ name: "", code: "", content: "", description: "" }); setEditing(null); setShowForm(false); };

  const startEdit = (t: PrintTemplate) => { setEditing(t); setForm({ name: t.name, code: t.code, content: t.content || "", description: t.description || "" }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name || !form.content) return;
    setSubmitting(true);
    try {
      const payload = { ...form, category: editing?.category || 1 };
      if (editing) { await updatePrintTemplate(editing.id, payload); toast.success("Template updated"); } else { await createPrintTemplate(payload); toast.success("Template created"); }
      resetForm();
      await invalidateClerkPrintTemplates();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Print Templates</h1>
        {!showForm && <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4 mr-1" />New Template</Button>}
      </div>

      {showForm && (
        <Card className="border-indigo-200 bg-indigo-50/50">
          <CardHeader><CardTitle className="text-base">{editing ? "Edit Template" : "New Template"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Transfer Certificate" /></div>
              <div className="space-y-1"><Label>Code *</Label><Input value={form.code} onChange={e => setForm(p => ({...p, code: e.target.value}))} placeholder="e.g. TC-001" /></div>
            </div>
            <div className="space-y-1"><Label>Description</Label><Input value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} /></div>
            <div className="space-y-1">
              <Label>Content (use {"{{placeholders}}"}) *</Label>
              <textarea value={form.content} onChange={e => setForm(p => ({...p, content: e.target.value}))} rows={8} placeholder={"This is to certify that {{student_name}}, Roll No {{roll_number}}, has been a student of this institution from {{from_date}} to {{to_date}}."} className="w-full rounded-md border bg-white px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <p className="text-xs text-gray-400">Available: {"{{student_name}}, {{roll_number}}, {{date}}, {{college_name}}"}, etc.</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSave} disabled={submitting || !form.name || !form.content} className="bg-indigo-600 hover:bg-indigo-700">{submitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}{editing ? "Update" : "Create"}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div> : templates.length === 0 ? (
        <div className="text-center py-20 text-gray-500"><Printer className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p className="text-lg font-medium">No templates yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map(t => (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div><h3 className="font-semibold text-gray-900">{t.name}</h3><p className="text-xs text-gray-500">{t.code}</p></div>
                  <Badge variant={t.status === "active" ? "success" : "secondary"}>{t.status || "draft"}</Badge>
                </div>
                {t.description && <p className="text-sm text-gray-600 line-clamp-2 mb-3">{t.description}</p>}
                <Button variant="outline" size="sm" onClick={() => startEdit(t)}><FileEdit className="h-3.5 w-3.5 mr-1" />Edit</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
