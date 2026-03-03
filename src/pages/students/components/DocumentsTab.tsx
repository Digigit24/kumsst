/**
 * Documents Tab Component
 * Displays and manages student documents
 */

import React, { useState } from 'react';
import { FileText, Download, Trash2, Plus, Shield, File, Edit } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { EmptyState } from '../../../components/common/EmptyState';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { UploadDocumentDialog } from './UploadDocumentDialog';
import { useStudentDocuments, useDeleteStudentDocument } from '../../../hooks/useStudentDocuments';
import type { StudentDocumentListItem } from '../../../types/students.types';

interface DocumentsTabProps {
    studentId: number;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({ studentId }) => {
    const { data, isLoading, error, refetch } = useStudentDocuments({ student: studentId });
    const deleteMutation = useDeleteStudentDocument();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState<StudentDocumentListItem | null>(null);

    const documents = data?.results || [];

    const handleDelete = async () => {
        if (selectedDocId) {
            await deleteMutation.mutateAsync(selectedDocId);
            setSelectedDocId(null);
        }
    };

    const getDocumentIcon = (type: string) => {
        const icons: Record<string, any> = {
            aadhar: Shield,
            pan: Shield,
            marksheet: FileText,
            certificate: FileText,
        };
        return icons[type] || File;
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <Skeleton className="h-32 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        if (error || documents.length === 0) {
            return (
                <Card>
                    <CardContent className="p-12">
                        <EmptyState
                            icon={FileText}
                            title={error ? "Error Loading Documents" : "No Documents"}
                            description={error ? "Failed to load documents" : "Upload student documents like ID proofs, certificates, etc."}
                            action={{
                                label: 'Upload Document',
                                onClick: () => {
                                    setEditingDocument(null);
                                    setDrawerOpen(true);
                                },
                            }}
                        />
                    </CardContent>
                </Card>
            );
        }

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Documents</h3>
                    <Button
                        size="sm"
                        onClick={() => {
                            setEditingDocument(null);
                            setDrawerOpen(true);
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Upload
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((doc, index) => {
                        const Icon = getDocumentIcon(doc.document_type);
                        return (
                            <Card key={doc.id} variant="elevated" className="animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-primary/10 rounded-lg">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex gap-1">
                                            {doc.is_verified && (
                                                <Badge variant="success" className="text-xs">Verified</Badge>
                                            )}
                                            <Badge variant="outline" className="text-xs capitalize">{doc.document_type}</Badge>
                                        </div>
                                    </div>
                                    <h4 className="font-semibold mb-2 line-clamp-2">{doc.document_name}</h4>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        Uploaded {new Date(doc.uploaded_date).toLocaleDateString()}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="flex-1">
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-destructive"
                                            onClick={() => {
                                                setSelectedDocId(doc.id);
                                                setDeleteDialogOpen(true);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9"
                                            onClick={() => {
                                                setEditingDocument(doc);
                                                setDrawerOpen(true);
                                            }}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <>
            {renderContent()}

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Document"
                description="Are you sure you want to delete this document? This action cannot be undone."
                confirmLabel="Delete"
                onConfirm={handleDelete}
                loading={deleteMutation.isPending}
            />

            <UploadDocumentDialog
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                studentId={studentId}
                document={editingDocument || undefined}
                onSuccess={refetch}
            />
        </>
    );
};
