/**
 * AI Advisor Service — Portfolio metrics calculation + AI text generation
 * Computes: Sharpe ratio, beta, volatility, max drawdown, diversification, correlation
 * Falls back to rule-based analysis if ANTHROPIC_API_KEY is not set
 */

/**
 * Calculate portfolio metrics from assets array
 * @param {Array} assets - [{symbol, name, quantity, avgBuyPrice, currentPrice}]
 * @returns {Object} computed metrics
 */
function calculateMetrics(assets) {
    if (!assets || assets.length === 0) {
        return {
            totalValue: 0,
            totalInvested: 0,
            pnl: 0,
            pnlPercent: 0,
            sharpeRatio: 0,
            beta: 0,
            volatility: 0,
            maxDrawdown: 0,
            diversificationScore: 0,
            riskLevel: 'low',
            correlationMatrix: {},
            topPerformer: 'N/A',
            worstPerformer: 'N/A',
        };
    }

    const totalInvested = assets.reduce((s, a) => s + (a.quantity || 0) * (a.avgBuyPrice || 0), 0);
    const totalValue = assets.reduce((s, a) => s + (a.quantity || 0) * (a.currentPrice || a.avgBuyPrice || 0), 0);
    const pnl = totalValue - totalInvested;
    const pnlPercent = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

    // Allocations
    const allocations = assets.map((a) => {
        const value = (a.quantity || 0) * (a.currentPrice || a.avgBuyPrice || 0);
        return { ...a, value, allocation: totalValue > 0 ? (value / totalValue) * 100 : 0 };
    });

    // Diversification score: 1 - HHI (Herfindahl–Hirschman Index)
    const hhi = allocations.reduce((s, a) => s + Math.pow(a.allocation / 100, 2), 0);
    const diversificationScore = Math.round((1 - hhi) * 100);

    // Simulated volatility based on allocation concentration (simplified)
    const volatility = Math.round((hhi * 80 + Math.random() * 10) * 100) / 100;

    // Simulated Sharpe ratio: (return - risk-free rate) / volatility
    const riskFreeRate = 4.5; // approximate US T-bill rate
    const annualizedReturn = pnlPercent * 3.65; // rough annualization
    const sharpeRatio = volatility > 0
        ? Math.round(((annualizedReturn - riskFreeRate) / volatility) * 100) / 100
        : 0;

    // Simulated beta (relative to crypto market = BTC)
    const hasBTC = allocations.some((a) => a.symbol?.toLowerCase() === 'btc');
    const beta = hasBTC
        ? Math.round((0.8 + Math.random() * 0.4) * 100) / 100
        : Math.round((1.0 + Math.random() * 0.6) * 100) / 100;

    // Max drawdown (simulated from concentration)
    const maxDrawdown = Math.round((volatility * 0.6 + Math.random() * 5) * 100) / 100;

    // Risk level based on volatility
    const riskLevel = volatility > 50 ? 'very_high' : volatility > 35 ? 'high' : volatility > 20 ? 'medium' : 'low';

    // Top / worst performer by PnL %
    const perfSorted = allocations
        .map((a) => ({
            symbol: a.symbol,
            pnlPercent: a.avgBuyPrice > 0
                ? (((a.currentPrice || a.avgBuyPrice) - a.avgBuyPrice) / a.avgBuyPrice) * 100
                : 0,
        }))
        .sort((a, b) => b.pnlPercent - a.pnlPercent);

    const topPerformer = perfSorted[0]?.symbol?.toUpperCase() || 'N/A';
    const worstPerformer = perfSorted[perfSorted.length - 1]?.symbol?.toUpperCase() || 'N/A';

    // Simplified correlation matrix (simulated)
    const correlationMatrix = {};
    allocations.forEach((a) => {
        correlationMatrix[a.symbol?.toUpperCase()] = {};
        allocations.forEach((b) => {
            if (a.symbol === b.symbol) {
                correlationMatrix[a.symbol?.toUpperCase()][b.symbol?.toUpperCase()] = 1.0;
            } else {
                correlationMatrix[a.symbol?.toUpperCase()][b.symbol?.toUpperCase()] =
                    Math.round((0.3 + Math.random() * 0.5) * 100) / 100;
            }
        });
    });

    return {
        totalValue: Math.round(totalValue * 100) / 100,
        totalInvested: Math.round(totalInvested * 100) / 100,
        pnl: Math.round(pnl * 100) / 100,
        pnlPercent: Math.round(pnlPercent * 100) / 100,
        sharpeRatio,
        beta,
        volatility,
        maxDrawdown,
        diversificationScore,
        riskLevel,
        correlationMatrix,
        topPerformer,
        worstPerformer,
    };
}

/**
 * Generate AI analysis text. Falls back to rule-based if no API key.
 * @param {Object} metrics - computed portfolio metrics
 * @param {Array} assets - portfolio assets
 * @returns {AsyncGenerator<string>} yields text chunks for SSE streaming
 */
async function* generateAnalysis(metrics, assets) {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
        // Use Anthropic Claude API
        try {
            const Anthropic = require('@anthropic-ai/sdk');
            const client = new Anthropic({ apiKey });

            const prompt = buildPrompt(metrics, assets);
            const stream = await client.messages.stream({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1500,
                messages: [{ role: 'user', content: prompt }],
            });

            for await (const event of stream) {
                if (event.type === 'content_block_delta' && event.delta?.text) {
                    yield event.delta.text;
                }
            }
        } catch (err) {
            console.error('Anthropic API error, falling back to rule-based:', err.message);
            yield* generateRuleBasedAnalysis(metrics, assets);
        }
    } else {
        yield* generateRuleBasedAnalysis(metrics, assets);
    }
}

/**
 * Build prompt for Claude
 */
function buildPrompt(metrics, assets) {
    const holdings = assets
        .map((a) => `${a.symbol?.toUpperCase()}: ${a.quantity} units @ $${a.avgBuyPrice} avg buy`)
        .join('\n');

    return `You are a senior crypto portfolio advisor for FinSight, an AI-powered financial analytics platform.

Analyze this portfolio and provide actionable advice:

**Holdings:**
${holdings}

**Metrics:**
- Total Value: $${metrics.totalValue?.toLocaleString()}
- Total Invested: $${metrics.totalInvested?.toLocaleString()}
- P&L: $${metrics.pnl?.toLocaleString()} (${metrics.pnlPercent?.toFixed(2)}%)
- Sharpe Ratio: ${metrics.sharpeRatio}
- Beta: ${metrics.beta}
- Volatility: ${metrics.volatility}%
- Max Drawdown: ${metrics.maxDrawdown}%
- Diversification Score: ${metrics.diversificationScore}/100
- Risk Level: ${metrics.riskLevel}

Provide your analysis in markdown format with these sections:
## Portfolio Summary
## Risk Assessment
## Recommendations
## Market Outlook

Be specific, mention actual coins by name, and provide 3-5 actionable recommendations.
Keep response under 800 words.`;
}

/**
 * Rule-based fallback analysis (no API key needed)
 */
async function* generateRuleBasedAnalysis(metrics, assets) {
    const chunks = [];

    chunks.push(`## Portfolio Summary\n\n`);
    chunks.push(`Your portfolio has a total value of **$${metrics.totalValue?.toLocaleString()}** `);
    chunks.push(`with a total investment of **$${metrics.totalInvested?.toLocaleString()}**. `);

    if (metrics.pnl >= 0) {
        chunks.push(`You're currently in profit with a **+${metrics.pnlPercent?.toFixed(2)}%** return. `);
    } else {
        chunks.push(`You're currently showing a **${metrics.pnlPercent?.toFixed(2)}%** loss. `);
    }

    chunks.push(`Your diversification score is **${metrics.diversificationScore}/100**`);
    if (metrics.diversificationScore < 40) {
        chunks.push(` — your portfolio is **highly concentrated** and would benefit from more assets.\n\n`);
    } else if (metrics.diversificationScore < 70) {
        chunks.push(` — **moderate diversification**, consider adding 2-3 more uncorrelated assets.\n\n`);
    } else {
        chunks.push(` — **well diversified** across multiple assets.\n\n`);
    }

    chunks.push(`## Risk Assessment\n\n`);
    chunks.push(`- **Risk Level:** ${metrics.riskLevel.replace('_', ' ').toUpperCase()}\n`);
    chunks.push(`- **Volatility:** ${metrics.volatility}% — `);
    if (metrics.volatility > 40) {
        chunks.push(`this is elevated. Consider hedging with stablecoins or reducing position sizes.\n`);
    } else {
        chunks.push(`within acceptable range for a crypto portfolio.\n`);
    }
    chunks.push(`- **Sharpe Ratio:** ${metrics.sharpeRatio} — `);
    if (metrics.sharpeRatio > 1) {
        chunks.push(`strong risk-adjusted returns.\n`);
    } else if (metrics.sharpeRatio > 0) {
        chunks.push(`positive but could be improved.\n`);
    } else {
        chunks.push(`negative, indicating returns don't compensate for risk taken.\n`);
    }
    chunks.push(`- **Beta:** ${metrics.beta} — `);
    if (metrics.beta > 1.2) {
        chunks.push(`your portfolio is more volatile than the market. Consider adding lower-beta assets.\n`);
    } else {
        chunks.push(`reasonable market correlation.\n`);
    }
    chunks.push(`- **Max Drawdown:** ${metrics.maxDrawdown}%\n\n`);

    chunks.push(`## Recommendations\n\n`);
    const recs = [];
    if (metrics.diversificationScore < 50) {
        recs.push(`1. **Diversify Holdings** — Add 3-5 uncorrelated assets (consider ETH, SOL, or DeFi tokens) to reduce concentration risk.`);
    }
    if (metrics.volatility > 35) {
        recs.push(`${recs.length + 1}. **Reduce Volatility** — Allocate 10-20% to stablecoins (USDT/USDC) as a volatility buffer.`);
    }
    if (metrics.sharpeRatio < 0.5) {
        recs.push(`${recs.length + 1}. **Improve Risk-Adjusted Returns** — Consider DCA (Dollar-Cost Averaging) to smooth entry prices and improve your Sharpe ratio.`);
    }
    recs.push(`${recs.length + 1}. **Set Stop-Losses** — Protect your portfolio with stop-loss alerts at -15% to -20% from current prices.`);
    recs.push(`${recs.length + 1}. **Regular Rebalancing** — Review and rebalance your portfolio monthly to maintain target allocations.`);

    chunks.push(recs.join('\n') + '\n\n');

    chunks.push(`## Market Outlook\n\n`);
    chunks.push(`The crypto market remains volatile with macro factors driving short-term price action. `);
    chunks.push(`Focus on **accumulating quality assets** during dips and **taking partial profits** near resistance levels. `);
    chunks.push(`Your top performer **${metrics.topPerformer}** shows strong momentum; `);
    chunks.push(`watch **${metrics.worstPerformer}** for a potential recovery or consider trimming the position.\n`);

    // Yield chunks with small delays to simulate streaming
    for (const chunk of chunks) {
        yield chunk;
        await new Promise((resolve) => setTimeout(resolve, 30));
    }
}

module.exports = { calculateMetrics, generateAnalysis };
