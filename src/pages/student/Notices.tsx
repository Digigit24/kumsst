import React, { useState } from 'react';
import { Bell, Calendar, Pin, AlertCircle, FileText, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Notices: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');

  // Mock data - Replace with actual API calls
  const notices = [
    {
      id: 1,
      title: 'Winter Break Holiday Notice',
      description: 'The college will remain closed from December 25, 2025 to January 1, 2026 for winter break. Classes will resume on January 2, 2026.',
      category: 'holiday',
      priority: 'important',
      publishedDate: '2025-12-20',
      validUntil: '2026-01-01',
      pinned: true,
      attachments: [
        { name: 'Holiday_Notice.pdf', size: '245 KB' }
      ]
    },
    {
      id: 2,
      title: 'Sports Day Registration Open',
      description: 'Annual Sports Day will be held on January 20, 2026. Students interested in participating should register by January 10, 2026. Various events including athletics, cricket, football, and indoor games will be organized.',
      category: 'event',
      priority: 'normal',
      publishedDate: '2025-12-18',
      validUntil: '2026-01-10',
      pinned: true,
      attachments: []
    },
    {
      id: 3,
      title: 'Library Timings Extended',
      description: 'In view of the upcoming examinations, the library timings have been extended. The library will now remain open from 7:00 AM to 10:00 PM on all working days.',
      category: 'general',
      priority: 'normal',
      publishedDate: '2025-12-15',
      validUntil: '2026-01-31',
      pinned: false,
      attachments: []
    },
    {
      id: 4,
      title: 'Fee Payment Deadline Reminder',
      description: 'This is to remind all students that the last date for paying the semester fee is January 15, 2026. Late fee will be applicable after this date.',
      category: 'academic',
      priority: 'important',
      publishedDate: '2025-12-14',
      validUntil: '2026-01-15',
      pinned: false,
      attachments: []
    },
    {
      id: 5,
      title: 'Guest Lecture on Artificial Intelligence',
      description: 'A guest lecture on "Future of Artificial Intelligence" will be conducted by Dr. John Smith on December 28, 2025 at 2:00 PM in the main auditorium. All students are encouraged to attend.',
      category: 'event',
      priority: 'normal',
      publishedDate: '2025-12-12',
      validUntil: '2025-12-28',
      pinned: false,
      attachments: []
    },
    {
      id: 6,
      title: 'Mid-term Exam Schedule Released',
      description: 'The schedule for mid-term examinations has been published. Students can check their exam timetable on the student portal. The exams will commence from January 5, 2026.',
      category: 'academic',
      priority: 'important',
      publishedDate: '2025-12-10',
      validUntil: '2026-01-05',
      pinned: false,
      attachments: [
        { name: 'Exam_Schedule.pdf', size: '512 KB' }
      ]
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'default';
      case 'event':
        return 'success';
      case 'holiday':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const filterNotices = (category: string) => {
    if (category === 'all') return notices;
    return notices.filter(notice => notice.category === category);
  };

  const pinnedNotices = notices.filter(notice => notice.pinned);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Notices & Announcements</h1>
        <p className="text-muted-foreground mt-2">
          Stay updated with latest announcements and notifications
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notices</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notices.length}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Important</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notices.filter(n => n.priority === 'important').length}</div>
            <p className="text-xs text-muted-foreground mt-1">Priority notices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notices.filter(n => n.category === 'event').length}</div>
            <p className="text-xs text-muted-foreground mt-1">Upcoming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pinned</CardTitle>
            <Pin className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pinnedNotices.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Highlighted</p>
          </CardContent>
        </Card>
      </div>

      {/* Pinned Notices */}
      {pinnedNotices.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Pin className="h-5 w-5 text-orange-600" />
            Pinned Notices
          </h2>
          <div className="space-y-4">
            {pinnedNotices.map((notice) => (
              <Card key={notice.id} className="border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {notice.priority === 'important' && (
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        )}
                        {notice.title}
                      </CardTitle>
                      <CardDescription>
                        Published on {new Date(notice.publishedDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant={getCategoryColor(notice.category)}>
                      {notice.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{notice.description}</p>
                  {notice.attachments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Attachments:</p>
                      {notice.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{attachment.name}</p>
                              <p className="text-xs text-muted-foreground">{attachment.size}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Valid until {new Date(notice.validUntil).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Notices with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="all">All ({notices.length})</TabsTrigger>
          <TabsTrigger value="academic">Academic ({notices.filter(n => n.category === 'academic').length})</TabsTrigger>
          <TabsTrigger value="event">Events ({notices.filter(n => n.category === 'event').length})</TabsTrigger>
          <TabsTrigger value="holiday">Holidays ({notices.filter(n => n.category === 'holiday').length})</TabsTrigger>
        </TabsList>

        {['all', 'academic', 'event', 'holiday'].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4 mt-6">
            {filterNotices(category).filter(n => !n.pinned).map((notice) => (
              <Card key={notice.id} className={notice.priority === 'important' ? 'border-l-4 border-l-destructive' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {notice.priority === 'important' && (
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        )}
                        {notice.title}
                      </CardTitle>
                      <CardDescription>
                        Published on {new Date(notice.publishedDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant={getCategoryColor(notice.category)}>
                      {notice.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{notice.description}</p>
                  {notice.attachments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Attachments:</p>
                      {notice.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{attachment.name}</p>
                              <p className="text-xs text-muted-foreground">{attachment.size}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Valid until {new Date(notice.validUntil).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
