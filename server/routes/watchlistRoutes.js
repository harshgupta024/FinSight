/**
 * Watchlist Routes
 */
const express = require('express');
const { body } = require('express-validator');
const {
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/', getWatchlist);

router.post(
    '/',
    validate([
        body('symbol').trim().notEmpty().withMessage('Symbol is required'),
        body('name').trim().notEmpty().withMessage('Name is required'),
    ]),
    addToWatchlist
);

router.delete('/:itemId', removeFromWatchlist);

module.exports = router;
