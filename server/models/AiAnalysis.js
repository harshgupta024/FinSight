/**
 * AiAnalysis Model — Stores saved AI portfolio analyses
 */
const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['portfolio_review', 'risk_assessment', 'rebalancing', 'market_outlook'],
            default: 'portfolio_review',
        },
        metrics: {
            totalValue: Number,
            totalInvested: Number,
            pnl: Number,
            pnlPercent: Number,
            sharpeRatio: Number,
            beta: Number,
            volatility: Number,
            maxDrawdown: Number,
            diversificationScore: Number,
            riskLevel: { type: String, enum: ['low', 'medium', 'high', 'very_high'] },
            correlationMatrix: mongoose.Schema.Types.Mixed,
            topPerformer: String,
            worstPerformer: String,
        },
        analysis: {
            type: String,
            required: true,
        },
        summary: {
            type: String,
            maxlength: 500,
        },
        portfolio_snapshot: [
            {
                symbol: String,
                name: String,
                quantity: Number,
                avgBuyPrice: Number,
                allocation: Number,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Index for fast user queries sorted by date
aiAnalysisSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('AiAnalysis', aiAnalysisSchema);
