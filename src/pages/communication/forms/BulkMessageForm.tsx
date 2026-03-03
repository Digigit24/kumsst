// Bulk Message Form Component
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import type { BulkMessage, BulkMessageCreateInput } from '../../../types/communication.types';
import { MessageSquare, Users2, Calendar, Activity, Send, FileText } from 'lucide-react';

interface BulkMessageFormProps {
  bulkMessage?: BulkMessage;
  onSubmit: (data: BulkMessageCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const BulkMessageForm = ({
  bulkMessage,
  onSubmit,
  onCancel,
  isLoading = false,
}: BulkMessageFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BulkMessageCreateInput>({
    defaultValues: bulkMessage || {
      title: '',
      message_type: 'notification',
      recipient_type: 'all',
      status: 'draft',
      is_active: true,
      total_recipients: 0,
      sent_count: 0,
      failed_count: 0,
      college: undefined,
    },
  });

  const messageType = watch('message_type');
  const recipientType = watch('recipient_type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in zoom-in-95 duration-300">

      {/* Basic Information */}
      <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Message Details</CardTitle>
              <CardDescription>Configure the content and audience for your message</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Title */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="title" className="text-sm font-semibold">
                Message Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                className="h-11 transition-all focus-visible:ring-primary/50"
                {...register('title', { required: 'Title is required' })}
                placeholder="e.g. Important Update regarding upcoming exams"
              />
              {errors.title && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <Activity className="w-3 h-3 mr-1" /> {errors.title.message}
                </p>
              )}
            </div>

            {/* Message Type */}
            <div className="space-y-2">
              <Label htmlFor="message_type" className="text-sm font-semibold flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-muted-foreground" /> Channel type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={messageType}
                onValueChange={(value) => setValue('message_type', value)}
              >
                <SelectTrigger className="h-11 transition-all focus-visible:ring-primary/50">
                  <SelectValue placeholder="Select delivery channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="push">Push Notification</SelectItem>
                  <SelectItem value="notification">In-App Notification</SelectItem>
                  <SelectItem value="all">All Channels</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recipient Type */}
            <div className="space-y-2">
              <Label htmlFor="recipient_type" className="text-sm font-semibold flex items-center gap-1.5">
                <Users2 className="w-4 h-4 text-muted-foreground" /> Target Audience <span className="text-red-500">*</span>
              </Label>
              <Select
                value={recipientType}
                onValueChange={(value) => setValue('recipient_type', value)}
              >
                <SelectTrigger className="h-11 transition-all focus-visible:ring-primary/50">
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="guardian">Parents/Guardians</SelectItem>
                  <SelectItem value="teacher">Teachers</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="custom">Custom Selection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Schedule */}
        <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm h-fit">
          <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Calendar className="w-4 h-4" />
              </div>
              <CardTitle className="text-lg">Scheduling & Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-semibold">Current Status</Label>
              <Select
                defaultValue="draft"
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger className="h-11 transition-all focus-visible:ring-primary/50">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft (Not Sent)</SelectItem>
                  <SelectItem value="scheduled">Scheduled for Later</SelectItem>
                  <SelectItem value="sending">Sending in Progress</SelectItem>
                  <SelectItem value="sent">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Scheduled At */}
            <div className="space-y-2">
              <Label htmlFor="scheduled_at" className="text-sm font-semibold">Schedule Delivery</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                className="h-11 transition-all focus-visible:ring-primary/50"
                {...register('scheduled_at')}
              />
              <p className="text-[13px] text-muted-foreground mt-1.5 flex items-center gap-1.5 bg-muted/40 p-2 rounded-md">
                <Activity className="w-3.5 h-3.5 text-primary" /> Leave empty to deliver immediately
              </p>
            </div>
          </CardContent>
        </Card>

        {/* The analytics block has been removed */}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="h-10 px-6 font-medium"
        >
          Discard
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="h-10 px-6 font-medium shadow-sm hover:shadow relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center gap-2">
            {isLoading ? (
              <Activity className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isLoading ? 'Processing...' : bulkMessage ? 'Save Changes' : 'Queue Message'}
          </span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
        </Button>
      </div>
    </form>
  );
};
