/**
 * Market Routes (public – no auth required for basic data)
 */
const express = require('express');
const {
    getTopCoins,
    getCoinHistory,
    searchCoins,
} = require('../controllers/marketController');

const router = express.Router();

router.get('/top', getTopCoins);
router.get('/history/:coinId', getCoinHistory);
router.get('/search', searchCoins);

module.exports = router;
