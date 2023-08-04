import nextJest from 'next/jest'
import jest from 'jest'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig: jest.Config = {
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'json', 'ts'],
  modulePaths: ['.'],
  moduleNameMapper: {
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@server/(.*)$': '<rootDir>/src/server/$1',
    '^@app/(.*)$': '<rootDir>/src/$1',
  },
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  modulePathIgnorePatterns: ['e2e', 'e2e_results'],
  collectCoverageFrom: ['src/server/**/*.(t|j)s'],
  coveragePathIgnorePatterns: ['src/server/console', 'src/server/migration'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  // testEnvironment: 'jest-environment-jsdom',
  verbose: true,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig)

// import type { Config } from '@jest/types'
// 
// const config: Config.InitialOptions = {

// }
// 
// export default config
// 