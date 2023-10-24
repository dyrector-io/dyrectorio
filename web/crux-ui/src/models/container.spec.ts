import { ContainerPort, portToString } from './container'

describe('container model tests', () => {
  beforeEach(() => {})

  it('given both container ports when calling portToString() should return a full string', () => {
    const data: ContainerPort = { internal: 8001, external: 8002 }
    const expected = '8002->8001'

    const result = portToString(data)

    expect(expected).toEqual(result)
  })

  it('given only the external port when calling portToString()', () => {
    const data: ContainerPort = { internal: undefined, external: 8002 }
    const expected = '8002->None'

    const result = portToString(data)

    expect(expected).toEqual(result)
  })

  it('given only the internal port when calling portToString()', () => {
    const data: ContainerPort = { internal: 8001, external: undefined }
    const expected = 'None->8001'

    const result = portToString(data)

    expect(expected).toEqual(result)
  })

  it('given undefined ports when calling portToString()', () => {
    const data: ContainerPort = { internal: undefined, external: undefined }

    const actual = portToString(data)
    expect(actual).toBe('?')
  })
})
