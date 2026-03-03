import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TESTS: any[] = [];

const statusVariant: Record<string, 'success' | 'secondary' | 'destructive' | 'outline'> = {
  Excellent: 'success',
  Good: 'secondary',
  'Needs Attention': 'destructive',
  Outstanding: 'success',
  Average: 'secondary',
  'Below Average': 'destructive',
};

export const StudentTestMarks: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Test Performance</CardTitle>

      </CardHeader>
      <CardContent className="space-y-3">
        {TESTS.map((test) => (
          <div key={test.subject} className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">{test.subject}</p>
              <p className="text-sm text-muted-foreground">Score: {test.score}</p>
            </div>
            <Badge variant={statusVariant[test.status] || 'outline'}>{test.status}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
