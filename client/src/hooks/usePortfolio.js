/**
 * usePortfolio — TanStack Query version
 * useQuery for fetching, useMutation for add/update/delete with cache invalidation
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

const PORTFOLIO_KEY = ['portfolio'];

export const usePortfolio = () => {
    const queryClient = useQueryClient();

    /* ── Fetch portfolio ── */
    const {
        data: rawData,
        isLoading: loading,
        error,
        refetch: fetchPortfolio,
    } = useQuery({
        queryKey: PORTFOLIO_KEY,
        queryFn: async () => {
            const { data } = await api.get('/portfolio');
            return data.data;
        },
        staleTime: 30_000,
        select: (data) => ({
            portfolio: data?.portfolio || data || { assets: [] },
            summary: data?.summary || null,
        }),
    });

    const portfolio = rawData?.portfolio || { assets: [] };
    const summary = rawData?.summary || null;

    /* ── Add asset ── */
    const addMutation = useMutation({
        mutationFn: (assetData) => api.post('/portfolio/asset', assetData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEY });
            toast.success('Asset added!');
        },
    });

    /* ── Update asset ── */
    const updateMutation = useMutation({
        mutationFn: ({ assetId, assetData }) => api.put(`/portfolio/asset/${assetId}`, assetData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEY });
            toast.success('Asset updated!');
        },
    });

    /* ── Delete asset ── */
    const deleteMutation = useMutation({
        mutationFn: (assetId) => api.delete(`/portfolio/asset/${assetId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEY });
            toast.success('Asset removed');
        },
    });

    return {
        portfolio,
        summary,
        loading,
        error: error?.message || null,
        fetchPortfolio,
        addAsset: addMutation.mutateAsync,
        updateAsset: (assetId, assetData) => updateMutation.mutateAsync({ assetId, assetData }),
        deleteAsset: deleteMutation.mutateAsync,
        isAdding: addMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
};
