/**
 * Print Job Form Component
 */

import { useState, useEffect } from 'react';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Printer } from 'lucide-react';

interface PrintJobFormProps {
  printJob?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const PrintJobForm = ({ printJob, onSubmit, onCancel, isSubmitting = false }: PrintJobFormProps) => {
  const [formData, setFormData] = useState<any>({
    job_name: '',
    file: '',
    pages: 1,
    copies: 1,
    paper_size: 'A4',
    color_type: 'black_white',
    per_page_cost: '3.00',
    total_amount: '3.00',
    submission_date: new Date().toISOString().split('T')[0],
    completion_date: '',
    status: 'pending',
    remarks: '',
    teacher: null,
    is_active: true,
  });

  useEffect(() => {
    if (printJob) {
      setFormData({
        job_name: printJob.job_name || '',
        file: printJob.file || '',
        pages: printJob.pages || 1,
        copies: printJob.copies || 1,
        paper_size: printJob.paper_size || 'A4',
        color_type: printJob.color_type || 'black_white',
        per_page_cost: printJob.per_page_cost || '3.00',
        total_amount: printJob.total_amount || '3.00',
        submission_date: printJob.submission_date || new Date().toISOString().split('T')[0],
        completion_date: printJob.completion_date || '',
        status: printJob.status || 'pending',
        remarks: printJob.remarks || '',
        teacher: printJob.teacher || null,
        is_active: printJob.is_active ?? true,
      });
    }
  }, [printJob]);

  // Calculate total amount when relevant fields change
  useEffect(() => {
    const pages = parseInt(formData.pages) || 0;
    const copies = parseInt(formData.copies) || 0;
    const perPageCost = parseFloat(formData.per_page_cost) || 0;
    const totalSheets = pages * copies;
    const totalAmount = (totalSheets * perPageCost).toFixed(2);

    setFormData((prev: any) => ({
      ...prev,
      total_amount: totalAmount,
    }));
  }, [formData.pages, formData.copies, formData.per_page_cost]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="job_name">Job Name *</Label>
        <Input
          id="job_name"
          placeholder="e.g., Final Exam - Mathematics"
          value={formData.job_name}
          onChange={(e) => setFormData({ ...formData, job_name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="file">File Path/Name</Label>
        <Input
          id="file"
          placeholder="e.g., documents/exam-paper.pdf"
          value={formData.file}
          onChange={(e) => setFormData({ ...formData, file: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pages">Number of Pages *</Label>
          <Input
            id="pages"
            type="number"
            min="1"
            placeholder="e.g., 8"
            value={formData.pages}
            onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) || 1 })}
            required
          />
        </div>

        <div>
          <Label htmlFor="copies">Number of Copies *</Label>
          <Input
            id="copies"
            type="number"
            min="1"
            placeholder="e.g., 100"
            value={formData.copies}
            onChange={(e) => setFormData({ ...formData, copies: parseInt(e.target.value) || 1 })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="paper_size">Paper Size *</Label>
          <Select
            value={formData.paper_size}
            onValueChange={(value) => setFormData({ ...formData, paper_size: value })}
          >
            <SelectTrigger id="paper_size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A4">A4</SelectItem>
              <SelectItem value="A3">A3</SelectItem>
              <SelectItem value="Legal">Legal</SelectItem>
              <SelectItem value="Letter">Letter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="color_type">Color Type *</Label>
          <Select
            value={formData.color_type}
            onValueChange={(value) => {
              // Update per page cost based on color type
              const newCost = value === 'color' ? '10.00' : '3.00';
              setFormData({ ...formData, color_type: value, per_page_cost: newCost });
            }}
          >
            <SelectTrigger id="color_type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="black_white">Black & White</SelectItem>
              <SelectItem value="color">Color</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="per_page_cost">Per Page Cost (₹) *</Label>
          <Input
            id="per_page_cost"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g., 3.00"
            value={formData.per_page_cost}
            onChange={(e) => setFormData({ ...formData, per_page_cost: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="total_amount">Total Amount (₹)</Label>
          <Input
            id="total_amount"
            type="text"
            value={formData.total_amount}
            readOnly
            disabled
            className="bg-muted"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="submission_date">Submission Date *</Label>
          <Input
            id="submission_date"
            type="date"
            value={formData.submission_date}
            onChange={(e) => setFormData({ ...formData, submission_date: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="completion_date">Completion Date</Label>
          <Input
            id="completion_date"
            type="date"
            value={formData.completion_date}
            onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status *</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          placeholder="Any special instructions or notes..."
          rows={3}
          value={formData.remarks}
          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
        />
      </div>

      {/* Cost Estimation Display */}
      <div className="p-4 bg-accent/30 rounded-lg">
        <h4 className="font-semibold mb-2">Cost Summary</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-muted-foreground">Total Sheets:</span>
          <span className="font-medium">{(parseInt(formData.pages) || 0) * (parseInt(formData.copies) || 0)}</span>
          <span className="text-muted-foreground">Per Page Cost:</span>
          <span className="font-medium">₹{formData.per_page_cost}</span>
          <span className="text-muted-foreground">Total Amount:</span>
          <span className="font-bold text-primary">₹{formData.total_amount}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active" className="cursor-pointer">
          Active
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          <Printer className="h-4 w-4 mr-2" />
          {printJob ? 'Update' : 'Submit'} Print Job
        </Button>
      </div>
    </form>
  );
};

export default PrintJobForm;
