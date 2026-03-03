/**
 * Alert Controller
 * CRUD for price alerts.
 */
const Alert = require('../models/Alert');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Get all alerts for current user
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 */
const getAlerts = async (req, res, next) => {
    try {
        const alerts = await Alert.find({ user: req.user.id }).sort({ createdAt: -1 });
        return successResponse(res, { alerts });
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /api/alerts:
 *   post:
 *     summary: Create a new price alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 */
const createAlert = async (req, res, next) => {
    try {
        const { symbol, coinGeckoId, targetPrice, direction } = req.body;

        const alert = await Alert.create({
            user: req.user.id,
            symbol,
            coinGeckoId,
            targetPrice,
            direction,
        });

        return successResponse(res, { alert }, 'Alert created successfully', 201);
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /api/alerts/{id}:
 *   delete:
 *     summary: Delete an alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 */
const deleteAlert = async (req, res, next) => {
    try {
        const alert = await Alert.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!alert) {
            return errorResponse(res, 'Alert not found', 404);
        }

        await alert.deleteOne();
        return successResponse(res, null, 'Alert deleted successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = { getAlerts, createAlert, deleteAlert };
