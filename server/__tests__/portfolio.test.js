/**
 * Middleware Tests
 */
const errorHandler = require('../middleware/errorHandler');
const { authorize } = require('../middleware/role');

// Mock response object
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Error Handler Middleware', () => {
    it('should handle generic errors', () => {
        const err = new Error('Something went wrong');
        const res = mockRes();
        const next = jest.fn();

        errorHandler(err, {}, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: 'Something went wrong',
            })
        );
    });

    it('should handle CastError (bad ObjectId)', () => {
        const err = new Error('Cast error');
        err.name = 'CastError';
        const res = mockRes();

        errorHandler(err, {}, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: 'Resource not found – invalid ID',
            })
        );
    });

    it('should handle duplicate key error', () => {
        const err = new Error('Duplicate key');
        err.code = 11000;
        err.keyValue = { email: 'test@test.com' };
        const res = mockRes();

        errorHandler(err, {}, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: 'Duplicate value for field: email',
            })
        );
    });

    it('should handle ValidationError', () => {
        const err = new Error('Validation failed');
        err.name = 'ValidationError';
        err.errors = {
            email: { message: 'Email is required' },
            name: { message: 'Name is required' },
        };
        const res = mockRes();

        errorHandler(err, {}, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle JWT errors', () => {
        const err = new Error('jwt malformed');
        err.name = 'JsonWebTokenError';
        const res = mockRes();

        errorHandler(err, {}, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: 'Invalid token',
            })
        );
    });
});

describe('Role Authorization Middleware', () => {
    it('should allow authorized role', () => {
        const req = { user: { role: 'admin' } };
        const res = mockRes();
        const next = jest.fn();

        authorize('admin')(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('should deny unauthorized role', () => {
        const req = { user: { role: 'user' } };
        const res = mockRes();
        const next = jest.fn();

        authorize('admin')(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('should deny when no user on request', () => {
        const req = {};
        const res = mockRes();
        const next = jest.fn();

        authorize('admin')(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
    });
});
