/**
 * Loading Components for Lazy Loading
 */

import React from 'react';

/**
 * Page Loading Spinner - Full screen
 */
export const PageLoader: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
            </div>
        </div>
    );
};

/**
 * Component Loading Spinner - Inline
 */
export const ComponentLoader: React.FC = () => {
    return (
        <div className="flex items-center justify-center py-8">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-xs text-muted-foreground">Loading component...</p>
            </div>
        </div>
    );
};

/**
 * Skeleton Loader - For content
 */
export const SkeletonLoader: React.FC = () => {
    return (
        <div className="animate-pulse space-y-4 p-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
        </div>
    );
};

/**
 * Table Skeleton Loader
 */
export const TableSkeletonLoader: React.FC = () => {
    return (
        <div className="animate-pulse space-y-3 p-4">
            {/* Header */}
            <div className="flex gap-4 mb-4">
                <div className="h-10 bg-muted rounded flex-1"></div>
                <div className="h-10 bg-muted rounded flex-1"></div>
                <div className="h-10 bg-muted rounded flex-1"></div>
            </div>
            {/* Rows */}
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                    <div className="h-12 bg-muted rounded flex-1"></div>
                    <div className="h-12 bg-muted rounded flex-1"></div>
                    <div className="h-12 bg-muted rounded flex-1"></div>
                </div>
            ))}
        </div>
    );
};

/**
 * Card Skeleton Loader
 */
export const CardSkeletonLoader: React.FC = () => {
    return (
        <div className="animate-pulse space-y-4 p-6 border rounded-lg">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
        </div>
    );
};