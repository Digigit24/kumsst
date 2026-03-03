import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Building2, Loader2, MapPin, Package, Store, Users } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { API_ENDPOINTS, buildApiUrl, getDefaultHeaders } from '../../config/api.config';
import { useMemo, useState } from 'react';

const fetchStoreHierarchy = async () => {
    const url = buildApiUrl(API_ENDPOINTS.centralStores.hierarchy);
    const response = await fetch(url, {
        headers: getDefaultHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch store hierarchy');
    }

    return response.json();
};

export const StoreHierarchyPage = () => {
    const [selectedStore, setSelectedStore] = useState<any | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { data, isLoading, error } = useQuery({
        queryKey: ['store-hierarchy'],
        queryFn: fetchStoreHierarchy,
    });

    const stores = useMemo(() => (Array.isArray(data) ? data : (data?.results || [])), [data]);

    const centralStores = useMemo(
        () => stores.filter((store: any) => (store.store_type || '').toLowerCase().includes('central')),
        [stores]
    );

    const collegeStores = useMemo(
        () => stores.filter((store: any) => (store.store_type || '').toLowerCase().includes('college')),
        [stores]
    );

    const roots = centralStores.length ? centralStores : stores;

    const getChildrenForCentral = (central: any) => {
        const matches = collegeStores.filter(
            (store: any) =>
                store.central_store === central.id ||
                store.central_store_id === central.id ||
                store.parent_id === central.id
        );

        if (matches.length > 0) return matches;
        // If there is only one central store, assume all college stores belong to it
        if (centralStores.length === 1) return collegeStores;
        return [];
    };

    const openDetails = (store: any) => {
        setSelectedStore(store);
        setIsDialogOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center gap-4">
                <p className="text-destructive">Failed to load store hierarchy</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    // Assuming the API returns a structure where we can identify Central Stores vs others
    // Since we don't know the exact deeply nested structure, we'll assume a flat list or root objects
    // If the API returns a list, the first level are likely Central Stores.
    // However, the user request mentioned "Central Stores top, others bottom".
    // We will separate them if the data supports it, or just render prominently.

    // NOTE: Based on typical patterns, `data` might be a list of Central Stores, which contain 'colleges' or 'stores'
    // Or it might be a list where we filter by type.
    // For now, let's treat the root items as Central Stores.

    return (
        <div className="space-y-8 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Store Hierarchy</h1>
                    <p className="text-muted-foreground">
                        Visual overview of Central Stores and associated College Stores
                    </p>
                </div>
            </div>

            <div className="grid gap-8">
                {roots.map((store: any, index: number) => {
                    const children = getChildrenForCentral(store);

                    return (
                    <motion.div
                        key={`${store.store_type || 'store'}-${store.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                    >
                        {/* Central Store Card (Top Tier) */}
                        <div className="flex justify-center mb-8">
                            <Card className="w-full max-w-3xl border-primary/20 shadow-lg bg-gradient-to-b from-card to-secondary/10">
                                <CardHeader className="flex flex-row items-center gap-4 border-b bg-muted/30 pb-4">
                                    <div className="rounded-full bg-primary/10 p-3">
                                        <Building2 className="h-8 w-8 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xl text-primary">{store.name}</CardTitle>
                                            <Badge variant={store.is_active ? 'default' : 'secondary'}>
                                                {store.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <MapPin className="h-3 w-3" />
                                            {store.city}, {store.state} ({store.code})
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => openDetails(store)}>
                                            View Details
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid md:grid-cols-3 gap-4 pt-4">
                                    <div className="flex items-center gap-3 rounded-lg border p-3">
                                        <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-2">
                                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Manager</p>
                                            <p className="text-sm font-medium">{store.manager_name || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-lg border p-3">
                                        <div className="rounded-full bg-orange-100 dark:bg-orange-950 p-2">
                                            <Store className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Contact</p>
                                            <p className="text-sm font-medium">{store.contact_phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-lg border p-3">
                                        <div className="rounded-full bg-emerald-100 dark:bg-emerald-950 p-2">
                                            <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Total Stock Value</p>
                                            {/* Placeholder or real data if available */}
                                            <p className="text-sm font-medium">₹ {store.total_value?.toLocaleString() || '0'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Connector Line */}
                        {children.length > 0 && (
                            <div className="absolute left-1/2 -ml-0.5 top-[180px] h-12 w-0.5 bg-border -z-10" />
                        )}

                        {/* Second Tier - Connected Stores / Colleges */}
                        {children.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 mt-2 border-t relative">
                                {/* Horizontal Connector for branching */}
                                <div className="absolute top-0 left-10 right-10 h-px bg-border -mt-px" />

                                {children.map((linked: any) => (
                                    <div key={linked.id} className="relative pt-6">
                                        {/* Vertical line to item */}
                                        <div className="absolute top-0 left-1/2 -ml-0.5 h-6 w-0.5 bg-border" />

                                        <Card
                                            className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200/40 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20"
                                            onClick={() => openDetails(linked)}
                                        >
                                            <CardHeader className="pb-2 border-b border-blue-200/60 dark:border-blue-900/60">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-base">{linked.name}</CardTitle>
                                                        <p className="text-xs text-muted-foreground">
                                                            {linked.store_type || 'College Store'}
                                                            {linked.college_name ? ` • ${linked.college_name}` : ''}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/60">
                                                        <Store className="h-4 w-4 text-blue-700 dark:text-blue-200" />
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="text-sm">
                                                <p className="text-muted-foreground truncate">
                                                    {[linked.address_line1, linked.address_line2].filter(Boolean).join(', ')}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {linked.city ? `${linked.city}, ` : ''}
                                                    {linked.state || ''}
                                                </p>
                                                <div className="mt-3 flex items-center justify-between text-xs">
                                                    <span className="font-medium">{linked.contact_phone || 'No contact'}</span>
                                                    <Badge variant={linked.is_active ? 'success' : 'secondary'}>
                                                        {linked.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* If no linked stores structure is known yet, we assume a placeholder or simple grid for other properties */}
                        {children.length === 0 && (
                            <div className="text-center text-sm text-muted-foreground py-4">
                                No connected sub-stores found.
                            </div>
                        )}
                    </motion.div>
                );
                })}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Store className="h-5 w-5 text-primary" />
                            {selectedStore?.name || 'Store Details'}
                        </DialogTitle>
                        <DialogDescription>{selectedStore?.store_type || 'Store information'}</DialogDescription>
                    </DialogHeader>

                    {selectedStore && (
                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Code</p>
                                    <p className="font-medium">{selectedStore.code}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    <Badge variant={selectedStore.is_active ? 'success' : 'secondary'}>
                                        {selectedStore.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> Location
                                </p>
                                <p className="font-medium">
                                    {[selectedStore.address_line1, selectedStore.address_line2].filter(Boolean).join(', ')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {selectedStore.city}, {selectedStore.state} {selectedStore.pincode}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Contact Phone</p>
                                    <p className="font-medium">{selectedStore.contact_phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Contact Email</p>
                                    <p className="font-medium">{selectedStore.contact_email || 'N/A'}</p>
                                </div>
                            </div>

                            {selectedStore.manager_name && (
                                <div>
                                    <p className="text-xs text-muted-foreground">Manager</p>
                                    <p className="font-medium">{selectedStore.manager_name}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
