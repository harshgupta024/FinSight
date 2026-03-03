/**
 * CoinGecko Service
 * Fetches cryptocurrency data from the CoinGecko API with caching.
 */
const axios = require('axios');
const config = require('../config');
const cacheService = require('./cacheService');

const BASE_URL = config.coinGeckoUrl;

const coinGeckoService = {
    /**
     * Get top coins by market cap
     * @param {string} currency - Target currency (default: 'usd')
     * @param {number} limit - Number of coins (default: 20)
     */
    async getTopCoins(currency = 'usd', limit = 20) {
        const cacheKey = `top_coins_${currency}_${limit}`;
        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        const { data } = await axios.get(`${BASE_URL}/coins/markets`, {
            params: {
                vs_currency: currency,
                order: 'market_cap_desc',
                per_page: limit,
                page: 1,
                sparkline: false,
                price_change_percentage: '24h,7d',
            },
        });

        cacheService.set(cacheKey, data, 300); // 5-min cache
        return data;
    },

    /**
     * Get price history for a specific coin
     * @param {string} coinId - CoinGecko coin ID (e.g., 'bitcoin')
     * @param {number} days - Number of days of history (default: 7)
     * @param {string} currency - Target currency (default: 'usd')
     */
    async getCoinHistory(coinId, days = 7, currency = 'usd') {
        const cacheKey = `coin_history_${coinId}_${days}_${currency}`;
        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        const { data } = await axios.get(
            `${BASE_URL}/coins/${coinId}/market_chart`,
            {
                params: {
                    vs_currency: currency,
                    days,
                },
            }
        );

        // Transform prices array into chart-friendly format
        const transformed = {
            prices: data.prices.map(([timestamp, price]) => ({
                date: new Date(timestamp).toLocaleDateString(),
                price: Math.round(price * 100) / 100,
            })),
            marketCaps: data.market_caps.map(([timestamp, cap]) => ({
                date: new Date(timestamp).toLocaleDateString(),
                marketCap: Math.round(cap),
            })),
        };

        cacheService.set(cacheKey, transformed, 300);
        return transformed;
    },

    /**
     * Get current price for specific coins
     * @param {string[]} coinIds - Array of CoinGecko coin IDs
     * @param {string} currency - Target currency (default: 'usd')
     */
    async getCoinPrices(coinIds, currency = 'usd') {
        const idsStr = coinIds.join(',');
        const cacheKey = `coin_prices_${idsStr}_${currency}`;
        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        const { data } = await axios.get(`${BASE_URL}/simple/price`, {
            params: {
                ids: idsStr,
                vs_currencies: currency,
                include_24hr_change: true,
                include_market_cap: true,
            },
        });

        cacheService.set(cacheKey, data, 120); // 2-min cache for prices
        return data;
    },

    /**
     * Search coins by query
     * @param {string} query
     */
    async searchCoins(query) {
        const cacheKey = `search_${query}`;
        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        const { data } = await axios.get(`${BASE_URL}/search`, {
            params: { query },
        });

        cacheService.set(cacheKey, data.coins?.slice(0, 20) || [], 600);
        return data.coins?.slice(0, 20) || [];
    },
};

module.exports = coinGeckoService;
