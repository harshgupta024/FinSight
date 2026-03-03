/**
 * Alert Service
 * Background job that periodically checks active alerts against current prices.
 */
const Alert = require('../models/Alert');
const coinGeckoService = require('./coinGeckoService');

const alertService = {
    /**
     * Check all active, un-triggered alerts against current prices.
     * Called periodically by the server.
     */
    async checkAlerts() {
        try {
            const activeAlerts = await Alert.find({ active: true, triggered: false });

            if (activeAlerts.length === 0) return;

            // Group alerts by coinGeckoId to minimize API calls
            const coinIds = [...new Set(activeAlerts.map((a) => a.coinGeckoId))];
            const prices = await coinGeckoService.getCoinPrices(coinIds);

            const updates = [];

            for (const alert of activeAlerts) {
                const priceData = prices[alert.coinGeckoId];
                if (!priceData) continue;

                const currentPrice = priceData.usd;
                let shouldTrigger = false;

                if (alert.direction === 'above' && currentPrice >= alert.targetPrice) {
                    shouldTrigger = true;
                } else if (
                    alert.direction === 'below' &&
                    currentPrice <= alert.targetPrice
                ) {
                    shouldTrigger = true;
                }

                if (shouldTrigger) {
                    updates.push(
                        Alert.findByIdAndUpdate(alert._id, {
                            triggered: true,
                            triggeredAt: new Date(),
                        })
                    );
                    console.log(
                        `🔔 Alert triggered: ${alert.symbol} ${alert.direction} $${alert.targetPrice} (current: $${currentPrice})`
                    );
                }
            }

            if (updates.length > 0) {
                await Promise.all(updates);
                console.log(`✅ ${updates.length} alert(s) triggered`);
            }
        } catch (error) {
            console.error('❌ Alert check error:', error.message);
        }
    },

    /**
     * Start the periodic alert checker
     * @param {number} intervalMs - Check interval in milliseconds (default: 60s)
     */
    startAlertChecker(intervalMs = 60000) {
        console.log('🔔 Alert checker started (interval: 60s)');
        setInterval(() => alertService.checkAlerts(), intervalMs);
    },
};

module.exports = alertService;
