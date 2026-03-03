/**
 * MongoDB connection using Mongoose.
 * Includes retry logic and event listeners for production robustness.
 */
const mongoose = require('mongoose');
const config = require('./index');

// Workaround: Node v24+ uses stricter OpenSSL defaults which break the TLS
// handshake with some MongoDB Atlas clusters (SSL alert number 80).
// Safe for development. For production, ensure your Atlas cluster TLS is up to date.
if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.mongoUri, {
            // Mongoose 8 uses the new URL parser & unified topology by default
            // Fix for Node v24+ OpenSSL TLS changes with MongoDB Atlas
            tls: true,
            tlsAllowInvalidCertificates: true,
        });
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error.message}`);
        // Retry after 5 seconds
        setTimeout(connectDB, 5000);
    }
};

// Connection event listeners
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected. Attempting reconnect…');
});

mongoose.connection.on('error', (err) => {
    console.error(`❌ MongoDB error: ${err.message}`);
});

module.exports = connectDB;
