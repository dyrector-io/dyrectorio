import { firstValueFrom, of, toArray } from 'rxjs'
import {
  SubscriptionMessage,
  WS_TYPE_SUBBED,
  WS_TYPE_SUBSCRIBE,
  WsClient,
  WsClientCallbacks,
  WsMessage,
  WsRouteMatch,
} from './common'
import WsNamespace from './namespace'

describe('WsNamespace', () => {
  const PATH = '/path'
  const ID_PARAM = 'id'
  const ID_PARAM_VALUE = 'a-guid'
  const PARAMS: Record<string, string> = {
    id: ID_PARAM_VALUE,
  }

  const matchForSubpath = (subpath: string): WsRouteMatch => ({
    path: PATH,
    params: PARAMS,
    subpath,
  })

  let routeMatch: WsRouteMatch
  let namespace: WsNamespace

  beforeEach(() => {
    routeMatch = matchForSubpath(null)
    namespace = new WsNamespace(routeMatch)
  })

  describe('getParameter', () => {
    it('should return the value of an existing parameter', () => {
      const expected = ID_PARAM_VALUE
      const actual = namespace.getParameter(ID_PARAM)

      expect(actual).toEqual(expected)
    })

    it('should return null for a non-existent parameter', () => {
      const expected = null
      const actual = namespace.getParameter('non-existent-param-name')

      expect(actual).toEqual(expected)
    })
  })

  describe('onSubscribe', () => {
    let client: WsClient
    let callbacks: WsClientCallbacks

    let subscribeMessage: WsMessage<SubscriptionMessage>
    let successfulSubscribeMessage: WsMessage<SubscriptionMessage>

    const subscribeCallbackFirstMessage: WsMessage = {
      type: 'first',
      data: 'message',
    }

    const subscribeCallbackOtherMessage: WsMessage = {
      type: 'other',
      data: {
        message: 2,
      },
    }

    beforeEach(() => {
      client = {} as WsClient
      client.token = 'client-token'
      client.subscriptions = new Map()

      subscribeMessage = {
        type: WS_TYPE_SUBSCRIBE,
        data: {
          path: routeMatch.path,
        },
      }

      successfulSubscribeMessage = {
        type: WS_TYPE_SUBBED,
        data: {
          path: routeMatch.path,
        },
      }

      callbacks = {
        authorize: jest.fn(),
        transform: jest.fn(it => it),
        handlers: new Map(),
        subscribe: null,
        unsubscribe: null,
      }
    })

    it('should return an observable with the correct subbed message', async () => {
      const actualObs = namespace.onSubscribe(client, callbacks, subscribeMessage)
      const actual = await firstValueFrom(actualObs)

      expect(actual).toEqual(successfulSubscribeMessage)
    })

    it("should set namespace in the client's subscriptions map with the correct path", () => {
      const subscribe = jest.fn(() => of({}))
      callbacks.subscribe = subscribe

      namespace.onSubscribe(client, callbacks, subscribeMessage)

      const actual = client.subscriptions.get(PATH)
      expect(actual).toEqual(namespace)
    })

    it('should call the subscribe callback with the subscribe message', () => {
      const subscribe = jest.fn()
      callbacks.subscribe = subscribe

      namespace.onSubscribe(client, callbacks, subscribeMessage)

      expect(subscribe).toBeCalledWith(subscribeMessage)
    })

    it('should call the transform callback with the result of the subscribe callback', () => {
      const subscribe = jest.fn(() => of(subscribeCallbackFirstMessage, subscribeCallbackOtherMessage))
      const transform = jest.fn()
      callbacks.subscribe = subscribe
      callbacks.transform = transform

      namespace.onSubscribe(client, callbacks, subscribeMessage)

      const subscribeResult = subscribe.mock.results[0].value
      expect(transform).toBeCalledWith(subscribeResult)
    })

    it('should return the values returned by the subscribe callback with the corrected path', async () => {
      const allSubMsg: WsMessage[] = [{ ...subscribeCallbackFirstMessage }, { ...subscribeCallbackOtherMessage }]

      const subscribe = jest.fn(() => of(...allSubMsg))
      callbacks.subscribe = subscribe

      const result = namespace.onSubscribe(client, callbacks, subscribeMessage)
      const resultObs = result.pipe(toArray())

      const actual = await firstValueFrom(resultObs)

      const expected: WsMessage[] = [
        {
          ...subscribeCallbackFirstMessage,
          type: `${PATH}/${subscribeCallbackFirstMessage.type}`,
        },
        {
          ...subscribeCallbackOtherMessage,
          type: `${PATH}/${subscribeCallbackOtherMessage.type}`,
        },
      ]

      expect(actual.length).toBeGreaterThanOrEqual(expected.length)
      expected.forEach(it => expect(actual).toContainEqual(it))
    })

    it('should ignore undefined and null values returned by the subscribe callback', async () => {
      const allSubMsg: WsMessage[] = [subscribeCallbackFirstMessage, undefined, subscribeCallbackOtherMessage, null]

      const subscribe = jest.fn(() => of(...allSubMsg))
      callbacks.subscribe = subscribe

      const result = namespace.onSubscribe(client, callbacks, subscribeMessage)
      const resultObs = result.pipe(toArray())

      const actual = await firstValueFrom(resultObs)

      const expected: WsMessage[] = [subscribeCallbackFirstMessage, subscribeCallbackOtherMessage]

      expect(actual.length).toBeGreaterThanOrEqual(expected.length)
      actual.forEach(it => {
        expect(it).not.toBeUndefined()
        expect(it).not.toBeNull()
      })
    })
  })
})
