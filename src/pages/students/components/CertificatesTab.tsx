/**
 * Certificates Tab Component
 * Displays and manages student certificates
 */

import { Award, CheckCircle2, Edit, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { EmptyState } from '../../../components/common/EmptyState';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { useCertificates, useDeleteCertificate } from '../../../hooks/useCertificates';
import type { Certificate, CertificateListItem } from '../../../types/students.types';
import { IssueCertificateDialog } from './IssueCertificateDialog';

interface CertificatesTabProps {
    studentId: number;
}

export const CertificatesTab: React.FC<CertificatesTabProps> = ({ studentId }) => {
    const { data, isLoading, error, refetch } = useCertificates({ student: studentId });
    const deleteMutation = useDeleteCertificate();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCertId, setSelectedCertId] = useState<number | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);

    const certificates: CertificateListItem[] = data?.results ?? [];


    const handleDelete = async () => {
        if (selectedCertId) {
            await deleteMutation.mutateAsync(selectedCertId);
            setSelectedCertId(null);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <Skeleton className="h-40 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        if (error || certificates.length === 0) {
            return (
                <Card>
                    <CardContent className="p-12">
                        <EmptyState
                            icon={Award}
                            title={error ? "Error Loading Certificates" : "No Certificates Issued"}
                            description={error ? "Failed to load certificates" : "Issue certificates like bonafide, transfer certificate, etc."}
                            action={{
                                label: 'Issue Certificate',
                                onClick: () => {
                                    setEditingCertificate(null);
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
                    <h3 className="text-lg font-semibold">Issued Certificates</h3>
                    <Button
                        size="sm"
                        onClick={() => {
                            setEditingCertificate(null);
                            setDrawerOpen(true);
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Issue Certificate
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certificates.map((cert, index) => (
                        <Card key={cert.id} className="animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-primary/10 rounded-lg">
                                            <Award className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold capitalize">{cert.certificate_type.replace(/_/g, ' ')}</h4>
                                            <p className="text-sm text-muted-foreground">{cert.certificate_number}</p>
                                        </div>
                                    </div>
                                    {cert.is_active && (
                                        <Badge variant="success" className="gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Active
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Issue Date</span>
                                        <span className="font-medium">{new Date(cert.issue_date).toLocaleDateString()}</span>
                                    </div>
                                    {cert.issue_date && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Issue Date</span>
                                            <span className="font-medium">
                                                {new Date(cert.issue_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
{/* 
                                    {cert.verification_code && (
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-xs text-muted-foreground mb-1">Verification Code</p>
                                            <code className="text-xs bg-muted px-2 py-1 rounded">{cert.verification_code.slice(0, 16)}...</code>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    {cert.certificate_file && (
                                        <Button variant="outline" size="sm" className="flex-1">
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                    )} */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-destructive"
                                        onClick={() => {
                                            setSelectedCertId(cert.id);
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
                                            setEditingCertificate(cert as Certificate);
                                            setDrawerOpen(true);
                                        }}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
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
                title="Delete Certificate"
                description="Are you sure you want to delete this certificate? This action cannot be undone."
                confirmLabel="Delete"
                onConfirm={handleDelete}
                loading={deleteMutation.isPending}
            />

            <IssueCertificateDialog
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                studentId={studentId}
                certificate={editingCertificate || undefined}
                onSuccess={refetch}
            />
        </>
    );
};
