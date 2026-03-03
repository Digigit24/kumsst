import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { constructionExpensesApi } from "@/api/constructionService";
import { useExpensesSWR, useProjectsSWR, invalidateExpenses } from "@/hooks/useConstructionSWR";
import type { ExpenseCategory } from "@/types/construction.types";
import { DollarSign, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const expenseCategories: { value: ExpenseCategory; label: string }[] = [
  { value: "materials", label: "Material" },
  { value: "logistics", label: "Transport" },
  { value: "labour", label: "Labour" },
  { value: "equipment", label: "Equipment" },
  { value: "other", label: "Misc" },
];

const categoryBadge: Record<string, "default" | "secondary" | "warning" | "success" | "info"> = {
  materials: "default",
  logistics: "warning",
  labour: "secondary",
  equipment: "info",
  other: "secondary",
};

export const Expenses = () => {
  const { results: expenses, isLoading } = useExpensesSWR({ page_size: 50, ordering: "-expense_date" });
  const { results: projects } = useProjectsSWR({ page_size: 50 });

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedProject, setSelectedProject] = useState<number | "">("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("materials");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);

  const handleCreate = async () => {
    if (!selectedProject || !amount || !description.trim()) return;
    setSubmitting(true);
    try {
      await constructionExpensesApi.create({
        project: Number(selectedProject),
        amount,
        category,
        description,
        expense_date: expenseDate,
      });
      toast.success("Expense added");
      resetForm();
      await invalidateExpenses();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedProject("");
    setAmount("");
    setCategory("materials");
    setDescription("");
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  const totalExpenses = expenses.reduce(
    (sum, e) => sum + (typeof e.amount === "number" ? e.amount : Number(e.amount) || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total: <span className="font-semibold text-gray-700">{totalExpenses.toLocaleString()}</span>
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-700">
            <Plus className="h-4 w-4 mr-1" />
            Add Expense
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-base">New Expense</CardTitle>
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
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 5000"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
                >
                  {expenseCategories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What was this expense for?"
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
                disabled={submitting || !selectedProject || !amount || !description.trim()}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Add Expense
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {expenses.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No expenses recorded</p>
          <p className="text-sm">Add your first expense entry.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <Card key={expense.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {expense.project_name || `Project #${expense.project}`}
                      </h3>
                      <Badge variant={categoryBadge[expense.category] || "secondary"} className="capitalize">
                        {expense.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1">{expense.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-lg font-bold text-gray-900">
                      {Number(expense.amount).toLocaleString()}
                    </p>
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
