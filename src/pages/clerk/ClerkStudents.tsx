import { createStudent, updateStudent } from "@/api/clerkService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { invalidateClerkStudents, useClerkStudentsSWR } from "@/hooks/useClerkSWR";
import { DEBOUNCE_DELAYS, useDebounce } from "@/hooks/useDebounce";
import type { Student } from "@/types/students.types";
import { GraduationCap, Loader2, Plus, Search, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const ClerkStudents = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, DEBOUNCE_DELAYS.SEARCH);
  const { results: students, isLoading } = useClerkStudentsSWR({ page_size: 50, search: debouncedSearch || undefined });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", roll_number: "", phone: "" });

  const resetForm = () => { setForm({ first_name: "", last_name: "", email: "", roll_number: "", phone: "" }); setEditing(null); setShowForm(false); };

  const startEdit = (s: Student) => { setEditing(s); setForm({ first_name: s.first_name || "", last_name: s.last_name || "", email: s.email || "", roll_number: s.roll_number || "", phone: s.phone || "" }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.first_name || !form.last_name) return;
    setSubmitting(true);
    try {
      const payload: any = {
        ...form,
        user: 1,
        college: 1,
        admission_number: `ADM-${Date.now()}`,
        admission_date: new Date().toISOString().split('T')[0],
        admission_type: "regular",
        registration_number: `REG-${Date.now()}`,
        program: 1,
        academic_year: 1,
        date_of_birth: "2000-01-01",
        gender: "other",
      };

      if (editing) { await updateStudent(editing.id, payload); toast.success("Student updated"); } else { await createStudent(payload); toast.success("Student created"); }
      resetForm();
      await invalidateClerkStudents();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save student");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, roll no..." className="pl-9 w-60" />
          </div>
          {!showForm && <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4 mr-1" />Add Student</Button>}
        </div>
      </div>

      {showForm && (
        <Card className="border-indigo-200 bg-indigo-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">{editing ? "Edit Student" : "New Student"}</CardTitle>
            <button onClick={resetForm}><X className="h-4 w-4 text-gray-400" /></button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1"><Label>First Name *</Label><Input value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Last Name *</Label><Input value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Roll No</Label><Input value={form.roll_number} onChange={e => setForm(p => ({ ...p, roll_number: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSave} disabled={submitting || !form.first_name || !form.last_name} className="bg-indigo-600 hover:bg-indigo-700">
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}{editing ? "Update" : "Create"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div> : students.length === 0 ? (
        <div className="text-center py-20 text-gray-500"><GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p className="text-lg font-medium">No students found</p></div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left"><tr>
              <th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Roll No</th><th className="px-4 py-3 font-medium">Email</th><th className="px-4 py-3 font-medium">Phone</th><th className="px-4 py-3 font-medium">Actions</th>
            </tr></thead>
            <tbody className="divide-y">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.first_name} {s.last_name}</td>
                  <td className="px-4 py-3">{s.roll_number || "-"}</td>
                  <td className="px-4 py-3 text-gray-500">{s.email || "-"}</td>
                  <td className="px-4 py-3 text-gray-500">{s.phone || "-"}</td>
                  <td className="px-4 py-3"><Button variant="outline" size="sm" onClick={() => startEdit(s)}>Edit</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
