import { createNotice } from "@/api/clerkService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { invalidateClerkNotices, useClerkNoticesSWR } from "@/hooks/useClerkSWR";
import { Loader2, Megaphone, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const ClerkCommunication = () => {
  const { results: notices, isLoading } = useClerkNoticesSWR({ page_size: 50, ordering: "-created_at" });

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", notice_type: "general", publish_date: new Date().toISOString().split('T')[0], expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] });

  const handleCreate = async () => {
    if (!form.title || !form.content) return;
    setSubmitting(true);
    try {
      await createNotice(form);
      setForm({ title: "", content: "", notice_type: "general", publish_date: new Date().toISOString().split('T')[0], expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] });
      setShowForm(false);
      toast.success("Notice created successfully");
      await invalidateClerkNotices();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create notice");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Communication</h1>
        {!showForm && <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4 mr-1" />New Notice</Button>}
      </div>

      {showForm && (
        <Card className="border-indigo-200 bg-indigo-50/50">
          <CardHeader><CardTitle className="text-base">New Notice</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Notice title" /></div>
              <div className="space-y-1"><Label>Type</Label>
                <select value={form.notice_type} onChange={e => setForm(p => ({ ...p, notice_type: e.target.value }))} className="w-full h-10 rounded-md border bg-white px-3 text-sm">
                  <option value="general">General</option><option value="academic">Academic</option><option value="exam">Exam</option><option value="fee">Fee</option><option value="event">Event</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Publish Date</Label><Input type="date" value={form.publish_date} onChange={e => setForm(p => ({ ...p, publish_date: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Expiry Date</Label><Input type="date" value={form.expiry_date} onChange={e => setForm(p => ({ ...p, expiry_date: e.target.value }))} /></div>
            </div>
            <div className="space-y-1"><Label>Content *</Label>
              <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={4} placeholder="Notice content..." className="w-full rounded-md border bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={submitting || !form.title || !form.content} className="bg-indigo-600 hover:bg-indigo-700">{submitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Create Notice</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div> : notices.length === 0 ? (
        <div className="text-center py-20 text-gray-500"><Megaphone className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p className="text-lg font-medium">No notices yet</p></div>
      ) : (
        <div className="space-y-3">
          {notices.map(n => (
            <Card key={n.id}>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900">{n.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-3">{n.content}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                  <span className="capitalize">{n.notice_type || "general"}</span>
                  <span>{n.created_at ? new Date(n.created_at).toLocaleDateString() : ""}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
