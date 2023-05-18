import { getAgentVersionFromPackage } from './package'

jest.mock('../../package.json', () => ({
  version: '1.2.3.4.5-beta1',
}))

it('getAgentVersionFromPackage should return only the major and minor parts of a version', () => {
  const actual = getAgentVersionFromPackage()

  expect(actual).toEqual('1.2')
})
