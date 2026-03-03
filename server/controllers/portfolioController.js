/**
 * Portfolio Controller
 * CRUD operations for user portfolio assets.
 */
const Portfolio = require('../models/Portfolio');
const coinGeckoService = require('../services/coinGeckoService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @swagger
 * /api/portfolio:
 *   get:
 *     summary: Get user portfolio with real-time values
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 */
const getPortfolio = async (req, res, next) => {
    try {
        let portfolio = await Portfolio.findOne({ user: req.user.id });

        if (!portfolio) {
            portfolio = await Portfolio.create({ user: req.user.id, assets: [] });
        }

        // Enrich with real-time prices
        const enrichedAssets = [];
        if (portfolio.assets.length > 0) {
            const coinIds = portfolio.assets
                .filter((a) => a.type === 'crypto')
                .map((a) => a.symbol.toLowerCase());

            let prices = {};
            if (coinIds.length > 0) {
                try {
                    prices = await coinGeckoService.getCoinPrices(coinIds);
                } catch {
                    // If API fails, continue without real-time prices
                }
            }

            for (const asset of portfolio.assets) {
                const priceData = prices[asset.symbol.toLowerCase()];
                const currentPrice = priceData?.usd || asset.avgBuyPrice;
                const currentValue = asset.quantity * currentPrice;
                const totalCost = asset.quantity * asset.avgBuyPrice;
                const gainLoss = currentValue - totalCost;
                const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

                enrichedAssets.push({
                    ...asset.toObject(),
                    currentPrice,
                    currentValue: Math.round(currentValue * 100) / 100,
                    totalCost: Math.round(totalCost * 100) / 100,
                    gainLoss: Math.round(gainLoss * 100) / 100,
                    gainLossPercent: Math.round(gainLossPercent * 100) / 100,
                });
            }
        }

        const totalValue = enrichedAssets.reduce((sum, a) => sum + a.currentValue, 0);
        const totalCost = enrichedAssets.reduce((sum, a) => sum + a.totalCost, 0);
        const totalGainLoss = totalValue - totalCost;
        const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

        return successResponse(res, {
            portfolio: {
                ...portfolio.toObject(),
                assets: enrichedAssets,
            },
            summary: {
                totalValue: Math.round(totalValue * 100) / 100,
                totalCost: Math.round(totalCost * 100) / 100,
                totalGainLoss: Math.round(totalGainLoss * 100) / 100,
                totalGainLossPercent: Math.round(totalGainLossPercent * 100) / 100,
                assetCount: enrichedAssets.length,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /api/portfolio/asset:
 *   post:
 *     summary: Add a new asset to portfolio
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 */
const addAsset = async (req, res, next) => {
    try {
        const { symbol, name, type, quantity, avgBuyPrice } = req.body;

        let portfolio = await Portfolio.findOne({ user: req.user.id });
        if (!portfolio) {
            portfolio = await Portfolio.create({ user: req.user.id, assets: [] });
        }

        // Check if asset already exists
        const existingIndex = portfolio.assets.findIndex(
            (a) => a.symbol === symbol.toUpperCase()
        );

        if (existingIndex !== -1) {
            // Update existing: average the buy price
            const existing = portfolio.assets[existingIndex];
            const totalQty = existing.quantity + quantity;
            const avgPrice =
                (existing.quantity * existing.avgBuyPrice + quantity * avgBuyPrice) / totalQty;
            portfolio.assets[existingIndex].quantity = totalQty;
            portfolio.assets[existingIndex].avgBuyPrice = Math.round(avgPrice * 100) / 100;
        } else {
            portfolio.assets.push({ symbol, name, type, quantity, avgBuyPrice });
        }

        await portfolio.save();
        return successResponse(res, { portfolio }, 'Asset added successfully', 201);
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /api/portfolio/asset/{assetId}:
 *   put:
 *     summary: Update an asset in portfolio
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 */
const updateAsset = async (req, res, next) => {
    try {
        const { assetId } = req.params;
        const { quantity, avgBuyPrice } = req.body;

        const portfolio = await Portfolio.findOne({ user: req.user.id });
        if (!portfolio) {
            return errorResponse(res, 'Portfolio not found', 404);
        }

        const asset = portfolio.assets.id(assetId);
        if (!asset) {
            return errorResponse(res, 'Asset not found', 404);
        }

        if (quantity !== undefined) asset.quantity = quantity;
        if (avgBuyPrice !== undefined) asset.avgBuyPrice = avgBuyPrice;

        await portfolio.save();
        return successResponse(res, { portfolio }, 'Asset updated successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /api/portfolio/asset/{assetId}:
 *   delete:
 *     summary: Remove an asset from portfolio
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 */
const deleteAsset = async (req, res, next) => {
    try {
        const { assetId } = req.params;

        const portfolio = await Portfolio.findOne({ user: req.user.id });
        if (!portfolio) {
            return errorResponse(res, 'Portfolio not found', 404);
        }

        const asset = portfolio.assets.id(assetId);
        if (!asset) {
            return errorResponse(res, 'Asset not found', 404);
        }

        asset.deleteOne();
        await portfolio.save();
        return successResponse(res, { portfolio }, 'Asset deleted successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = { getPortfolio, addAsset, updateAsset, deleteAsset };
