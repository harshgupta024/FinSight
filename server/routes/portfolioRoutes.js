/**
 * Portfolio Routes
 */
const express = require('express');
const { body } = require('express-validator');
const {
    getPortfolio,
    addAsset,
    updateAsset,
    deleteAsset,
    getAnalytics,
} = require('../controllers/portfolioController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getPortfolio);
router.get('/analytics', getAnalytics);

router.post(
    '/asset',
    validate([
        body('symbol').trim().notEmpty().withMessage('Symbol is required'),
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('quantity')
            .isFloat({ min: 0.00000001 })
            .withMessage('Quantity must be positive'),
        body('avgBuyPrice')
            .isFloat({ min: 0 })
            .withMessage('Average buy price must be non-negative'),
    ]),
    addAsset
);

router.put('/asset/:assetId', updateAsset);
router.delete('/asset/:assetId', deleteAsset);

module.exports = router;
