/**
 * FinSight Server Entry Point
 * Sets up Express app with all middleware, routes, WebSocket, and starts listening.
 */
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const config = require('./config');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { limiter } = require('./middleware/rateLimiter');
const swaggerSpec = require('./swagger');
const websocketService = require('./services/websocketService');
const alertService = require('./services/alertService');

// Route imports
const authRoutes = require('./routes/authRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const alertRoutes = require('./routes/alertRoutes');
const marketRoutes = require('./routes/marketRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Initialize Express
const app = express();

// ─── Security Middleware ────────────────────────────────────────
app.use(helmet());
app.use(
    cors({
        origin: config.clientUrl,
        credentials: true,
    })
);
app.use(limiter);

// ─── Body Parsing ───────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ────────────────────────────────────────────────────
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// ─── API Documentation ─────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'FinSight API Docs',
}));

// ─── API Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/ai', aiRoutes);

// ─── Health Check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'FinSight API is running',
        environment: config.nodeEnv,
        timestamp: new Date().toISOString(),
    });
});

// ─── 404 Handler ────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`,
    });
});

// ─── Error Handler ──────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────
const server = http.createServer(app);

const startServer = async () => {
    // Connect to MongoDB
    await connectDB();

    // Initialize WebSocket
    websocketService.init(server);

    // Start alert checker (every 60 seconds)
    alertService.startAlertChecker(60000);

    server.listen(config.port, () => {
        console.log(`
    ╔══════════════════════════════════════════╗
    ║        FinSight API Server               ║
    ║──────────────────────────────────────────║
    ║  🚀 Port:        ${config.port}                    ║
    ║  🌍 Environment: ${config.nodeEnv.padEnd(20)}║
    ║  📚 API Docs:    /api-docs               ║
    ║  🔌 WebSocket:   /ws                     ║
    ╚══════════════════════════════════════════╝
    `);
    });
};

startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully…');
    server.close(() => process.exit(0));
});

module.exports = app; // Export for testing
