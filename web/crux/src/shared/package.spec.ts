import { getAgentVersionFromPackage } from './package'

it('getAgentVersionFromPackage should return only the major and minor parts of a version', () => {
  const mockConfig = {
    get: jest.fn().mockReturnValue('1.2.3.4.5-beta1'),
  }

  const actual = getAgentVersionFromPackage(mockConfig as any)

  expect(actual).toEqual('1.2')
})
