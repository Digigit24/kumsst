/**
 * Promotions Tab Component
 * Displays and manages student promotions/class changes
 */

import React, { useState } from 'react';
import { TrendingUp, Plus, Eye, Calendar, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { EmptyState } from '../../../components/common/EmptyState';
import { SideDrawer, SideDrawerContent } from '../../../components/common/SideDrawer';
import { StudentPromotionForm } from './StudentPromotionForm';
import { useStudentPromotions } from '../../../hooks/useStudentPromotions';
import type { StudentPromotionListItem } from '../../../types/students.types';

interface PromotionsTabProps {
    studentId: number;
}

export const PromotionsTab: React.FC<PromotionsTabProps> = ({ studentId }) => {
    const { data, isLoading, error, refetch } = useStudentPromotions({ student: studentId });

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState<StudentPromotionListItem | undefined>();
    const [drawerMode, setDrawerMode] = useState<'view' | 'create' | 'edit'>('create');

    const promotions = data?.results || [];

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <Skeleton className="h-24 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        if (error || promotions.length === 0) {
            return (
                <Card>
                    <CardContent className="p-12">
                        <EmptyState
                            icon={TrendingUp}
                            title={error ? "Error Loading Promotions" : "No Promotions"}
                            description={error ? "Failed to load promotion history" : "Track student class promotions and academic progress."}
                            action={{
                                label: 'Add Promotion',
                                onClick: () => {
                                    setSelectedPromotion(undefined);
                                    setDrawerMode('create');
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
                    <h3 className="text-lg font-semibold">Promotion History</h3>
                    <Button
                        size="sm"
                        onClick={() => {
                            setSelectedPromotion(undefined);
                            setDrawerMode('create');
                            setDrawerOpen(true);
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Promotion
                    </Button>
                </div>

                <div className="space-y-4">
                    {promotions.map((promotion, index) => (
                        <Card key={promotion.id} variant="elevated" className="animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="p-3 bg-primary/10 rounded-lg">
                                            <TrendingUp className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    {promotion.from_class_name}
                                                    {promotion.from_section_name && ` - ${promotion.from_section_name}`}
                                                </Badge>
                                                <span className="text-muted-foreground">→</span>
                                                <Badge variant="default">
                                                    {promotion.to_class_name}
                                                    {promotion.to_section_name && ` - ${promotion.to_section_name}`}
                                                </Badge>
                                                {promotion.is_active && (
                                                    <Badge variant="success" className="ml-auto">Active</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(promotion.promotion_date).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <GraduationCap className="h-4 w-4" />
                                                    Academic Year: {promotion.academic_year_name || promotion.academic_year}
                                                </span>
                                            </div>
                                            {promotion.remarks && (
                                                <p className="text-sm text-muted-foreground italic">
                                                    "{promotion.remarks}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => {
                                            setSelectedPromotion(promotion);
                                            setDrawerMode('view');
                                            setDrawerOpen(true);
                                        }}
                                    >
                                        <Eye className="h-4 w-4" />
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

            <SideDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SideDrawerContent
                    title={drawerMode === 'create' ? 'Add Promotion' : 'Promotion Details'}
                    description="Manage student promotion records"
                    size="lg"
                >
                    <StudentPromotionForm
                        mode={drawerMode}
                        promotionId={selectedPromotion?.id}
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
