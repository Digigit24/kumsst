import React, { useState } from 'react';
import { FileText, Download, Clock, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Certificates: React.FC = () => {
  const [activeTab, setActiveTab] = useState('requests');

  // Mock data - Replace with actual API calls
  const certificateTypes = [
    { id: 1, name: 'Bonafide Certificate', processingDays: 3, fee: 50 },
    { id: 2, name: 'Transfer Certificate', processingDays: 7, fee: 100 },
    { id: 3, name: 'Character Certificate', processingDays: 5, fee: 50 },
    { id: 4, name: 'Course Completion Certificate', processingDays: 5, fee: 75 },
    { id: 5, name: 'Migration Certificate', processingDays: 10, fee: 150 },
  ];

  const myRequests = [
    {
      id: 1,
      type: 'Bonafide Certificate',
      requestDate: '2025-12-20',
      status: 'processing',
      estimatedDate: '2025-12-23',
      purpose: 'Bank Account Opening',
      fee: 50,
      paymentStatus: 'paid',
    },
    {
      id: 2,
      type: 'Character Certificate',
      requestDate: '2025-12-15',
      status: 'ready',
      completedDate: '2025-12-19',
      purpose: 'Job Application',
      fee: 50,
      paymentStatus: 'paid',
    },
  ];

  const issuedCertificates = [
    {
      id: 1,
      type: 'Bonafide Certificate',
      issueDate: '2025-11-10',
      certificateNo: 'BC2025001',
      validUntil: '2026-11-10',
      downloadUrl: '#',
    },
    {
      id: 2,
      type: 'Character Certificate',
      issueDate: '2025-10-05',
      certificateNo: 'CC2025001',
      validUntil: null,
      downloadUrl: '#',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'warning';
      case 'ready':
        return 'success';
      case 'rejected':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Certificates & Requests</h1>
        <p className="text-muted-foreground mt-2">
          Apply for and download your certificates
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myRequests.filter(r => r.status === 'processing').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">In processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Collect</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {myRequests.filter(r => r.status === 'ready').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Available now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issued Certificates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issuedCertificates.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total received</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="requests">My Requests ({myRequests.length})</TabsTrigger>
          <TabsTrigger value="issued">Issued ({issuedCertificates.length})</TabsTrigger>
          <TabsTrigger value="apply">Apply New</TabsTrigger>
        </TabsList>

        {/* My Requests Tab */}
        <TabsContent value="requests" className="space-y-4 mt-6">
          {myRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No certificate requests found</p>
                <Button className="mt-4" onClick={() => setActiveTab('apply')}>
                  Apply for Certificate
                </Button>
              </CardContent>
            </Card>
          ) : (
            myRequests.map((request) => (
              <Card key={request.id} className={`border-l-4 ${
                request.status === 'ready' ? 'border-l-green-500' : 'border-l-orange-500'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{request.type}</CardTitle>
                      <CardDescription>
                        Applied on {new Date(request.requestDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(request.status)}>
                      {request.status === 'processing' ? 'Processing' : 'Ready to Collect'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Purpose</p>
                      <p className="font-medium">{request.purpose}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fee</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">₹{request.fee}</p>
                        <Badge variant="success" className="text-xs">Paid</Badge>
                      </div>
                    </div>
                    {request.status === 'processing' && (
                      <div>
                        <p className="text-sm text-muted-foreground">Estimated Completion</p>
                        <p className="font-medium">
                          {request.estimatedDate
                            ? new Date(request.estimatedDate).toLocaleDateString()
                            : 'TBD'}
                        </p>
                      </div>
                    )}
                    {request.status === 'ready' && (
                      <div>
                        <p className="text-sm text-muted-foreground">Completed On</p>
                        <p className="font-medium">{new Date(request.completedDate!).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                  {request.status === 'ready' && (
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificate
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Issued Certificates Tab */}
        <TabsContent value="issued" className="space-y-4 mt-6">
          {issuedCertificates.map((certificate) => (
            <Card key={certificate.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{certificate.type}</CardTitle>
                    <CardDescription>
                      Issued on {new Date(certificate.issueDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="success">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Issued
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Certificate No.</p>
                    <p className="font-medium">{certificate.certificateNo}</p>
                  </div>
                  {certificate.validUntil && (
                    <div>
                      <p className="text-sm text-muted-foreground">Valid Until</p>
                      <p className="font-medium">{new Date(certificate.validUntil).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Certificate
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Apply New Tab */}
        <TabsContent value="apply" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Certificates</CardTitle>
              <CardDescription>Select a certificate type to apply</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {certificateTypes.map((certificate) => (
                  <div key={certificate.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium">{certificate.name}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {certificate.processingDays} days
                        </span>
                        <span>Fee: ₹{certificate.fee}</span>
                      </div>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Apply
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
