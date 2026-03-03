import React, { useState } from 'react';
import { useDebounce, DEBOUNCE_DELAYS } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Mail,
  Send,
  Inbox,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  GraduationCap,
  UserCog,
  MessageSquare,
  Plus,
  Search,
  Eye,
} from 'lucide-react';

interface Message {
  id: number;
  subject: string;
  from: string;
  fromRole: 'teacher' | 'admin' | 'staff';
  message: string;
  date: string;
  read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'announcement' | 'academic' | 'attendance' | 'fee' | 'general';
}

const mockStudentMessages: Message[] = [
  {
    id: 1,
    subject: 'Semester Exam Schedule Released',
    from: 'Dr. Rajesh Kumar',
    fromRole: 'teacher',
    message: 'Dear Students, The semester examination schedule has been released. Please check the notice board and college website for detailed timetable. Exams will start from January 15, 2025.',
    date: '2024-12-20',
    read: false,
    priority: 'high',
    category: 'academic',
  },
  {
    id: 2,
    subject: 'Fee Payment Reminder',
    from: 'Admin Office',
    fromRole: 'admin',
    message: 'This is a reminder to pay your semester fees before December 31, 2024. Late payment will incur a fine of ₹500.',
    date: '2024-12-18',
    read: true,
    priority: 'urgent',
    category: 'fee',
  },
  {
    id: 3,
    subject: 'Assignment Submission - Data Structures',
    from: 'Prof. Sneha Patel',
    fromRole: 'teacher',
    message: 'Your assignment on Binary Trees is due on December 25, 2024. Please submit through the student portal.',
    date: '2024-12-15',
    read: true,
    priority: 'normal',
    category: 'academic',
  },
  {
    id: 4,
    subject: 'Low Attendance Warning',
    from: 'Student Affairs',
    fromRole: 'admin',
    message: 'Your attendance in Database Management Systems is 68%. Minimum required is 75%. Please ensure regular attendance.',
    date: '2024-12-10',
    read: false,
    priority: 'high',
    category: 'attendance',
  },
  {
    id: 5,
    subject: 'Tech Fest 2025 - Registrations Open',
    from: 'Event Coordinator',
    fromRole: 'staff',
    message: 'Annual Tech Fest registrations are now open! Participate in coding competitions, hackathons, and technical workshops.',
    date: '2024-12-05',
    read: true,
    priority: 'normal',
    category: 'announcement',
  },
];

const StudentCommunicationPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(mockStudentMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAYS.SEARCH);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');

  const [composeForm, setComposeForm] = useState({
    to: 'teacher',
    subject: '',
    message: '',
  });

  const unreadCount = messages.filter(m => !m.read).length;

  const filteredMessages = messages.filter(message => {
    const matchesSearch =
      message.subject.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      message.from.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      message.message.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || message.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setDetailsOpen(true);
    if (!message.read) {
      setMessages(messages.map(m => m.id === message.id ? { ...m, read: true } : m));
    }
  };

  const handleSendMessage = () => {
    if (!composeForm.subject || !composeForm.message) {
      toast.warning('Please fill in all fields');
      return;
    }
    toast.success('Message sent successfully!');
    setComposeForm({ to: 'teacher', subject: '', message: '' });
    setComposeOpen(false);
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic':
        return <GraduationCap className="h-4 w-4" />;
      case 'attendance':
        return <UserCog className="h-4 w-4" />;
      case 'fee':
        return <AlertCircle className="h-4 w-4" />;
      case 'announcement':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const stats = [
    { label: 'Total Messages', value: messages.length, icon: Inbox, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Unread', value: unreadCount, icon: Mail, color: 'text-orange-600 dark:text-orange-400' },
    { label: 'Important', value: messages.filter(m => m.priority === 'urgent' || m.priority === 'high').length, icon: AlertCircle, color: 'text-red-600 dark:text-red-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground mt-1">Stay connected with teachers and administration</p>
        </div>
        <Button onClick={() => setComposeOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Compose
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
                <SelectItem value="fee">Fee</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Inbox className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No messages found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleViewMessage(message)}
                  className={cn(
                    'p-4 hover:bg-accent cursor-pointer transition-colors',
                    !message.read && 'bg-accent/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0',
                      !message.read ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}>
                      {getCategoryIcon(message.category)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className={cn(
                            'font-semibold text-sm truncate',
                            !message.read && 'text-primary'
                          )}>
                            {message.subject}
                          </h3>
                          <p className="text-xs text-muted-foreground">{message.from} • {message.fromRole}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant={getPriorityColor(message.priority) as any} className="text-xs">
                            {message.priority}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">{message.message}</p>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(message.date).toLocaleDateString()}
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {message.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <DialogTitle>{selectedMessage?.subject}</DialogTitle>
                <DialogDescription>
                  From: {selectedMessage?.from} ({selectedMessage?.fromRole})
                </DialogDescription>
              </div>
              <Badge variant={getPriorityColor(selectedMessage?.priority || 'normal') as any}>
                {selectedMessage?.priority}
              </Badge>
            </div>
          </DialogHeader>
          {selectedMessage && (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(selectedMessage.date).toLocaleString()}
                  </span>
                  <Badge variant="outline" className="capitalize">
                    {selectedMessage.category}
                  </Badge>
                </div>

                <div className="border-t pt-4">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
            <DialogDescription>Send a message to your teachers or administration</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">To</label>
              <Select value={composeForm.to} onValueChange={(value) => setComposeForm({ ...composeForm, to: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">My Teacher</SelectItem>
                  <SelectItem value="class_teacher">Class Teacher</SelectItem>
                  <SelectItem value="hod">Head of Department</SelectItem>
                  <SelectItem value="admin">Administration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Input
                placeholder="Enter subject..."
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
                rows={8}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setComposeOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendMessage} className="gap-2">
                <Send className="h-4 w-4" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentCommunicationPage;
