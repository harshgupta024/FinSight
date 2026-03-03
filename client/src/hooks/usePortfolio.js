import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const usePortfolio = () => {
    const [portfolio, setPortfolio] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPortfolio = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/portfolio');
            setPortfolio(data.data.portfolio);
            setSummary(data.data.summary);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch portfolio');
        } finally {
            setLoading(false);
        }
    }, []);

    const addAsset = useCallback(async (assetData) => {
        const { data } = await api.post('/portfolio/asset', assetData);
        await fetchPortfolio();
        return data;
    }, [fetchPortfolio]);

    const updateAsset = useCallback(async (assetId, assetData) => {
        const { data } = await api.put(`/portfolio/asset/${assetId}`, assetData);
        await fetchPortfolio();
        return data;
    }, [fetchPortfolio]);

    const deleteAsset = useCallback(async (assetId) => {
        const { data } = await api.delete(`/portfolio/asset/${assetId}`);
        await fetchPortfolio();
        return data;
    }, [fetchPortfolio]);

    useEffect(() => {
        fetchPortfolio();
    }, [fetchPortfolio]);

    return { portfolio, summary, loading, error, fetchPortfolio, addAsset, updateAsset, deleteAsset };
};
