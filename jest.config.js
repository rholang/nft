module.exports = {
    roots: ['<rootDir>'],

    transform: {
        '^.+\\.ts?$': 'ts-jest',
    },

    modulePathIgnorePatterns: ['node_modules'],
    transformIgnorePatterns: [],
    globals: {
        'ts-jest': {
            isolatedModules: true,
        },
    },
    testMatch: ['**/packages/**/__tests__/*.test.ts'],
}
