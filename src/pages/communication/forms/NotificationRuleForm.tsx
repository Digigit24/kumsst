// Notification Rule Form Component
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Checkbox } from '../../../components/ui/checkbox';
import { MessageTemplateSearchableDropdown } from '../../../components/common/MessageTemplateSearchableDropdown';
import type { NotificationRule, NotificationRuleCreateInput } from '../../../types/communication.types';

interface NotificationRuleFormProps {
  notificationRule?: NotificationRule;
  onSubmit: (data: NotificationRuleCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const NotificationRuleForm = ({
  notificationRule,
  onSubmit,
  onCancel,
  isLoading = false,
}: NotificationRuleFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<NotificationRuleCreateInput>({
    defaultValues: notificationRule || {
      name: '',
      event_type: '',
      channels: '',
      template: 0,
      is_enabled: true,
      is_active: true,
    },
  });

  const eventType = watch('event_type');
  const isEnabled = watch('is_enabled');
  const isActive = watch('is_active');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {notificationRule ? 'Edit Notification Rule' : 'New Notification Rule'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Rule Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register('name', { required: 'Rule name is required' })}
              placeholder="Enter rule name"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <Label htmlFor="event_type">
              Event Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={eventType}
              onValueChange={(value) => setValue('event_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student_admission">Student Admission</SelectItem>
                <SelectItem value="fee_payment">Fee Payment</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
                <SelectItem value="exam_result">Exam Result</SelectItem>
                <SelectItem value="leave_request">Leave Request</SelectItem>
                <SelectItem value="assignment_submission">Assignment Submission</SelectItem>
                <SelectItem value="event_registration">Event Registration</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.event_type && (
              <p className="text-sm text-red-500">{errors.event_type.message}</p>
            )}
          </div>

          {/* Channels */}
          <div className="space-y-2">
            <Label htmlFor="channels">
              Notification Channels <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('channels')}
              onValueChange={(value) => setValue('channels', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="push">Push Notification</SelectItem>
                <SelectItem value="email,sms">Email + SMS</SelectItem>
                <SelectItem value="email,push">Email + Push</SelectItem>
                <SelectItem value="sms,push">SMS + Push</SelectItem>
                <SelectItem value="email,sms,push">All Channels</SelectItem>
              </SelectContent>
            </Select>
            {errors.channels && (
              <p className="text-sm text-red-500">{errors.channels.message}</p>
            )}
          </div>

          {/* Template - Searchable Dropdown */}
          <Controller
            name="template"
            control={control}
            rules={{ required: 'Template is required' }}
            render={({ field }) => (
              <MessageTemplateSearchableDropdown
                value={field.value}
                onChange={field.onChange}
                required
                label="Message Template"
                placeholder="Search and select template..."
                error={errors.template?.message}
              />
            )}
          />

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_enabled"
                checked={isEnabled}
                onCheckedChange={(checked) => setValue('is_enabled', checked as boolean)}
              />
              <Label htmlFor="is_enabled" className="cursor-pointer">
                Enable This Rule
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setValue('is_active', checked as boolean)}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? 'Saving...'
            : notificationRule
            ? 'Update Rule'
            : 'Create Rule'}
        </Button>
      </div>
    </form>
  );
};
