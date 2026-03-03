/**
 * Cache Service
 * Abstraction layer with in-memory cache (node-cache) and Redis-ready interface.
 * To switch to Redis, replace the get/set/del implementations.
 */
const NodeCache = require('node-cache');

// Default TTL: 5 minutes, check period: 10 minutes
const cache = new NodeCache({ stdTTL: 300, checkperiod: 600 });

const cacheService = {
    /**
     * Get cached value by key
     * @param {string} key
     * @returns {any|null}
     */
    get(key) {
        const value = cache.get(key);
        return value !== undefined ? value : null;
    },

    /**
     * Set a value in cache
     * @param {string} key
     * @param {any} value
     * @param {number} [ttl] - Time-to-live in seconds (optional, uses default)
     */
    set(key, value, ttl) {
        if (ttl) {
            cache.set(key, value, ttl);
        } else {
            cache.set(key, value);
        }
    },

    /**
     * Delete a key from cache
     * @param {string} key
     */
    del(key) {
        cache.del(key);
    },

    /**
     * Flush entire cache
     */
    flush() {
        cache.flushAll();
    },

    /**
     * Get cache stats
     */
    getStats() {
        return cache.getStats();
    },
};

module.exports = cacheService;
