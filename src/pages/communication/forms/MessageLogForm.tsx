// Message Log Form Component
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { BulkMessageSearchableDropdown } from '../../../components/common/BulkMessageSearchableDropdown';
import { UserSearchableDropdown } from '../../../components/common/UserSearchableDropdown';
import type { MessageLog, MessageLogCreateInput } from '../../../types/communication.types';

interface MessageLogFormProps {
  messageLog?: MessageLog;
  onSubmit: (data: MessageLogCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const MessageLogForm = ({
  messageLog,
  onSubmit,
  onCancel,
  isLoading = false,
}: MessageLogFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<MessageLogCreateInput>({
    defaultValues: messageLog || {
      message_type: 'email',
      phone_email: '',
      message: '',
      status: 'pending',
      sent_at: null,
      delivered_at: null,
      error_message: null,
      bulk_message: null,
      recipient: '',
      is_active: true,
    },
  });

  const messageType = watch('message_type');
  const status = watch('status');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {messageLog ? 'Edit Message Log' : 'New Message Log'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Message Type */}
          <div className="space-y-2">
            <Label htmlFor="message_type">
              Message Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={messageType}
              onValueChange={(value) => setValue('message_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select message type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="push">Push Notification</SelectItem>
                <SelectItem value="notification">Notification</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Message (Optional) */}
          <Controller
            name="bulk_message"
            control={control}
            render={({ field }) => (
              <BulkMessageSearchableDropdown
                value={field.value}
                onChange={field.onChange}
                required={false}
                label="Bulk Message (Optional)"
                placeholder="Select bulk message if applicable..."
              />
            )}
          />

          {/* Recipient */}
          <Controller
            name="recipient"
            control={control}
            rules={{ required: 'Recipient is required' }}
            render={({ field }) => (
              <UserSearchableDropdown
                value={field.value}
                onChange={field.onChange}
                required
                label="Recipient"
                placeholder="Search and select recipient..."
                error={errors.recipient?.message}
              />
            )}
          />

          {/* Phone/Email */}
          <div className="space-y-2">
            <Label htmlFor="phone_email">
              {messageType === 'sms' ? 'Phone Number' : 'Email Address'}{' '}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone_email"
              {...register('phone_email', { required: 'This field is required' })}
              placeholder={
                messageType === 'sms'
                  ? 'Enter phone number'
                  : 'Enter email address'
              }
            />
            {errors.phone_email && (
              <p className="text-sm text-red-500">{errors.phone_email.message}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              {...register('message', { required: 'Message is required' })}
              placeholder="Enter message content"
              rows={6}
            />
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setValue('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sent At */}
          <div className="space-y-2">
            <Label htmlFor="sent_at">Sent At (Optional)</Label>
            <Input
              id="sent_at"
              type="datetime-local"
              {...register('sent_at')}
            />
          </div>

          {/* Delivered At */}
          <div className="space-y-2">
            <Label htmlFor="delivered_at">Delivered At (Optional)</Label>
            <Input
              id="delivered_at"
              type="datetime-local"
              {...register('delivered_at')}
            />
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <Label htmlFor="error_message">Error Message (Optional)</Label>
            <Textarea
              id="error_message"
              {...register('error_message')}
              placeholder="Enter error message if failed"
              rows={3}
            />
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
            : messageLog
            ? 'Update Message Log'
            : 'Create Message Log'}
        </Button>
      </div>
    </form>
  );
};
