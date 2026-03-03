/**
 * Jest configuration for backend tests
 */
module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    collectCoverageFrom: [
        'controllers/**/*.js',
        'services/**/*.js',
        'middleware/**/*.js',
        'utils/**/*.js',
    ],
    coverageDirectory: 'coverage',
    verbose: true,
};
