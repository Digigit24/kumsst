/**
 * Address Tab Component
 * Displays and manages student addresses
 */

import { Edit, Home, MapPin, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { EmptyState } from '../../../components/common/EmptyState';
import { SideDrawer, SideDrawerContent } from '../../../components/common/SideDrawer';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { useDeleteStudentAddress, useStudentAddresses } from '../../../hooks/useStudentAddresses';
import type { StudentAddressListItem } from '../../../types/students.types';
import { StudentAddressForm } from './StudentAddressForm';

interface AddressTabProps {
    studentId: number;
}

export const AddressTab: React.FC<AddressTabProps> = ({ studentId }) => {
    const { data, isLoading, error, refetch } = useStudentAddresses({ student: studentId });
    const deleteMutation = useDeleteStudentAddress();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<StudentAddressListItem | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<StudentAddressListItem | undefined>();

    const addresses = data?.results || [];

    const handleDelete = async () => {
        if (selectedAddress) {
            await deleteMutation.mutateAsync(selectedAddress.id);
            setSelectedAddress(null);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <Skeleton className="h-32 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        if (error || addresses.length === 0) {
            return (
                <Card>
                    <CardContent className="p-12">
                        <EmptyState
                            icon={MapPin}
                            title={error ? "Error Loading Addresses" : "No Addresses"}
                            description={error ? "Failed to load addresses" : "Add student addresses like permanent, current, or hostel addresses."}
                            action={{
                                label: 'Add Address',
                                onClick: () => {
                                    setEditingAddress(undefined);
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
                    <h3 className="text-lg font-semibold">Addresses</h3>
                    <Button
                        size="sm"
                        onClick={() => {
                            setEditingAddress(undefined);
                            setDrawerOpen(true);
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Address
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address, index) => (
                        <Card key={address.id} variant="elevated" className="animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-primary/10 rounded-lg">
                                            <Home className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <Badge variant="outline" className="capitalize">
                                                {address.address_type}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => {
                                                setEditingAddress(address);
                                                setDrawerOpen(true);
                                            }}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive"
                                            onClick={() => {
                                                setSelectedAddress(address);
                                                setDeleteDialogOpen(true);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="font-medium">{address.address_line1}</p>
                                    {address.address_line2 && (
                                        <p className="text-sm text-muted-foreground">{address.address_line2}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        {address.city}, {address.state} - {address.pincode}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{address.country}</p>
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
                title="Delete Address"
                description="Are you sure you want to delete this address? This action cannot be undone."
                confirmLabel="Delete"
                onConfirm={handleDelete}
                loading={deleteMutation.isPending}
            />

            <SideDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SideDrawerContent
                    title={editingAddress ? 'Edit Address' : 'Add Address'}
                    description="Manage student address information"
                    size="md"
                >
                    <StudentAddressForm
                        mode={editingAddress ? 'edit' : 'create'}
                        studentId={studentId}
                        address={editingAddress}
                        onSuccess={() => {
                            refetch();
                            setDrawerOpen(false);
                        }}
                        onCancel={() => setDrawerOpen(false)}
                    />
                </SideDrawerContent>
            </SideDrawer>
        </>
    );
};
