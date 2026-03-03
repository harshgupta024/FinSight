/**
 * Portfolio Model
 * Each user has one portfolio document containing an array of assets.
 */
const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
    {
        symbol: {
            type: String,
            required: [true, 'Asset symbol is required'],
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
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [0, 'Quantity cannot be negative'],
        },
        avgBuyPrice: {
            type: Number,
            required: [true, 'Average buy price is required'],
            min: [0, 'Price cannot be negative'],
        },
    },
    { _id: true, timestamps: true }
);

const portfolioSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        assets: [assetSchema],
    },
    { timestamps: true }
);

// Virtual: calculate total investment for the portfolio
portfolioSchema.virtual('totalInvestment').get(function () {
    return this.assets.reduce(
        (sum, asset) => sum + asset.quantity * asset.avgBuyPrice,
        0
    );
});

// Ensure virtuals are included in JSON output
portfolioSchema.set('toJSON', { virtuals: true });
portfolioSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
