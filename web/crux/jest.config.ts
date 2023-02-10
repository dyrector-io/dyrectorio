import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  moduleFileExtensions: ['ts'],
  modulePaths: ['.'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/server/**/*.ts'],
  coveragePathIgnorePatterns: ['src/server/console', 'src/server/migration'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
};

export default config;
