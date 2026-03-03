/**
 * Watchlist Controller
 * Manages user's favourite asset watchlist.
 */
const Watchlist = require('../models/Watchlist');
const coinGeckoService = require('../services/coinGeckoService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @swagger
 * /api/watchlist:
 *   get:
 *     summary: Get user watchlist with current prices
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 */
const getWatchlist = async (req, res, next) => {
    try {
        let watchlist = await Watchlist.findOne({ user: req.user.id });
        if (!watchlist) {
            watchlist = await Watchlist.create({ user: req.user.id, items: [] });
        }

        // Enrich with current prices
        const enrichedItems = [];
        if (watchlist.items.length > 0) {
            const coinIds = watchlist.items
                .filter((i) => i.coinGeckoId)
                .map((i) => i.coinGeckoId);

            let prices = {};
            if (coinIds.length > 0) {
                try {
                    prices = await coinGeckoService.getCoinPrices(coinIds);
                } catch {
                    // Continue without prices if API fails
                }
            }

            for (const item of watchlist.items) {
                const priceData = prices[item.coinGeckoId];
                enrichedItems.push({
                    ...item.toObject(),
                    currentPrice: priceData?.usd || null,
                    priceChange24h: priceData?.usd_24h_change || null,
                    marketCap: priceData?.usd_market_cap || null,
                });
            }
        }

        return successResponse(res, {
            watchlist: { ...watchlist.toObject(), items: enrichedItems },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /api/watchlist:
 *   post:
 *     summary: Add item to watchlist
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 */
const addToWatchlist = async (req, res, next) => {
    try {
        const { symbol, name, type, coinGeckoId } = req.body;

        let watchlist = await Watchlist.findOne({ user: req.user.id });
        if (!watchlist) {
            watchlist = await Watchlist.create({ user: req.user.id, items: [] });
        }

        // Check for duplicate
        const exists = watchlist.items.some(
            (i) => i.symbol === symbol.toUpperCase()
        );
        if (exists) {
            return errorResponse(res, 'Asset already in watchlist', 400);
        }

        watchlist.items.push({ symbol, name, type, coinGeckoId });
        await watchlist.save();

        return successResponse(res, { watchlist }, 'Added to watchlist', 201);
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /api/watchlist/{itemId}:
 *   delete:
 *     summary: Remove item from watchlist
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 */
const removeFromWatchlist = async (req, res, next) => {
    try {
        const { itemId } = req.params;

        const watchlist = await Watchlist.findOne({ user: req.user.id });
        if (!watchlist) {
            return errorResponse(res, 'Watchlist not found', 404);
        }

        const item = watchlist.items.id(itemId);
        if (!item) {
            return errorResponse(res, 'Item not found in watchlist', 404);
        }

        item.deleteOne();
        await watchlist.save();

        return successResponse(res, { watchlist }, 'Removed from watchlist');
    } catch (error) {
        next(error);
    }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };
