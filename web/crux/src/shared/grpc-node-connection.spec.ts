import { Metadata } from '@grpc/grpc-js'
import GrpcNodeConnection, { NodeGrpcCall } from './grpc-node-connection'

describe('GrpcNodeConnection', () => {
  let call: NodeGrpcCall
  let metadata: Metadata

  beforeEach(() => {
    call = {} as NodeGrpcCall
    call.call = {
      handler: {
        type: 'bidi',
      },
    }
    call.on = jest.fn()
    call.getPeer = jest.fn(() => 'peer-ip')

    metadata = new Metadata()
    metadata.set(GrpcNodeConnection.META_NODE_TOKEN, 'node-token')
  })

  it('should use the x-real-ip metadata when available', () => {
    const expected = '1.2.3.4'

    metadata.add('x-real-ip', expected)

    const connection = new GrpcNodeConnection(metadata, call)

    const actual = connection.address

    expect(actual).toBe(expected)
  })

  it('should use the x-forwarded-for metadata when available', () => {
    const expected = '1.2.3.4'

    metadata.add('x-forwarded-for', expected)

    const connection = new GrpcNodeConnection(metadata, call)

    const actual = connection.address

    expect(actual).toBe(expected)
  })

  it('should prefer x-real-ip over x-forwarded-for metadata when available', () => {
    const expected = '1.2.3.4'

    metadata.add('x-real-ip', expected)
    metadata.add('x-forwarded-for', 'forwarded-for-ip')

    const connection = new GrpcNodeConnection(metadata, call)

    const actual = connection.address

    expect(actual).toBe(expected)
  })

  it("should fall back to call's peer, when no proxy headers available", () => {
    const expected = '1.2.3.4'

    call.getPeer = jest.fn(() => expected)

    const connection = new GrpcNodeConnection(metadata, call)

    const actual = connection.address

    expect(actual).toBe(expected)
  })
})
