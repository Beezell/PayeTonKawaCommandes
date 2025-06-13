module.exports = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  testMatch: ['**/tests/**/*.test.js'],
  moduleFileExtensions: ['js', 'json'],
  transform: {},
  testTimeout: 10000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  roots: ['<rootDir>'],
  modulePaths: ['<rootDir>']
};