import React, { useState } from 'react';
import { HelpCircle, MessageSquare, Phone, Mail, Send, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Support: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tickets');

  // Mock data - Replace with actual API calls
  const supportTickets = [
    {
      id: 1,
      ticketNo: 'TKT2025001',
      subject: 'Unable to access library resources',
      category: 'Technical',
      status: 'open',
      priority: 'medium',
      createdDate: '2025-12-25',
      lastUpdate: '2025-12-25',
      description: 'I am unable to access the digital library resources. Getting an error message when trying to log in.',
    },
    {
      id: 2,
      ticketNo: 'TKT2025002',
      subject: 'Fee receipt not received',
      category: 'Fees',
      status: 'in-progress',
      priority: 'high',
      createdDate: '2025-12-20',
      lastUpdate: '2025-12-22',
      description: 'I paid my semester fee on December 15, but I have not received the receipt yet.',
      response: 'We are looking into this issue. Your receipt will be generated within 2 working days.',
    },
    {
      id: 3,
      ticketNo: 'TKT2025003',
      subject: 'Attendance discrepancy',
      category: 'Academic',
      status: 'resolved',
      priority: 'medium',
      createdDate: '2025-12-10',
      lastUpdate: '2025-12-15',
      resolvedDate: '2025-12-15',
      description: 'My attendance is showing 80% but I have attended all classes. Please check.',
      response: 'The attendance has been corrected. Thank you for bringing this to our notice.',
    },
  ];

  const faqs = [
    {
      id: 1,
      category: 'Academic',
      question: 'How can I view my attendance?',
      answer: 'You can view your attendance by navigating to Academics > Attendance section in the student dashboard. It shows both overall and subject-wise attendance.',
    },
    {
      id: 2,
      category: 'Fees',
      question: 'What are the payment modes available?',
      answer: 'You can pay your fees through Online Banking, UPI, Debit/Credit Card, or Cash at the accounts office.',
    },
    {
      id: 3,
      category: 'Examinations',
      question: 'How do I download my admit card?',
      answer: 'After registering for the exam, you can download your admit card from Examinations > Exam Registration section. It will be available 7 days before the exam.',
    },
    {
      id: 4,
      category: 'Certificates',
      question: 'How long does it take to get a bonafide certificate?',
      answer: 'Bonafide certificates are typically processed within 3 working days from the date of application.',
    },
    {
      id: 5,
      category: 'Technical',
      question: 'I forgot my password. How do I reset it?',
      answer: 'Click on "Forgot Password" on the login page and follow the instructions. A password reset link will be sent to your registered email.',
    },
  ];

  const contactInfo = [
    {
      title: 'Academic Office',
      phone: '+1 234 567 8900',
      email: 'academic@college.edu',
      hours: 'Mon-Fri, 9:00 AM - 5:00 PM',
    },
    {
      title: 'Accounts Office',
      phone: '+1 234 567 8901',
      email: 'accounts@college.edu',
      hours: 'Mon-Fri, 9:00 AM - 4:00 PM',
    },
    {
      title: 'IT Helpdesk',
      phone: '+1 234 567 8902',
      email: 'ithelpdesk@college.edu',
      hours: 'Mon-Sat, 8:00 AM - 6:00 PM',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'warning';
      case 'in-progress':
        return 'default';
      case 'resolved':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Support & Helpdesk</h1>
        <p className="text-muted-foreground mt-2">
          Get help and submit your queries
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {supportTickets.filter(t => t.status === 'open').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {supportTickets.filter(t => t.status === 'in-progress').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Being processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {supportTickets.filter(t => t.status === 'resolved').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="tickets">My Tickets ({supportTickets.length})</TabsTrigger>
          <TabsTrigger value="faq">FAQs ({faqs.length})</TabsTrigger>
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
        </TabsList>

        {/* My Tickets Tab */}
        <TabsContent value="tickets" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Submit New Ticket</CardTitle>
                  <CardDescription>Having an issue? Let us know</CardDescription>
                </div>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </div>
            </CardHeader>
          </Card>

          {supportTickets.map((ticket) => (
            <Card key={ticket.id} className={`border-l-4 ${
              ticket.status === 'resolved' ? 'border-l-green-500' :
              ticket.status === 'in-progress' ? 'border-l-blue-500' : 'border-l-orange-500'
            }`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                      <Badge variant={getPriorityColor(ticket.priority)} className="text-xs">
                        {ticket.priority}
                      </Badge>
                    </div>
                    <CardDescription>
                      Ticket No: {ticket.ticketNo} • Created on {new Date(ticket.createdDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(ticket.status)}>
                    {ticket.status.replace('-', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Category: {ticket.category}</p>
                  <p className="text-sm">{ticket.description}</p>
                </div>

                {ticket.response && (
                  <div className="p-4 rounded-lg bg-accent/50 border-l-2 border-l-primary">
                    <p className="text-xs text-muted-foreground mb-1">Response from Support Team:</p>
                    <p className="text-sm">{ticket.response}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Last updated: {new Date(ticket.lastUpdate).toLocaleDateString()}
                  </div>
                  {ticket.status === 'resolved' && ticket.resolvedDate && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Resolved on: {new Date(ticket.resolvedDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faq" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Find quick answers to common questions</CardDescription>
            </CardHeader>
          </Card>

          {faqs.map((faq) => (
            <Card key={faq.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                  <Badge variant="outline">{faq.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Contact Us Tab */}
        <TabsContent value="contact" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Get in touch with our support team</CardDescription>
            </CardHeader>
          </Card>

          {contactInfo.map((contact, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{contact.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{contact.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{contact.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Hours</p>
                    <p className="font-medium">{contact.hours}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
