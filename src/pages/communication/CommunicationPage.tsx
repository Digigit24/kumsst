/**
 * Communication Page
 * Comprehensive messaging and communication interface
 */

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Send,
  Mail,
  MessageSquare,
  Bell,
  Users,
  UserCheck,
  GraduationCap,
  UserCog,
  Filter,
  Plus,
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  TrendingUp,
  FileText,
  Download,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  mockCommunicationMessages,
  mockMessageTemplates,
  getMockCommunicationStats,
  getStatusColor,
  getPriorityColor,
  type CommunicationMessage,
  type RecipientType,
  type CommunicationType,
  type MessageStatus,
  type MessagePriority,
  type MessageTemplate,
} from '@/data/communicationMockData';

export const CommunicationPage: React.FC = () => {
  const [messages, setMessages] = useState<CommunicationMessage[]>(mockCommunicationMessages);
  const [selectedMessage, setSelectedMessage] = useState<CommunicationMessage | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [recipientTypeFilter, setRecipientTypeFilter] = useState<string>('all');
  const [communicationTypeFilter, setCommunicationTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Compose form state
  const [composeForm, setComposeForm] = useState({
    title: '',
    message: '',
    recipientType: 'student' as RecipientType,
    communicationType: 'email' as CommunicationType,
    priority: 'normal' as MessagePriority,
    selectedTemplate: '',
    scheduleDate: '',
  });

  const stats = getMockCommunicationStats();

  // Filter messages
  const filteredMessages = useMemo(() => messages.filter((msg) => {
    const matchesSearch =
      msg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.sentBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRecipient = recipientTypeFilter === 'all' || msg.recipientType === recipientTypeFilter;
    const matchesCommType = communicationTypeFilter === 'all' || msg.communicationType === communicationTypeFilter;
    const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || msg.priority === priorityFilter;

    return matchesSearch && matchesRecipient && matchesCommType && matchesStatus && matchesPriority;
  }), [messages, searchQuery, recipientTypeFilter, communicationTypeFilter, statusFilter, priorityFilter]);

  const handleSendMessage = () => {
    // Mock sending logic
    const newMessage: CommunicationMessage = {
      id: messages.length + 1,
      title: composeForm.title,
      message: composeForm.message,
      recipientType: composeForm.recipientType,
      communicationType: composeForm.communicationType,
      status: composeForm.scheduleDate ? 'scheduled' : 'sent',
      priority: composeForm.priority,
      sentBy: 'Current User',
      sentAt: composeForm.scheduleDate ? undefined : new Date().toISOString(),
      scheduledAt: composeForm.scheduleDate || undefined,
      createdAt: new Date().toISOString(),
      totalRecipients: Math.floor(Math.random() * 500) + 50,
      delivered: 0,
      read: 0,
      failed: 0,
    };

    setMessages([newMessage, ...messages]);
    setIsComposeOpen(false);
    setComposeForm({
      title: '',
      message: '',
      recipientType: 'student',
      communicationType: 'email',
      priority: 'normal',
      selectedTemplate: '',
      scheduleDate: '',
    });
  };

  const applyTemplate = (template: MessageTemplate) => {
    setComposeForm({
      ...composeForm,
      title: template.title,
      message: template.content,
      selectedTemplate: template.name,
    });
  };

  const getRecipientIcon = (type: RecipientType) => {
    switch (type) {
      case 'student': return <GraduationCap className="h-4 w-4" />;
      case 'guardian': return <Users className="h-4 w-4" />;
      case 'teacher': return <UserCheck className="h-4 w-4" />;
      case 'staff': return <UserCog className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getCommTypeIcon = (type: CommunicationType) => {
    switch (type) {
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'push': return <Bell className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communication Center</h1>
          <p className="text-muted-foreground mt-1">
            Send messages, announcements, and notifications
          </p>
        </div>
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Compose Message
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Compose New Message</DialogTitle>
              <DialogDescription>
                Send messages via SMS, Email, or Push Notifications
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Template Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Use Template (Optional)</label>
                <Select
                  value={composeForm.selectedTemplate}
                  onValueChange={(value) => {
                    const template = mockMessageTemplates.find(t => t.name === value);
                    if (template) applyTemplate(template);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockMessageTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.name}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{template.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {template.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Recipient Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Send To</label>
                  <Select
                    value={composeForm.recipientType}
                    onValueChange={(value) => setComposeForm({ ...composeForm, recipientType: value as RecipientType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Students
                        </div>
                      </SelectItem>
                      <SelectItem value="guardian">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Guardians/Parents
                        </div>
                      </SelectItem>
                      <SelectItem value="teacher">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          Teachers
                        </div>
                      </SelectItem>
                      <SelectItem value="staff">
                        <div className="flex items-center gap-2">
                          <UserCog className="h-4 w-4" />
                          Staff
                        </div>
                      </SelectItem>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          All Recipients
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Communication Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Communication Method</label>
                  <Select
                    value={composeForm.communicationType}
                    onValueChange={(value) => setComposeForm({ ...composeForm, communicationType: value as CommunicationType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sms">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          SMS
                        </div>
                      </SelectItem>
                      <SelectItem value="email">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </div>
                      </SelectItem>
                      <SelectItem value="push">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Push Notification
                        </div>
                      </SelectItem>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          All Channels
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <Select
                    value={composeForm.priority}
                    onValueChange={(value) => setComposeForm({ ...composeForm, priority: value as MessagePriority })}
                  >
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

                {/* Schedule Date */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Schedule (Optional)</label>
                  <Input
                    type="datetime-local"
                    value={composeForm.scheduleDate}
                    onChange={(e) => setComposeForm({ ...composeForm, scheduleDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium mb-2 block">Subject/Title</label>
                <Input
                  placeholder="Enter message title"
                  value={composeForm.title}
                  onChange={(e) => setComposeForm({ ...composeForm, title: e.target.value })}
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-medium mb-2 block">Message Content</label>
                <Textarea
                  placeholder="Enter your message here..."
                  rows={8}
                  value={composeForm.message}
                  onChange={(e) => setComposeForm({ ...composeForm, message: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {composeForm.message.length} characters
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                  Cancel
                </Button>
                <Button variant="outline" onClick={() => {/* Save draft logic */}}>
                  Save Draft
                </Button>
                <Button onClick={handleSendMessage} disabled={!composeForm.title || !composeForm.message}>
                  <Send className="h-4 w-4 mr-2" />
                  {composeForm.scheduleDate ? 'Schedule' : 'Send Now'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold mt-1">{stats.totalSent}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Send className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {stats.totalDelivered}
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Read</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {stats.totalRead}
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {stats.totalFailed}
                </p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Messages */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Message History
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{filteredMessages.length} messages</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Select value={recipientTypeFilter} onValueChange={setRecipientTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Recipient Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recipients</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="guardian">Guardians</SelectItem>
                  <SelectItem value="teacher">Teachers</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>

              <Select value={communicationTypeFilter} onValueChange={setCommunicationTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Communication Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="push">Push Notification</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Messages List */}
          <div className="space-y-3">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No messages found</p>
                <p className="text-sm">Try adjusting your filters or create a new message</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-all cursor-pointer"
                  onClick={() => setSelectedMessage(msg)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Title and Badges */}
                      <div className="flex items-start gap-2 flex-wrap">
                        <h4 className="font-semibold">{msg.title}</h4>
                        <Badge variant={getStatusColor(msg.status) as any}>
                          {msg.status}
                        </Badge>
                        <Badge variant={getPriorityColor(msg.priority) as any}>
                          {msg.priority}
                        </Badge>
                      </div>

                      {/* Message Preview */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {msg.message}
                      </p>

                      {/* Meta Information */}
                      <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {getRecipientIcon(msg.recipientType)}
                          <span className="capitalize">{msg.recipientType}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          {getCommTypeIcon(msg.communicationType)}
                          <span className="uppercase">{msg.communicationType}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(msg.sentAt || msg.scheduledAt || msg.createdAt)}
                        </span>
                        <span>By: {msg.sentBy}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    {msg.status !== 'draft' && (
                      <div className="text-right space-y-1 min-w-[100px]">
                        <p className="text-xs text-muted-foreground">
                          Recipients: {msg.totalRecipients}
                        </p>
                        {msg.status === 'sent' && (
                          <>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              ✓ Delivered: {msg.delivered}
                            </p>
                            <p className="text-xs text-purple-600 dark:text-purple-400">
                              👁 Read: {msg.read}
                            </p>
                            {msg.failed > 0 && (
                              <p className="text-xs text-red-600 dark:text-red-400">
                                ✗ Failed: {msg.failed}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      {selectedMessage && (
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <DialogTitle>{selectedMessage.title}</DialogTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(selectedMessage.status) as any}>
                      {selectedMessage.status}
                    </Badge>
                    <Badge variant={getPriorityColor(selectedMessage.priority) as any}>
                      {selectedMessage.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Message Content */}
              <div className="p-4 bg-accent/30 rounded-lg">
                <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Sent To</p>
                  <p className="font-medium capitalize flex items-center gap-2">
                    {getRecipientIcon(selectedMessage.recipientType)}
                    {selectedMessage.recipientType}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Communication Type</p>
                  <p className="font-medium uppercase flex items-center gap-2">
                    {getCommTypeIcon(selectedMessage.communicationType)}
                    {selectedMessage.communicationType}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sent By</p>
                  <p className="font-medium">{selectedMessage.sentBy}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {selectedMessage.status === 'scheduled' ? 'Scheduled For' : 'Sent At'}
                  </p>
                  <p className="font-medium">
                    {formatDate(selectedMessage.sentAt || selectedMessage.scheduledAt)}
                  </p>
                </div>
              </div>

              {/* Statistics */}
              {selectedMessage.status !== 'draft' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-bold">{selectedMessage.totalRecipients}</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <p className="text-xs text-muted-foreground">Delivered</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {selectedMessage.delivered}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <p className="text-xs text-muted-foreground">Read</p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {selectedMessage.read}
                    </p>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <p className="text-xs text-muted-foreground">Failed</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                      {selectedMessage.failed}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                {selectedMessage.status === 'draft' && (
                  <Button size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Send Now
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CommunicationPage;
