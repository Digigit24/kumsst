// Message Template Form Component
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import type { MessageTemplate, MessageTemplateCreateInput } from '../../../types/communication.types';

interface MessageTemplateFormProps {
  template?: MessageTemplate;
  onSubmit: (data: MessageTemplateCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const MessageTemplateForm = ({
  template,
  onSubmit,
  onCancel,
  isLoading = false,
}: MessageTemplateFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MessageTemplateCreateInput>({
    defaultValues: template || {
      name: '',
      code: '',
      message_type: '',
      content: '',
      variables: '',
      is_active: true,
    },
  });

  const messageType = watch('message_type');
  const isActive = watch('is_active');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {template ? 'Edit Message Template' : 'New Message Template'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Template Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register('name', { required: 'Template name is required' })}
              placeholder="Enter template name"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code">
              Template Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="code"
              {...register('code', { required: 'Template code is required' })}
              placeholder="e.g., WELCOME_MSG, FEE_REMINDER"
            />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code.message}</p>
            )}
          </div>

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
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="push">Push Notification</SelectItem>
                <SelectItem value="system">System Notification</SelectItem>
              </SelectContent>
            </Select>
            {errors.message_type && (
              <p className="text-sm text-red-500">{errors.message_type.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Message Content <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              {...register('content', { required: 'Message content is required' })}
              placeholder="Enter message content with placeholders like {student_name}, {fee_amount}, etc."
              rows={8}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Use curly braces for variables: {'{variable_name}'}
            </p>
          </div>

          {/* Variables */}
          <div className="space-y-2">
            <Label htmlFor="variables">Available Variables (Optional)</Label>
            <Textarea
              id="variables"
              {...register('variables')}
              placeholder="Comma-separated list: student_name, fee_amount, due_date"
              rows={2}
            />
            <p className="text-xs text-gray-500">
              List all variables available in this template (comma-separated)
            </p>
          </div>

          {/* Active Checkbox */}
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
            : template
            ? 'Update Template'
            : 'Create Template'}
        </Button>
      </div>
    </form>
  );
};
