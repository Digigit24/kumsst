/**
 * Tabulation Sheets Page
 * Admin view for tabulation sheets
 */

import { useState } from 'react';
import { Column, DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/ui/badge';
import { Download } from 'lucide-react';
import { useTabulationSheets } from '../../hooks/useExamination';

const TabulationSheetsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });

  // Fetch tabulation sheets using real API
  const { data, isLoading, error, refetch } = useTabulationSheets(filters);

  const columns: Column<any>[] = [
    { key: 'exam_name', label: 'Exam', sortable: true },
    { key: 'class_name', label: 'Class', sortable: true },
    { key: 'section_name', label: 'Section', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (sheet) => (
        <Badge variant={sheet.status === 'finalized' ? 'success' : 'outline'}>
          {sheet.status || 'Draft'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="">
      <DataTable
        title="Tabulation Sheets"
        description="View and manage exam tabulation sheets"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={refetch}
        filters={filters}
        onFiltersChange={setFilters}
        searchPlaceholder="Search tabulation sheets..."
      />
    </div>
  );
};

export default TabulationSheetsPage;
