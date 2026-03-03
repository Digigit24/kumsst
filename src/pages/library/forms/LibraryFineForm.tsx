/**
 * Library Fine Form Component
 * Form for creating/editing library fines
 */

import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelect } from '../../../components/ui/searchable-select';
import { Textarea } from '../../../components/ui/textarea';
import { DROPDOWN_PAGE_SIZE } from '../../../config/app.config';
import { useBookIssues, useLibraryMembers } from '../../../hooks/useLibrary';
import type { Fine } from '../../../types/library.types';

interface LibraryFineFormProps {
  libraryFine: Fine | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function LibraryFineForm({ libraryFine, onSubmit, onCancel, isSubmitting = false }: LibraryFineFormProps) {
  const [formData, setFormData] = useState({
    member: 0,
    book_issue: 0,
    amount: 0,
    reason: '',
    fine_date: new Date().toISOString().split('T')[0],
    is_paid: false,
    paid_date: '',
    remarks: '',
  });

  // Load library members
  const { data: membersData, isLoading: membersLoading } = useLibraryMembers({
    page: 1,
    page_size: DROPDOWN_PAGE_SIZE,
    is_active: true
  });

  // Load book issues for selected member
  const { data: bookIssuesData, isLoading: bookIssuesLoading } = useBookIssues({
    member: formData.member,
    // status: 'issued,overdue', // Fetch all to allow fines on returned books
    page: 1,
    page_size: DROPDOWN_PAGE_SIZE,
  });

  useEffect(() => {
    if (libraryFine) {
      setFormData({
        member: libraryFine.member,
        book_issue: libraryFine.book_issue || 0,
        amount: Number(libraryFine.amount),
        reason: libraryFine.reason || '',
        fine_date: libraryFine.fine_date,
        is_paid: libraryFine.is_paid,
        paid_date: libraryFine.paid_date || '',
        remarks: libraryFine.remarks || '',
      });
    }
  }, [libraryFine]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      amount: formData.amount.toString(),
      book_issue: formData.book_issue === 0 ? null : formData.book_issue,
      paid_date: formData.is_paid
        ? (formData.paid_date || new Date().toISOString().split('T')[0])
        : null,
    };
    onSubmit(payload);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updates: any = { [field]: value };
      // Reset book issue if member changes
      if (field === 'member') {
        updates.book_issue = 0;
      }
      return { ...prev, ...updates };
    });
  };

  // Prepare member options
  const memberOptions =
    membersData?.results?.map((member: any) => ({
      value: member.id.toString(),
      label: `${member.user_name || member.member_id} (${member.member_type})`,
    })) || [];

  // Prepare book issue options
  const bookIssueOptions =
    bookIssuesData?.results?.map((issue: any) => ({
      value: issue.id.toString(),
      label: `${issue.book_title} (Due: ${issue.due_date})`,
    })) || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Fine Details</h3>

        <div className="space-y-2">
          <Label htmlFor="member">Library Member *</Label>
          <SearchableSelect
            options={memberOptions}
            value={formData.member}
            onChange={(value) =>
              handleChange('member', typeof value === 'string' ? parseInt(value) : value)
            }
            placeholder="Search member..."
            emptyText="No members found."
            searchPlaceholder="Type member name..."
            isLoading={membersLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="book_issue">Book Issue</Label>
          <SearchableSelect
            options={bookIssueOptions}
            value={formData.book_issue}
            onChange={(value) =>
              handleChange('book_issue', typeof value === 'string' ? parseInt(value) : value)
            }
            placeholder={formData.member ? "Select book issue (optional)..." : "Select a member first"}
            emptyText="No book issues found."
            searchPlaceholder="Search book..."
            isLoading={bookIssuesLoading}
            disabled={!formData.member}
          />
          <p className="text-xs text-muted-foreground">Optional: Link fine to a specific book issue</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount || ''}
            onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fine_date">Fine Date *</Label>
          <Input
            id="fine_date"
            type="date"
            value={formData.fine_date}
            onChange={(e) => handleChange('fine_date', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason *</Label>
          <Textarea
            id="reason"
            value={formData.reason || ''}
            onChange={(e) => handleChange('reason', e.target.value)}
            rows={3}
            placeholder="Enter reason for the fine"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea
            id="remarks"
            value={formData.remarks || ''}
            onChange={(e) => handleChange('remarks', e.target.value)}
            rows={2}
            placeholder="Additional remarks (optional)"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_paid"
            checked={formData.is_paid}
            onChange={(e) => handleChange('is_paid', e.target.checked)}
            className="w-4 h-4"
          />
          <Label htmlFor="is_paid" className="cursor-pointer">
            Mark as Paid
          </Label>
        </div>

        {formData.is_paid && (
          <div className="space-y-2">
            <Label htmlFor="paid_date">Paid Date</Label>
            <Input
              id="paid_date"
              type="date"
              value={formData.paid_date}
              onChange={(e) => handleChange('paid_date', e.target.value)}
            />
          </div>
        )}
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {libraryFine ? 'Update' : 'Create'} Fine
        </Button>
      </div>
    </form>
  );
}
