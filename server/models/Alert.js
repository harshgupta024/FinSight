/**
 * Alert Model
 * Stores price alerts set by users.
 */
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        symbol: {
            type: String,
            required: [true, 'Symbol is required'],
            uppercase: true,
            trim: true,
        },
        coinGeckoId: {
            type: String,
            required: [true, 'CoinGecko ID is required'],
            trim: true,
        },
        targetPrice: {
            type: Number,
            required: [true, 'Target price is required'],
            min: [0, 'Price cannot be negative'],
        },
        direction: {
            type: String,
            enum: ['above', 'below'],
            required: [true, 'Direction is required (above/below)'],
        },
        triggered: {
            type: Boolean,
            default: false,
        },
        triggeredAt: {
            type: Date,
            default: null,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Index for efficient querying of active alerts
alertSchema.index({ active: 1, triggered: 1 });
alertSchema.index({ user: 1 });

module.exports = mongoose.model('Alert', alertSchema);
