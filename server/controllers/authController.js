/**
 * Auth Controller
 * Handles user registration, login, and profile retrieval.
 */
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return errorResponse(res, 'Email already registered', 400);
        }

        const user = await User.create({ name, email, password, role });
        const token = user.getSignedJwtToken();

        return successResponse(
            res,
            {
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
                token,
            },
            'User registered successfully',
            201
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return errorResponse(res, 'Invalid credentials', 401);
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return errorResponse(res, 'Invalid credentials', 401);
        }

        const token = user.getSignedJwtToken();

        return successResponse(res, {
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token,
        }, 'Login successful');
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 */
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        return successResponse(res, { user });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getMe };
