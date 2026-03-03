/**
 * WebSocket Service
 * Broadcasts live cryptocurrency price updates to connected clients.
 */
const { WebSocketServer } = require('ws');
const coinGeckoService = require('./coinGeckoService');

let wss = null;

const websocketService = {
    /**
     * Initialize WebSocket server on an existing HTTP server
     * @param {http.Server} server
     */
    init(server) {
        wss = new WebSocketServer({ server, path: '/ws' });

        wss.on('connection', (ws) => {
            console.log('🔌 WebSocket client connected');

            ws.on('close', () => {
                console.log('🔌 WebSocket client disconnected');
            });

            ws.on('error', (err) => {
                console.error('WebSocket error:', err.message);
            });

            // Send initial data on connect
            websocketService.sendPricesToClient(ws);
        });

        // Broadcast prices to all clients every 30 seconds
        setInterval(() => websocketService.broadcastPrices(), 30000);

        console.log('🔌 WebSocket server initialized on /ws');
    },

    /**
     * Send current prices to a single client
     */
    async sendPricesToClient(ws) {
        try {
            const topCoins = await coinGeckoService.getTopCoins('usd', 10);
            const payload = JSON.stringify({
                type: 'PRICE_UPDATE',
                data: topCoins.map((coin) => ({
                    id: coin.id,
                    symbol: coin.symbol,
                    name: coin.name,
                    current_price: coin.current_price,
                    price_change_24h: coin.price_change_percentage_24h,
                    image: coin.image,
                })),
                timestamp: new Date().toISOString(),
            });
            if (ws.readyState === ws.OPEN) {
                ws.send(payload);
            }
        } catch (error) {
            console.error('WebSocket send error:', error.message);
        }
    },

    /**
     * Broadcast prices to all connected clients
     */
    async broadcastPrices() {
        if (!wss || wss.clients.size === 0) return;

        try {
            const topCoins = await coinGeckoService.getTopCoins('usd', 10);
            const payload = JSON.stringify({
                type: 'PRICE_UPDATE',
                data: topCoins.map((coin) => ({
                    id: coin.id,
                    symbol: coin.symbol,
                    name: coin.name,
                    current_price: coin.current_price,
                    price_change_24h: coin.price_change_percentage_24h,
                    image: coin.image,
                })),
                timestamp: new Date().toISOString(),
            });

            wss.clients.forEach((client) => {
                if (client.readyState === client.OPEN) {
                    client.send(payload);
                }
            });
        } catch (error) {
            console.error('WebSocket broadcast error:', error.message);
        }
    },
};

module.exports = websocketService;
