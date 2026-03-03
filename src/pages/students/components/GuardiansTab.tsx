/**
 * Guardians Tab Component
 * Displays and manages student guardians with full CRUD
 */

import React, { useState } from 'react';
import { User, Phone, Mail, Plus, Edit, Trash2, Star } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { EmptyState } from '../../../components/common/EmptyState';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { GuardianDialog } from './GuardianDialog';
import { useStudentGuardians, useDeleteStudentGuardian } from '../../../hooks/useStudentGuardians';
import type { StudentGuardianListItem } from '../../../types/students.types';

interface GuardiansTabProps {
    studentId: number;
}

export const GuardiansTab: React.FC<GuardiansTabProps> = ({ studentId }) => {
    const { data, isLoading, error, refetch } = useStudentGuardians({ student: studentId });
    const deleteMutation = useDeleteStudentGuardian();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedGuardian, setSelectedGuardian] = useState<StudentGuardianListItem | null>(null);
    const [guardianDialogOpen, setGuardianDialogOpen] = useState(false);
    const [editingGuardian, setEditingGuardian] = useState<StudentGuardianListItem | undefined>();

    const guardians = data?.results || [];

    const handleDelete = async () => {
        if (selectedGuardian) {
            await deleteMutation.mutateAsync(selectedGuardian.id);
            setSelectedGuardian(null);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <Skeleton className="h-16 w-16 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        if (error) {
            return (
                <Card>
                    <CardContent className="p-12">
                        <EmptyState
                            icon={User}
                            title="Error Loading Guardians"
                            description="Failed to load guardian information. Please try again."
                        />
                    </CardContent>
                </Card>
            );
        }

        if (guardians.length === 0) {
            return (
                <Card>
                    <CardContent className="p-12">
                        <EmptyState
                            icon={User}
                            title="No Guardians Added"
                            description="Add guardian information to maintain emergency contacts and family details."
                            action={{
                                label: 'Add Guardian',
                                onClick: () => {
                                    setEditingGuardian(undefined);
                                    setGuardianDialogOpen(true);
                                },
                            }}
                        />
                    </CardContent>
                </Card>
            );
        }

        return (
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Guardian Information</h3>
                    <Button size="sm" onClick={() => { setEditingGuardian(undefined); setGuardianDialogOpen(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Guardian
                    </Button>
                </div>

                {/* Guardians Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {guardians.map((sg, index) => {
                        const guardian = sg.guardian_details;
                        if (!guardian) {
                            return null;
                        }
                        return (
                            <Card
                                key={sg.id}
                                variant="elevated"
                                className="overflow-hidden animate-slide-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <Avatar className="h-16 w-16 border-2 border-background">
                                            <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                                                {getInitials(guardian.full_name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        {/* Guardian Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-semibold truncate">{guardian.full_name}</h4>
                                                {sg.is_primary && (
                                                    <Badge variant="default" className="gap-1">
                                                        <Star className="h-3 w-3" />
                                                        Primary
                                                    </Badge>
                                                )}
                                                {sg.is_emergency_contact && (
                                                    <Badge variant="warning">Emergency</Badge>
                                                )}
                                            </div>

                                            <p className="text-sm text-muted-foreground capitalize mb-3">
                                                {guardian.relation}
                                            </p>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <span>{guardian.phone}</span>
                                                </div>
                                                {guardian.email && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                                        <span className="truncate">{guardian.email}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {guardian.occupation && (
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    {guardian.occupation}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => { setEditingGuardian(sg); setGuardianDialogOpen(true); }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => {
                                                    setSelectedGuardian(sg);
                                                    setDeleteDialogOpen(true);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
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
                title="Remove Guardian"
                description={`Are you sure you want to remove ${selectedGuardian?.guardian_details?.full_name || 'this guardian'} as a guardian? This action cannot be undone.`}
                confirmLabel="Remove"
                onConfirm={handleDelete}
                loading={deleteMutation.isPending}
            />

            <GuardianDialog
                open={guardianDialogOpen}
                onOpenChange={setGuardianDialogOpen}
                studentId={studentId}
                guardian={editingGuardian}
                onSuccess={refetch}
            />
        </>
    );
};
