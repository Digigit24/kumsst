import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
  Send,
  Mail,
  MessageSquare,
  Users,
  UserCheck,
  GraduationCap,
  Filter,
  Plus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Download,
  TrendingUp,
} from 'lucide-react';

interface SentMessage {
  id: number;
  subject: string;
  recipients: string;
  recipientCount: number;
  message: string;
  sentDate: string;
  deliveryStatus: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channel: 'sms' | 'email' | 'push' | 'all';
}

interface MessageTemplate {
  id: number;
  name: string;
  subject: string;
  message: string;
  category: string;
}

const mockSentMessages: SentMessage[] = [
  {
    id: 1,
    subject: 'Assignment Deadline Reminder',
    recipients: 'BTech CSE 3rd Year - Section A',
    recipientCount: 45,
    message: 'Dear Students, This is a reminder that your Data Structures assignment is due on December 25, 2024. Please submit through the student portal.',
    sentDate: '2024-12-15T10:30:00',
    deliveryStatus: { sent: 45, delivered: 43, read: 38, failed: 2 },
    priority: 'normal',
    channel: 'email',
  },
  {
    id: 2,
    subject: 'Exam Schedule Announcement',
    recipients: 'All Students',
    recipientCount: 180,
    message: 'Semester exams will commence from January 15, 2025. Detailed timetable is available on the notice board.',
    sentDate: '2024-12-20T09:00:00',
    deliveryStatus: { sent: 180, delivered: 175, read: 142, failed: 5 },
    priority: 'high',
    channel: 'all',
  },
  {
    id: 3,
    subject: 'Parent-Teacher Meeting Notice',
    recipients: 'Parents of BTech CSE 2nd Year',
    recipientCount: 60,
    message: 'Parent-teacher meeting is scheduled for December 28, 2024 at 2:00 PM. Your presence is requested.',
    sentDate: '2024-12-18T14:00:00',
    deliveryStatus: { sent: 60, delivered: 58, read: 45, failed: 2 },
    priority: 'urgent',
    channel: 'sms',
  },
];

const mockTemplates: MessageTemplate[] = [
  {
    id: 1,
    name: 'Assignment Reminder',
    subject: 'Assignment Submission Reminder',
    message: 'Dear Students,\n\nThis is a reminder that your assignment on [TOPIC] is due on [DATE]. Please ensure timely submission through the student portal.\n\nBest regards,\n[YOUR NAME]',
    category: 'academic',
  },
  {
    id: 2,
    name: 'Low Attendance Alert',
    subject: 'Attendance Alert',
    message: 'Dear Student,\n\nYour attendance in [SUBJECT] is currently [PERCENTAGE]%. Please ensure regular attendance to meet the minimum requirement of 75%.\n\nRegards,\n[YOUR NAME]',
    category: 'attendance',
  },
  {
    id: 3,
    name: 'Exam Performance',
    subject: 'Examination Performance',
    message: 'Dear Student,\n\nYour performance in the recent [EXAM NAME] has been noted. Your score: [SCORE]/[TOTAL].\n\nPlease meet me during office hours to discuss improvement strategies.\n\nBest regards,\n[YOUR NAME]',
    category: 'academic',
  },
  {
    id: 4,
    name: 'Parent Meeting',
    subject: 'Parent-Teacher Meeting Invitation',
    message: 'Dear Parents,\n\nYou are invited to attend the parent-teacher meeting on [DATE] at [TIME]. We will discuss your child\'s academic progress and performance.\n\nLocation: [VENUE]\n\nRegards,\n[YOUR NAME]',
    category: 'general',
  },
];

const TeacherCommunicationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compose' | 'sent' | 'templates'>('compose');
  const [sentMessages, setSentMessages] = useState<SentMessage[]>(mockSentMessages);
  const [templates] = useState<MessageTemplate[]>(mockTemplates);
  const [selectedMessage, setSelectedMessage] = useState<SentMessage | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [composeForm, setComposeForm] = useState({
    recipientType: 'class',
    class: '',
    section: '',
    subject: '',
    message: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    channel: 'email' as 'sms' | 'email' | 'push' | 'all',
    includeGuardians: false,
  });

  const handleUseTemplate = (template: MessageTemplate) => {
    setComposeForm({
      ...composeForm,
      subject: template.subject,
      message: template.message,
    });
    setActiveTab('compose');
  };

  const handleSendMessage = () => {
    if (!composeForm.subject || !composeForm.message) {
      toast.warning('Please fill in subject and message');
      return;
    }
    toast.success('Message sent successfully to recipients!');
    setComposeForm({
      recipientType: 'class',
      class: '',
      section: '',
      subject: '',
      message: '',
      priority: 'normal',
      channel: 'email',
      includeGuardians: false,
    });
  };

  const handleViewDetails = (message: SentMessage) => {
    setSelectedMessage(message);
    setDetailsOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      case 'normal':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'sms':
        return '📱';
      case 'email':
        return '📧';
      case 'push':
        return '🔔';
      case 'all':
        return '🌐';
      default:
        return '📨';
    }
  };

  const stats = [
    { label: 'Messages Sent', value: sentMessages.length, icon: Send, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Total Recipients', value: sentMessages.reduce((sum, m) => sum + m.recipientCount, 0), icon: Users, color: 'text-green-600 dark:text-green-400' },
    { label: 'Delivery Rate', value: '96%', icon: CheckCircle, color: 'text-teal-600 dark:text-teal-400' },
    { label: 'Read Rate', value: '78%', icon: Eye, color: 'text-purple-600 dark:text-purple-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Communication Center</h1>
        <p className="text-muted-foreground mt-1">Send messages and announcements to students and parents</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className={cn('text-2xl font-bold mt-1', stat.color)}>{stat.value}</p>
                </div>
                <stat.icon className={cn('h-8 w-8', stat.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        <Button
          variant={activeTab === 'compose' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('compose')}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Compose
        </Button>
        <Button
          variant={activeTab === 'sent' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('sent')}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          Sent Messages ({sentMessages.length})
        </Button>
        <Button
          variant={activeTab === 'templates' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('templates')}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Templates ({templates.length})
        </Button>
      </div>

      {/* Compose Tab */}
      {activeTab === 'compose' && (
        <Card>
          <CardHeader>
            <CardTitle>Compose New Message</CardTitle>
            <CardDescription>Send messages to students or their guardians</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recipients */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Recipient Type</label>
                <Select value={composeForm.recipientType} onValueChange={(value) => setComposeForm({ ...composeForm, recipientType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="class">Specific Class</SelectItem>
                    <SelectItem value="section">Specific Section</SelectItem>
                    <SelectItem value="individual">Individual Student</SelectItem>
                    <SelectItem value="all">All My Students</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Class/Section</label>
                <Input
                  placeholder="e.g., BTech CSE 3rd Year"
                  value={composeForm.class}
                  onChange={(e) => setComposeForm({ ...composeForm, class: e.target.value })}
                />
              </div>
            </div>

            {/* Message Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select value={composeForm.priority} onValueChange={(value: any) => setComposeForm({ ...composeForm, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Channel</label>
                <Select value={composeForm.channel} onValueChange={(value: any) => setComposeForm({ ...composeForm, channel: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email Only</SelectItem>
                    <SelectItem value="sms">SMS Only</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                    <SelectItem value="all">All Channels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="guardians"
                checked={composeForm.includeGuardians}
                onCheckedChange={(checked) => setComposeForm({ ...composeForm, includeGuardians: checked as boolean })}
              />
              <label htmlFor="guardians" className="text-sm font-medium cursor-pointer">
                Also send to guardians/parents
              </label>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Input
                placeholder="Enter message subject..."
                value={composeForm.subject}
                onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea
                placeholder="Type your message here..."
                value={composeForm.message}
                onChange={(e) => setComposeForm({ ...composeForm, message: e.target.value })}
                rows={10}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline">
                Save as Draft
              </Button>
              <Button onClick={handleSendMessage} className="gap-2">
                <Send className="h-4 w-4" />
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sent Messages Tab */}
      {activeTab === 'sent' && (
        <div className="space-y-4">
          {sentMessages.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Send className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No messages sent yet</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            sentMessages.map((message) => (
              <Card key={message.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-lg">{message.subject}</h3>
                          <p className="text-sm text-muted-foreground">To: {message.recipients} ({message.recipientCount} recipients)</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant={getPriorityColor(message.priority) as any}>
                            {message.priority}
                          </Badge>
                          <span className="text-xl">{getChannelIcon(message.channel)}</span>
                        </div>
                      </div>

                      <p className="text-sm line-clamp-2">{message.message}</p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Sent</p>
                          <p className="font-medium flex items-center gap-1">
                            <Send className="h-3 w-3" />
                            {message.deliveryStatus.sent}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Delivered</p>
                          <p className="font-medium flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-3 w-3" />
                            {message.deliveryStatus.delivered}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Read</p>
                          <p className="font-medium flex items-center gap-1 text-blue-600 dark:text-blue-400">
                            <Eye className="h-3 w-3" />
                            {message.deliveryStatus.read}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Failed</p>
                          <p className="font-medium flex items-center gap-1 text-red-600 dark:text-red-400">
                            <XCircle className="h-3 w-3" />
                            {message.deliveryStatus.failed}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-2">
                        <Clock className="h-3 w-3" />
                        <span>Sent on {new Date(message.sentDate).toLocaleString()}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(message)}
                      className="gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="capitalize">{template.category}</CardDescription>
                  </div>
                  <Badge variant="outline">{template.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Subject:</p>
                  <p className="text-sm text-muted-foreground">{template.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Message:</p>
                  <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{template.message}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUseTemplate(template)}
                  className="w-full gap-2"
                >
                  <FileText className="h-3 w-3" />
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Message Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-3xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription>
              Sent to {selectedMessage?.recipients} • {selectedMessage?.recipientCount} recipients
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Badge variant={getPriorityColor(selectedMessage.priority) as any}>
                    {selectedMessage.priority} Priority
                  </Badge>
                  <Badge variant="outline">
                    {getChannelIcon(selectedMessage.channel)} {selectedMessage.channel}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {new Date(selectedMessage.sentDate).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{selectedMessage.deliveryStatus.sent}</p>
                    <p className="text-xs text-muted-foreground">Sent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedMessage.deliveryStatus.delivered}</p>
                    <p className="text-xs text-muted-foreground">Delivered</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedMessage.deliveryStatus.read}</p>
                    <p className="text-xs text-muted-foreground">Read</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{selectedMessage.deliveryStatus.failed}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Message Content:</p>
                  <p className="whitespace-pre-wrap text-sm">{selectedMessage.message}</p>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherCommunicationPage;
