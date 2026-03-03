/**
 * Swagger Configuration
 * Auto-generates OpenAPI documentation from JSDoc comments.
 */
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FinSight API',
            version: '1.0.0',
            description:
                'Intelligent Financial Analytics Platform – REST API Documentation',
            contact: {
                name: 'FinSight Team',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Portfolio', description: 'Portfolio management' },
            { name: 'Watchlist', description: 'Asset watchlist' },
            { name: 'Alerts', description: 'Price alerts' },
            { name: 'Market', description: 'Market data from CoinGecko' },
        ],
    },
    apis: ['./controllers/*.js', './routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
