import { ContainerPort, portToString } from './container'

describe('container model tests', () => {
  beforeEach(() => {})

  it('given both container port when call portToString than add back the full string', () => {
    const data: ContainerPort = { internal: 8001, external: 8002 }
    const expected = '8002->8001'

    const result = portToString(data)

    expect(expected).toEqual(result)
  })

  it('given only the external port when call portToString', () => {
    const data: ContainerPort = { internal: undefined, external: 8002 }
    const expected = '8002->None'

    const result = portToString(data)

    expect(expected).toEqual(result)
  })

  it('given only the internal port when call portToString', () => {
    const data: ContainerPort = { internal: 8001, external: undefined }
    const expected = 'None->8001'

    const result = portToString(data)

    expect(expected).toEqual(result)
  })

  it('given undefined ports when call portToString', () => {
    const data: ContainerPort = { internal: undefined, external: undefined }

    expect(() => {
      portToString(data)
    }).toThrow('Missing Port Information, provide either an internal or external port number.')
  })
})
