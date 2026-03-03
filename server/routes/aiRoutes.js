/**
 * AI Routes — POST /api/ai/analyze (SSE streaming), GET /api/ai/history
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');
const AiAnalysis = require('../models/AiAnalysis');
const { calculateMetrics, generateAnalysis } = require('../services/aiAdvisor');

/**
 * POST /api/ai/analyze
 * Stream AI analysis via Server-Sent Events
 */
router.post('/analyze', protect, async (req, res) => {
    const { type = 'portfolio_review' } = req.body;

    try {
        // Fetch user's portfolio
        const portfolio = await Portfolio.findOne({ user: req.user._id });
        const assets = portfolio?.assets || [];

        if (assets.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No assets in portfolio. Add assets before requesting AI analysis.',
            });
        }

        // Get current prices for each asset (use stored data)
        const enrichedAssets = assets.map((a) => ({
            symbol: a.symbol,
            name: a.name,
            quantity: a.quantity,
            avgBuyPrice: a.avgBuyPrice,
            currentPrice: a.currentPrice || a.avgBuyPrice,
        }));

        // Calculate metrics
        const metrics = calculateMetrics(enrichedAssets);

        // Set up SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no',
        });

        // Send metrics as first event
        res.write(`data: ${JSON.stringify({ type: 'metrics', metrics })}\n\n`);

        // Stream analysis text
        let fullAnalysis = '';
        for await (const chunk of generateAnalysis(metrics, enrichedAssets)) {
            fullAnalysis += chunk;
            res.write(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`);
        }

        // Save analysis to DB
        const saved = await AiAnalysis.create({
            user: req.user._id,
            type,
            metrics,
            analysis: fullAnalysis,
            summary: fullAnalysis.substring(0, 200) + '…',
            portfolio_snapshot: enrichedAssets.map((a) => ({
                symbol: a.symbol,
                name: a.name,
                quantity: a.quantity,
                avgBuyPrice: a.avgBuyPrice,
                allocation: metrics.totalValue > 0
                    ? ((a.quantity * (a.currentPrice || a.avgBuyPrice)) / metrics.totalValue) * 100
                    : 0,
            })),
        });

        // Send completion event
        res.write(`data: ${JSON.stringify({ type: 'done', analysisId: saved._id })}\n\n`);
        res.end();
    } catch (err) {
        console.error('AI analysis error:', err);
        // If headers already sent we can't change status
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: 'AI analysis failed' });
        }
        res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
        res.end();
    }
});

/**
 * GET /api/ai/history
 * Get user's past AI analyses
 */
router.get('/history', protect, async (req, res) => {
    try {
        const analyses = await AiAnalysis.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20)
            .select('type metrics.totalValue metrics.pnlPercent metrics.riskLevel summary createdAt');

        res.json({ success: true, data: analyses });
    } catch (err) {
        console.error('AI history error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch history' });
    }
});

module.exports = router;
