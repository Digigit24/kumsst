import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFeeCollection } from "@/api/clerkService";
import { useClerkFeesSWR, useClerkStudentsSWR, invalidateClerkFees } from "@/hooks/useClerkSWR";
import { Loader2, Plus, Receipt } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const ClerkFees = () => {
  const { results: fees, isLoading } = useClerkFeesSWR({ page_size: 50, ordering: "-created_at" });
  const { results: students } = useClerkStudentsSWR({ page_size: 200 });

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ student: "" as number | "", amount: "", fee_type: "tuition", remarks: "" });

  const handleCreate = async () => {
    if (!form.student || !form.amount) return;
    setSubmitting(true);
    try {
      await createFeeCollection({ student: Number(form.student), amount: form.amount, fee_type: form.fee_type, remarks: form.remarks });
      setForm({ student: "", amount: "", fee_type: "tuition", remarks: "" });
      setShowForm(false);
      toast.success("Fee entry added successfully");
      await invalidateClerkFees();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add fee entry");
    } finally {
      setSubmitting(false);
    }
  };

  const total = fees.reduce((s, f) => s + (Number(f.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Fees</h1><p className="text-sm text-gray-500">Total collected: <span className="font-semibold">{total.toLocaleString()}</span></p></div>
        {!showForm && <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4 mr-1" />Add Fee</Button>}
      </div>

      {showForm && (
        <Card className="border-indigo-200 bg-indigo-50/50">
          <CardHeader><CardTitle className="text-base">New Fee Entry</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Student *</Label>
                <select value={form.student} onChange={e => setForm(p => ({...p, student: e.target.value ? Number(e.target.value) : ""}))} className="w-full h-10 rounded-md border bg-white px-3 text-sm">
                  <option value="">Select student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} {s.roll_number ? `(${s.roll_number})` : ""}</option>)}
                </select>
              </div>
              <div className="space-y-1"><Label>Amount *</Label><Input type="number" min="0" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Fee Type</Label>
                <select value={form.fee_type} onChange={e => setForm(p => ({...p, fee_type: e.target.value}))} className="w-full h-10 rounded-md border bg-white px-3 text-sm">
                  <option value="tuition">Tuition</option><option value="exam">Exam</option><option value="library">Library</option><option value="hostel">Hostel</option><option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1"><Label>Remarks</Label><Input value={form.remarks} onChange={e => setForm(p => ({...p, remarks: e.target.value}))} /></div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={submitting || !form.student || !form.amount} className="bg-indigo-600 hover:bg-indigo-700">{submitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Add Fee</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div> : fees.length === 0 ? (
        <div className="text-center py-20 text-gray-500"><Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p className="text-lg font-medium">No fee entries</p></div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left"><tr><th className="px-4 py-3 font-medium">Student</th><th className="px-4 py-3 font-medium">Amount</th><th className="px-4 py-3 font-medium">Type</th><th className="px-4 py-3 font-medium">Date</th></tr></thead>
            <tbody className="divide-y">{fees.map(f => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{f.student_name || `#${f.student}`}</td>
                <td className="px-4 py-3 font-semibold">{Number(f.amount).toLocaleString()}</td>
                <td className="px-4 py-3 capitalize">{f.fee_type || "-"}</td>
                <td className="px-4 py-3 text-gray-500">{f.created_at ? new Date(f.created_at).toLocaleDateString() : "-"}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
};
