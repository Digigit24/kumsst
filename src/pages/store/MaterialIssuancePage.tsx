/**
 * Material Issuance Page (CEO Only)
 * Super admins can issue materials from central store to colleges
 */

import { Send, FileText, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Column, DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { useStoreIndents, useIssueMaterials } from '../../hooks/useStoreIndents';

export const MaterialIssuancePage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({
    page: 1,
    page_size: 10,
    status: 'super_admin_approved',
  });
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [selectedIndent, setSelectedIndent] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemQuantities, setItemQuantities] = useState<Record<number, number>>({});

  const { data, isLoading, refetch } = useStoreIndents(filters);
  const issueMutation = useIssueMaterials();

  const handleIssueClick = (indent: any) => {
    setSelectedIndent(indent);
    setIssueDate(new Date().toISOString().split('T')[0]);
    // Initialize quantities with requested quantities
    const quantities: Record<number, number> = {};
    indent.items?.forEach((item: any) => {
      quantities[item.id] = item.requested_quantity || 0;
    });
    setItemQuantities(quantities);
    setIssueDialogOpen(true);
  };

  const handleIssueConfirm = async () => {
    if (!selectedIndent) return;

    // Prepare items data
    const items = selectedIndent.items?.map((item: any) => ({
      central_store_item: item.central_store_item,
      quantity_issued: itemQuantities[item.id] || 0,
    }));

    try {
      await issueMutation.mutateAsync({
        id: selectedIndent.id,
        data: {
          issue_date: issueDate,
          items,
        },
      });
      toast.success('Materials issued successfully');
      setIssueDialogOpen(false);
      setSelectedIndent(null);
      setItemQuantities({});
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to issue materials');
    }
  };

  const handleViewDetails = (indent: any) => {
    setSelectedIndent(indent);
    setViewDialogOpen(true);
  };

  const handleQuantityChange = (itemId: number, value: string) => {
    const numValue = parseInt(value) || 0;
    setItemQuantities((prev) => ({
      ...prev,
      [itemId]: numValue,
    }));
  };

  const getPriorityVariant = (priority: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      low: 'secondary',
      medium: 'default',
      high: 'outline',
      urgent: 'destructive',
    };
    return variants[priority] || 'default';
  };

  const columns: Column<any>[] = [
    {
      key: 'indent_number',
      label: 'Indent Number',
      render: (row) => <span className="font-semibold">{row.indent_number}</span>,
      sortable: true,
    },
    {
      key: 'college',
      label: 'College',
      render: (row) => `College #${row.college}`,
    },
    {
      key: 'required_by_date',
      label: 'Required By',
      render: (row) => new Date(row.required_by_date).toLocaleDateString(),
      sortable: true,
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (row) => (
        <Badge variant={getPriorityVariant(row.priority)} className="capitalize">
          {row.priority}
        </Badge>
      ),
    },
    {
      key: 'items_count',
      label: 'Items',
      render: (row) => row.items?.length || 0,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.status.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleViewDetails(row)}>
            <FileText className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button size="sm" onClick={() => handleIssueClick(row)}>
            <Send className="h-4 w-4 mr-1" />
            Issue Materials
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Material Issuance</h1>
          <p className="text-muted-foreground">
            Issue materials from central store to colleges
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        onPageChange={(page: number) => setFilters({ ...filters, page })}
      />

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-w-[95vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Indent Details</DialogTitle>
          </DialogHeader>
          {selectedIndent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Indent Number</Label>
                  <p className="font-semibold">{selectedIndent.indent_number}</p>
                </div>
                <div>
                  <Label>College</Label>
                  <p>College #{selectedIndent.college}</p>
                </div>
                <div>
                  <Label>Required By</Label>
                  <p>{new Date(selectedIndent.required_by_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge variant={getPriorityVariant(selectedIndent.priority)} className="capitalize">
                    {selectedIndent.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Justification</Label>
                <p className="text-sm">{selectedIndent.justification}</p>
              </div>

              <div>
                <Label>Items Requested</Label>
                <div className="border rounded-md mt-2">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Item</th>
                        <th className="p-2 text-right">Quantity</th>
                        <th className="p-2 text-left">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedIndent.items?.map((item: any, index: number) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">Item #{item.central_store_item}</td>
                          <td className="p-2 text-right">{item.requested_quantity}</td>
                          <td className="p-2">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Issue Materials Dialog */}
      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-w-[95vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Issue Materials</DialogTitle>
          </DialogHeader>
          {selectedIndent && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <p className="font-semibold">Indent: {selectedIndent.indent_number}</p>
                <p className="text-sm text-muted-foreground">College #{selectedIndent.college}</p>
              </div>

              <div>
                <Label required>Issue Date</Label>
                <Input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>

              <div>
                <Label>Items to Issue</Label>
                <div className="border rounded-md mt-2">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Item</th>
                        <th className="p-2 text-right">Requested</th>
                        <th className="p-2 text-left">Unit</th>
                        <th className="p-2 text-right">Issue Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedIndent.items?.map((item: any, index: number) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">Item #{item.central_store_item}</td>
                          <td className="p-2 text-right">{item.requested_quantity}</td>
                          <td className="p-2">{item.unit}</td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="0"
                              max={item.requested_quantity}
                              value={itemQuantities[item.id] || 0}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              className="w-24 text-right"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Adjust the issue quantities as needed (cannot exceed requested quantity)
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleIssueConfirm}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Issue Materials
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
