/**
 * Grade Sheets Page
 */

import { useState } from 'react';
import { Column, DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/ui/badge';
import { useMarkSheets } from '../../hooks/useExamination';

const GradeSheetsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });

  // Fetch mark sheets using real API
  const { data, isLoading, error, refetch } = useMarkSheets(filters);

  const columns: Column<any>[] = [
    { key: 'student_roll_number', label: 'Roll No', sortable: true },
    { key: 'student_name', label: 'Student Name', sortable: true },
    { key: 'total_marks', label: 'Total Marks', sortable: true },
    {
      key: 'percentage',
      label: 'Percentage',
      render: (sheet) => <Badge variant="outline">{sheet.percentage}%</Badge>,
    },
    {
      key: 'grade',
      label: 'Grade',
      render: (sheet) => <Badge variant="default">{sheet.grade}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (sheet) => (
        <Badge variant={sheet.status === 'Passed' ? 'success' : 'destructive'}>
          {sheet.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="">
      <div>
        <h1 className="text-3xl font-bold">Grade Sheets</h1>
        <p className="text-muted-foreground">View student grade sheets</p>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={refetch}
        filters={filters}
        onFiltersChange={setFilters}
        searchPlaceholder="Search students..."
      />
    </div>
  );
};

export default GradeSheetsPage;
