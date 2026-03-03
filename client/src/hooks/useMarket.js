/**
 * useMarket — TanStack Query version
 * Auto-refetches market data every 60s for live prices
 */
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const MARKET_KEY = ['market', 'top'];

export const useMarket = (limit = 20) => {
    const {
        data: topCoins = [],
        isLoading: loading,
        error,
        refetch: fetchTopCoins,
    } = useQuery({
        queryKey: [...MARKET_KEY, limit],
        queryFn: async () => {
            const { data } = await api.get(`/market/top?limit=${limit}`);
            const responseData = data?.data;
            const coins = Array.isArray(responseData)
                ? responseData
                : Array.isArray(responseData?.coins)
                    ? responseData.coins
                    : [];
            return coins;
        },
        staleTime: 30_000,
        refetchInterval: 60_000,   // re-fetch every 60s for live data
    });

    /* Search coins (ad-hoc, not cached as a query) */
    const searchCoins = async (query) => {
        const { data } = await api.get(`/market/search?q=${encodeURIComponent(query)}`);
        const responseData = data?.data;
        return Array.isArray(responseData)
            ? responseData
            : Array.isArray(responseData?.coins)
                ? responseData.coins
                : [];
    };

    /* Get coin price history (ad-hoc) */
    const getCoinHistory = async (coinId, days = 7) => {
        const { data } = await api.get(`/market/history/${coinId}?days=${days}`);
        return data?.data;
    };

    return {
        topCoins,
        loading,
        error: error?.message || null,
        fetchTopCoins,
        searchCoins,
        getCoinHistory,
    };
};
