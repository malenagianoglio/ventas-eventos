module.exports = {
  preset: 'react-native',
  // Use node environment and control setup files manually. We override the
  // default `react-native/jest/setup.js` because it tries to redefine `window`
  // which conflicts with Jest's globals. Our custom jest.setup.js mocks the
  // necessary modules (AsyncStorage, Alert) for our tests.
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: [],
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/index.js',
    '!src/**/index.js',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    // allow Babel to transform these packages; expo-sqlite is part of expo but
    // its name doesn't start with "expo/" so we match expo(-something) here.
    'node_modules/(?!(react-native|@react-native|expo(-.*)?|react-native-toast-notifications|@react-navigation|react-native-svg)/)',
  ],
};
