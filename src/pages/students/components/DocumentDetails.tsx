import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStudentDocument } from '@/hooks/useStudentDocuments';
import { Edit, FileText, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { isSuperAdmin } from '@/utils/auth.utils';
import { getMediaBaseUrl } from '@/config/api.config';

interface DocumentDetailsProps {
    documentId: number;
    onEdit: () => void;
}

export const DocumentDetails = ({ documentId, onEdit }: DocumentDetailsProps) => {
    const { data: document, isLoading, error } = useStudentDocument(documentId);
    const { user } = useAuth();
    const isSuper = isSuperAdmin(user as any);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !document) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-destructive/10 p-3 rounded-full mb-3">
                    <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <p className="text-muted-foreground">Failed to load document details</p>
            </div>
        );
    }

    const mediaBaseUrl = getMediaBaseUrl();
    const fileUrl = document.document_file ?
        (document.document_file.startsWith('http') ? document.document_file : `${mediaBaseUrl}${document.document_file}`)
        : null;

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-end gap-2">
                <Button onClick={onEdit} size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Document
                </Button>
            </div>

            {/* Basic Information */}
            <div className="bg-muted/30 p-4 rounded-lg border">
                <h3 className="font-semibold mb-4 text-primary flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Document Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">Document Name</label>
                        <p className="font-medium">{document.document_name}</p>
                    </div>

                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">Document Type</label>
                        {fileUrl ? (
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block hover:opacity-80 transition-opacity"
                                title="Click to view document"
                            >
                                <Badge variant="outline" className="cursor-pointer bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary gap-1">
                                    {document.document_type}
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                </Badge>
                            </a>
                        ) : (
                            <Badge variant="outline">
                                {document.document_type}
                            </Badge>
                        )}
                    </div>

                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">Student</label>
                        <p className="font-medium">{document.student_name}</p>
                    </div>

                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">Uploaded Date</label>
                        <p className="font-medium">{new Date(document.uploaded_date).toLocaleDateString()}</p>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <label className="text-xs text-muted-foreground block mb-1">Notes</label>
                        <p className="text-sm bg-background p-2 rounded border min-h-[60px]">
                            {document.notes || <span className="text-muted-foreground italic">No notes provided</span>}
                        </p>
                    </div>
                </div>
            </div>

            {/* Verification Status */}
            <div className="bg-muted/30 p-4 rounded-lg border">
                <h3 className="font-semibold mb-4 text-primary flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verification Status
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">Status</label>
                        <div className="mt-1">
                            {document.is_verified ? (
                                <Badge variant="success" className="flex w-fit items-center gap-1">
                                    <CheckCircle className="h-3 w-3" /> Verified
                                </Badge>
                            ) : (
                                <Badge variant="secondary">Pending Verification</Badge>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">Active Status</label>
                        <div className="mt-1">
                            {document.is_active ? (
                                <Badge variant="default">Active</Badge>
                            ) : (
                                <Badge variant="destructive">Inactive</Badge>
                            )}
                        </div>
                    </div>

                    {document.is_verified && (
                        <>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Verified By</label>
                                <p className="font-medium">
                                    {document.verified_by_details?.full_name || document.verified_by || '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Verified Date</label>
                                <p className="font-medium">
                                    {document.verified_date ? new Date(document.verified_date).toLocaleDateString() : '-'}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Audit Information */}
            <div className="bg-muted/30 p-4 rounded-lg border">
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Audit Information</h3>
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <div>
                        <label className="block mb-1">Created At</label>
                        <p>{new Date(document.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                        <label className="block mb-1">Updated At</label>
                        <p>{new Date(document.updated_at).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
