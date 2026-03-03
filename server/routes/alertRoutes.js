/**
 * Alert Routes
 */
const express = require('express');
const { body } = require('express-validator');
const {
    getAlerts,
    createAlert,
    deleteAlert,
} = require('../controllers/alertController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/', getAlerts);

router.post(
    '/',
    validate([
        body('symbol').trim().notEmpty().withMessage('Symbol is required'),
        body('coinGeckoId').trim().notEmpty().withMessage('CoinGecko ID is required'),
        body('targetPrice')
            .isFloat({ min: 0 })
            .withMessage('Target price must be non-negative'),
        body('direction')
            .isIn(['above', 'below'])
            .withMessage('Direction must be "above" or "below"'),
    ]),
    createAlert
);

router.delete('/:id', deleteAlert);

module.exports = router;
