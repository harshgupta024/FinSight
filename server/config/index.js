/**
 * Centralized configuration – reads from process.env
 * All environment variables are accessed through this module.
 */
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/finsight',
  jwtSecret: process.env.JWT_SECRET || 'default_secret',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  coinGeckoUrl: process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3',
  redisUrl: process.env.REDIS_URL || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
