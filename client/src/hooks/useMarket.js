import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useMarket = () => {
    const [topCoins, setTopCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTopCoins = useCallback(async (limit = 20) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/market/top?limit=${limit}`);
            setTopCoins(data.data.coins);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch market data');
        } finally {
            setLoading(false);
        }
    }, []);

    const getCoinHistory = useCallback(async (coinId, days = 7) => {
        const { data } = await api.get(`/market/history/${coinId}?days=${days}`);
        return data.data;
    }, []);

    const searchCoins = useCallback(async (query) => {
        const { data } = await api.get(`/market/search?q=${query}`);
        return data.data.coins;
    }, []);

    useEffect(() => {
        fetchTopCoins();
    }, [fetchTopCoins]);

    return { topCoins, loading, error, fetchTopCoins, getCoinHistory, searchCoins };
};
