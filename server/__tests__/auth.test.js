/**
 * Auth API Tests
 */
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Mock response object
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('API Response Utilities', () => {
    describe('successResponse', () => {
        it('should return success response with defaults', () => {
            const res = mockRes();
            successResponse(res, { test: true });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Success',
                data: { test: true },
            });
        });

        it('should return success response with custom status', () => {
            const res = mockRes();
            successResponse(res, { id: 1 }, 'Created', 201);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Created',
                data: { id: 1 },
            });
        });
    });

    describe('errorResponse', () => {
        it('should return error response with defaults', () => {
            const res = mockRes();
            errorResponse(res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Error',
            });
        });

        it('should return error response with custom values', () => {
            const res = mockRes();
            errorResponse(res, 'Not found', 404);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Not found',
            });
        });
    });
});

describe('Cache Service', () => {
    const cacheService = require('../services/cacheService');

    beforeEach(() => {
        cacheService.flush();
    });

    it('should set and get a value', () => {
        cacheService.set('key1', 'value1');
        expect(cacheService.get('key1')).toBe('value1');
    });

    it('should return null for missing key', () => {
        expect(cacheService.get('nonexistent')).toBeNull();
    });

    it('should delete a key', () => {
        cacheService.set('key2', 'value2');
        cacheService.del('key2');
        expect(cacheService.get('key2')).toBeNull();
    });

    it('should flush all keys', () => {
        cacheService.set('a', 1);
        cacheService.set('b', 2);
        cacheService.flush();
        expect(cacheService.get('a')).toBeNull();
        expect(cacheService.get('b')).toBeNull();
    });

    it('should return cache stats', () => {
        const stats = cacheService.getStats();
        expect(stats).toHaveProperty('hits');
        expect(stats).toHaveProperty('misses');
    });
});
