import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'json', 'ts'],
  modulePaths: ['.'],
  testRegex: '.*\\.unit.test\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  // modulePathIgnorePatterns: ['e2e', 'e2e_results'],
  collectCoverageFrom: ['src/server/**/*.(t|j)s'],
  coveragePathIgnorePatterns: ['src/server/console', 'src/server/migration'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  verbose: true,
}

export default config
