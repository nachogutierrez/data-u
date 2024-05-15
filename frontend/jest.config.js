module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    moduleNameMapper: {
      '@/(.*)': '<rootDir>/$1',
    },
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest'
    },
    testMatch: ['**/?(*.)+(test).(ts|tsx|js)']
  };
  