/**
 * Market Controller
 * Serves cryptocurrency market data from CoinGecko.
 */
const coinGeckoService = require('../services/coinGeckoService');
const { successResponse } = require('../utils/apiResponse');

/**
 * @swagger
 * /api/market/top:
 *   get:
 *     summary: Get top cryptocurrencies by market cap
 *     tags: [Market]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *           default: usd
 */
const getTopCoins = async (req, res, next) => {
    try {
        const { limit = 20, currency = 'usd' } = req.query;
        const data = await coinGeckoService.getTopCoins(currency, parseInt(limit));
        return successResponse(res, { coins: data });
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /api/market/history/{coinId}:
 *   get:
 *     summary: Get price history for a coin
 *     tags: [Market]
 *     parameters:
 *       - in: path
 *         name: coinId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 */
const getCoinHistory = async (req, res, next) => {
    try {
        const { coinId } = req.params;
        const { days = 7, currency = 'usd' } = req.query;
        const data = await coinGeckoService.getCoinHistory(coinId, parseInt(days), currency);
        return successResponse(res, data);
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /api/market/search:
 *   get:
 *     summary: Search for coins
 *     tags: [Market]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 */
const searchCoins = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) {
            return successResponse(res, { coins: [] });
        }
        const data = await coinGeckoService.searchCoins(q);
        return successResponse(res, { coins: data });
    } catch (error) {
        next(error);
    }
};

module.exports = { getTopCoins, getCoinHistory, searchCoins };
