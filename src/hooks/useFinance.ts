/**
 * Custom React Hooks for Finance Module
 */

import { useState, useEffect } from 'react';
import { financeReportsApi } from '../services/finance.service';
import type { DashboardStats } from '../types/finance.types';

interface UseQueryResult<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useFinanceDashboardStats = (): UseQueryResult<DashboardStats> => {
    const [data, setData] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await financeReportsApi.dashboard();
            setData(result);
        } catch (err: any) {
            setError(typeof err.message === 'string' ? err.message : 'Failed to fetch finance dashboard stats');
            // console.error('Fetch finance dashboard stats error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { data, isLoading, error, refetch: fetchData };
};
