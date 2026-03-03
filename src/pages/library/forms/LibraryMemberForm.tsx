/**
 * Library Member Form Component
 * Create/Edit form for library members
 */

import { useState, useEffect, useMemo } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { SearchableSelect, SearchableSelectOption } from '../../../components/ui/searchable-select';
import { LibraryMember, LibraryMemberCreateInput } from '../../../types/library.types';
import { DROPDOWN_PAGE_SIZE } from '../../../config/app.config';
import { useUsers } from '../../../hooks/useAccounts';
import { useAuth } from '../../../hooks/useAuth';
import { getCurrentUserCollege } from '../../../utils/auth.utils';

interface LibraryMemberFormProps {
  member: LibraryMember | null;
  onSubmit: (data: Partial<LibraryMember>) => void;
  onCancel: () => void;
}

export const LibraryMemberForm = ({ member, onSubmit, onCancel }: LibraryMemberFormProps) => {
  // Fetch users for the searchable dropdown
  const { data: usersData, isLoading: loadingUsers } = useUsers({ page_size: DROPDOWN_PAGE_SIZE });
  const { user } = useAuth();
  const userCollege = getCurrentUserCollege(user as any) || undefined;

  const [formData, setFormData] = useState<Partial<LibraryMemberCreateInput>>({
    member_id: '',
    user: '',
    member_type: 'student',
    max_books_allowed: 3,
    max_days_allowed: 14,
    joining_date: new Date().toISOString().split('T')[0],
    expiry_date: null,
    college: userCollege,
    is_active: true,
  });

  // Transform users data for SearchableSelect
  const userOptions: SearchableSelectOption[] = useMemo(() => {
    if (!usersData?.results) return [];
    return usersData.results.map((user) => ({
      value: user.id,
      label: user.full_name || user.username,
      subtitle: `${user.username} • ${user.user_type_display}${user.email ? ' • ' + user.email : ''}`,
    }));
  }, [usersData]);

  useEffect(() => {
    if (member) {
      setFormData({
        member_id: member.member_id,
        user: member.user,
        member_type: member.member_type,
        max_books_allowed: member.max_books_allowed,
        max_days_allowed: member.max_days_allowed,
        joining_date: member.joining_date,
        expiry_date: member.expiry_date,
        college: member.college,
        is_active: member.is_active,
      });
    } else if (userCollege && !formData.college) {
      setFormData((prev) => ({ ...prev, college: userCollege }));
    }
  }, [member, userCollege]);

  // Auto-generate member ID when user is selected
  const handleUserSelect = (userId: string | number) => {
    // Find the selected user to get their user type
    const selectedUser = usersData?.results.find(u => u.id === userId);

    // Auto-generate member ID based on user type
    let prefix = 'LM';
    if (selectedUser?.user_type === 'student') prefix = 'STU';
    else if (selectedUser?.user_type === 'teacher') prefix = 'TCH';
    else if (selectedUser?.user_type === 'staff') prefix = 'STF';

    const timestamp = Date.now().toString().slice(-6);
    const generatedMemberId = `${prefix}-${timestamp}`;

    setFormData((prev) => ({
      ...prev,
      user: String(userId),
      member_id: generatedMemberId,
      member_type: selectedUser?.user_type === 'teacher'
        ? 'teacher'
        : selectedUser?.user_type === 'staff'
          ? 'staff'
          : 'student',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const userId = localStorage.getItem('kumss_user_id') || undefined;
    const submitData: any = { ...formData };

    if (!member && userId) {
      submitData.created_by = userId;
      submitData.updated_by = userId;
    } else if (member && userId) {
      submitData.updated_by = userId;
    }

    if (submitData.expiry_date === '') submitData.expiry_date = null;

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="user">Select User *</Label>
        <SearchableSelect
          options={userOptions}
          value={formData.user}
          onChange={handleUserSelect}
          placeholder="Select a user..."
          searchPlaceholder="Search by name, username, or email..."
          emptyText={loadingUsers ? 'Loading users...' : 'No users found.'}
          disabled={loadingUsers || !!member}
        />
        {member && (
          <p className="text-xs text-muted-foreground">User cannot be changed after creation</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="member_id">Member ID *</Label>
        <Input
          id="member_id"
          value={formData.member_id}
          onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
          placeholder="STU-123456 (auto-generated, editable)"
          required
        />
        <p className="text-xs text-muted-foreground">Auto-generated when you select a user, but you can edit it</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="member_type">Member Type *</Label>
        <Select
          value={formData.member_type}
          onValueChange={(value: 'student' | 'teacher' | 'staff') => setFormData({ ...formData, member_type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select member type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="max_books_allowed">Max Books Allowed *</Label>
          <Input
            id="max_books_allowed"
            type="number"
            value={formData.max_books_allowed}
            onChange={(e) => setFormData({ ...formData, max_books_allowed: parseInt(e.target.value) })}
            required
            min="1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_days_allowed">Max Days Allowed *</Label>
          <Input
            id="max_days_allowed"
            type="number"
            value={formData.max_days_allowed}
            onChange={(e) => setFormData({ ...formData, max_days_allowed: parseInt(e.target.value) })}
            required
            min="1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="joining_date">Joining Date *</Label>
          <Input
            id="joining_date"
            type="date"
            value={formData.joining_date}
            onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiry_date">Expiry Date</Label>
          <Input
            id="expiry_date"
            type="date"
            value={formData.expiry_date || ''}
            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value || null })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="is_active">Active</Label>
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {member ? 'Update Member' : 'Add Member'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};


