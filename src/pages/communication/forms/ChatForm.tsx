// Chat Form Component
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { UserSearchableDropdown } from '../../../components/common/UserSearchableDropdown';
import { useAuth } from '../../../hooks/useAuth';
import type { Chat, ChatCreateInput } from '../../../types/communication.types';

interface ChatFormProps {
  chat?: Chat;
  onSubmit: (data: ChatCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultReceiver?: string;
}

export const ChatForm = ({
  chat,
  onSubmit,
  onCancel,
  isLoading = false,
  defaultReceiver,
}: ChatFormProps) => {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ChatCreateInput>({
    defaultValues: chat
      ? {
          message: chat.message,
          receiver_id: chat.receiver ? Number(chat.receiver) || 0 : 0,
          attachment: chat.attachment ?? null,
          is_read: chat.is_read ?? false,
          is_active: chat.is_active ?? true,
        }
      : {
          message: '',
          receiver_id: defaultReceiver ? Number(defaultReceiver) || 0 : 0,
          attachment: null,
          is_read: false,
          is_active: true,
        },
  });

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{chat ? 'Edit Message' : 'New Message'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Receiver */}
          {!defaultReceiver && (
            <div className="space-y-2">
              <Controller
                name="receiver_id"
                control={control}
                rules={{ required: 'Receiver is required' }}
                render={({ field }) => (
                  <UserSearchableDropdown
                    value={field.value ? String(field.value) : ''}
                    onChange={(val) => field.onChange(val ? Number(val) : 0)}
                    required
                    label="To"
                    placeholder="Search and select recipient..."
                    error={errors.receiver_id?.message}
                  />
                )}
              />
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              {...register('message', { required: 'Message is required' })}
              placeholder="Type your message here..."
              rows={6}
            />
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message.message}</p>
            )}
          </div>

          {/* Attachment */}
          <div className="space-y-2">
            <Label htmlFor="attachment">Attachment URL</Label>
            <Input
              id="attachment"
              {...register('attachment')}
              placeholder="https://example.com/file.pdf"
            />
            <p className="text-sm text-gray-500">
              Optional: Enter a URL to an attachment
            </p>
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
          {isLoading ? 'Sending...' : chat ? 'Update Message' : 'Send Message'}
        </Button>
      </div>
    </form>
  );
};
