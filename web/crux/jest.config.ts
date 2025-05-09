import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  modulePaths: ['.'],
  testRegex: '.*\\.spec\\.ts$',
  collectCoverage: false,
  collectCoverageFrom: [
    "src/**/*.ts"
  ],
  coveragePathIgnorePatterns: ['src/server/console', 'src/server/migration'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  coverageReporters: [
    "text",
    "cobertura"
  ]
}

export default config
