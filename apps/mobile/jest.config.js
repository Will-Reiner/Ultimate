/** @type {import('jest').Config} */
module.exports = {
  // Use ts-jest directly so pure-TS domain/application tests don't need babel-preset-expo
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts', '**/*.spec.tsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        // allow imports from tsconfig paths
        paths: {
          '@domain/*': ['src/domain/*'],
          '@application/*': ['src/application/*'],
          '@infrastructure/*': ['src/infrastructure/*'],
          '@presentation/*': ['src/presentation/*'],
          '@shared/*': ['src/shared/*'],
        },
      },
    }],
  },
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@presentation/(.*)$': '<rootDir>/src/presentation/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  collectCoverageFrom: [
    'src/domain/**/*.ts',
    'src/application/**/*.ts',
    '!**/*.spec.ts',
    '!**/index.ts',
  ],
  coverageDirectory: 'coverage',
};
