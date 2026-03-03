/**
 * Watchlist Model
 * Stores a user's favorite assets to track.
 */
const mongoose = require('mongoose');

const watchlistItemSchema = new mongoose.Schema(
    {
        symbol: {
            type: String,
            required: [true, 'Symbol is required'],
            uppercase: true,
            trim: true,
        },
        name: {
            type: String,
            required: [true, 'Asset name is required'],
            trim: true,
        },
        type: {
            type: String,
            enum: ['crypto', 'stock'],
            default: 'crypto',
        },
        coinGeckoId: {
            type: String,
            trim: true,
        },
    },
    { _id: true }
);

const watchlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        items: [watchlistItemSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Watchlist', watchlistSchema);
