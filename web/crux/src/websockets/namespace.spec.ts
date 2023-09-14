import { EMPTY, Subject, firstValueFrom, of, startWith, toArray } from 'rxjs'
import {
  SubscriptionMessage,
  WS_TYPE_SUBBED,
  WS_TYPE_SUBSCRIBE,
  WS_TYPE_UNSUBBED,
  WS_TYPE_UNSUBSCRIBE,
  WsClient,
  WsClientCallbacks,
  WsMessage,
  WsRouteMatch,
} from './common'
import WsNamespace from './namespace'

describe('WsNamespace', () => {
  const PATH = '/path/a-guid'
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
  let subscribeMessage: WsMessage<SubscriptionMessage>
  let validMessage: WsMessage

  const HANDLER_PATH = 'subpath'

  beforeEach(() => {
    routeMatch = matchForSubpath(null)
    namespace = new WsNamespace(routeMatch)

    subscribeMessage = {
      type: WS_TYPE_SUBSCRIBE,
      data: {
        path: routeMatch.path,
      },
    }

    validMessage = {
      type: `${routeMatch.path}/${HANDLER_PATH}`,
      data: {
        valid: 'message',
      },
    }
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

    describe('when already subscribed', () => {
      beforeEach(() => {
        namespace.onSubscribe(client, callbacks, subscribeMessage)
      })

      it('should return EMPTY observable', () => {
        const actual = namespace.onSubscribe(client, callbacks, subscribeMessage)

        expect(actual).toBe(EMPTY)
      })
    })
  })

  describe('onUnsubscribe', () => {
    let client: WsClient
    let callbacks: WsClientCallbacks

    let unsubscribeMessage: WsMessage<SubscriptionMessage>
    let successfulUnsubscribeMessage: WsMessage<SubscriptionMessage>

    beforeEach(() => {
      client = {} as WsClient
      client.token = 'client-token'
      client.subscriptions = new Map()

      unsubscribeMessage = {
        type: WS_TYPE_UNSUBSCRIBE,
        data: {
          path: routeMatch.path,
        },
      }

      successfulUnsubscribeMessage = {
        type: WS_TYPE_UNSUBBED,
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

    it('should return UnsubscribeResult with a null when the client is not subscribed', async () => {
      const result = await namespace.onUnsubscribe(client, unsubscribeMessage)

      expect(result.res).toBe(null)
    })

    it('should return UnsubscribeResult with shouldRemove true when the client is not subscribed and there is no other client subscribed', async () => {
      const result = await namespace.onUnsubscribe(client, unsubscribeMessage)

      expect(result.shouldRemove).toBe(true)
    })

    it("should complete the onSubscribe call's stream", () => {
      callbacks.subscribe = jest.fn(() => new Subject<WsMessage>())

      const stream = namespace.onSubscribe(client, callbacks, subscribeMessage)
      const subscription = stream.subscribe(() => {})

      namespace.onUnsubscribe(client, unsubscribeMessage)

      expect(subscription.closed).toBe(true)
    })

    it("should complete the onMessage call's stream", () => {
      callbacks.handlers.set(HANDLER_PATH, () => new Subject<WsMessage>())

      namespace.onSubscribe(client, callbacks, subscribeMessage)

      const stream = namespace.onMessage(client, validMessage)
      const subscription = stream.subscribe(() => {})

      namespace.onUnsubscribe(client, unsubscribeMessage)

      expect(subscription.closed).toBe(true)
    })

    it('should call the unsubscribe callback', () => {
      const unsubscribe = jest.fn(() => new Subject<WsMessage>())
      callbacks.unsubscribe = unsubscribe
      namespace.onSubscribe(client, callbacks, subscribeMessage)

      namespace.onUnsubscribe(client, unsubscribeMessage)

      expect(unsubscribe).toBeCalled()
    })

    it('should call the unsubscribe callback with a fake subscription message when the message is not provided (client disconnects)', () => {
      const unsubscribe = jest.fn<any, [WsMessage<SubscriptionMessage>]>(() => new Subject<WsMessage>())
      callbacks.unsubscribe = unsubscribe
      namespace.onSubscribe(client, callbacks, subscribeMessage)

      namespace.onUnsubscribe(client, null)

      expect(unsubscribe).toBeCalled()
      expect(unsubscribe.mock.lastCall[0]).toEqual(unsubscribeMessage)
    })

    it('should call the transform when the unsubscribe callback is present', () => {
      const unsubscribe = jest.fn(() => new Subject<WsMessage>())
      callbacks.unsubscribe = unsubscribe

      const transform = jest.fn(it => it)
      callbacks.transform = transform
      namespace.onSubscribe(client, callbacks, subscribeMessage)

      namespace.onUnsubscribe(client, unsubscribeMessage)

      expect(transform).toBeCalled()
    })

    it("should remove the namespace from the client's subscriptions when the unsubscribe callback is present", async () => {
      const unsubSubject = new Subject<WsMessage>()
      const unsubscribe = jest.fn(() => unsubSubject.asObservable().pipe(startWith(true)))
      callbacks.unsubscribe = unsubscribe
      namespace.onSubscribe(client, callbacks, subscribeMessage)

      const unsub = namespace.onUnsubscribe(client, unsubscribeMessage)

      unsubSubject.complete()
      await unsub

      expect(client.subscriptions.has(routeMatch.path)).toBe(false)
    })

    describe('with another client subscribed', () => {
      let subscribedClient: WsClient

      beforeEach(() => {
        subscribedClient = {} as WsClient
        subscribedClient.token = 'subscribed-client-token'
        subscribedClient.subscriptions = new Map()

        namespace.onSubscribe(subscribedClient, callbacks, subscribeMessage)
      })

      it('should return UnsubscribeResult with shouldRemove false when the client is not subscribed', async () => {
        const result = await namespace.onUnsubscribe(client, unsubscribeMessage)

        expect(result.shouldRemove).toBe(false)
      })

      it('should return UnsubscribeResult with shouldRemove false', async () => {
        namespace.onSubscribe(client, callbacks, subscribeMessage)

        const result = await namespace.onUnsubscribe(client, unsubscribeMessage)

        expect(result.shouldRemove).toBe(false)
      })

      it('should return UnsubscribeResult with an observable containing the correct unsubbed message', async () => {
        const result = await namespace.onUnsubscribe(subscribedClient, unsubscribeMessage)

        expect(result.res).toEqual(successfulUnsubscribeMessage)
      })

      it('should return UnsubscribeResult with shouldRemove true, when this was the last client', async () => {
        const result = await namespace.onUnsubscribe(subscribedClient, unsubscribeMessage)

        expect(result.shouldRemove).toBe(true)
      })

      it("should delete the path from the client's subscription", async () => {
        expect(subscribedClient.subscriptions.get(routeMatch.path)).toEqual(namespace)

        namespace.onUnsubscribe(subscribedClient, unsubscribeMessage)

        expect(subscribedClient.subscriptions.has(routeMatch.path)).toBe(false)
      })
    })
  })

  describe('onMessage', () => {
    let client: WsClient
    let callbacks: WsClientCallbacks

    beforeEach(() => {
      client = {} as WsClient
      client.token = 'client-token'
      client.subscriptions = new Map()

      callbacks = {
        authorize: jest.fn(),
        transform: jest.fn(it => it),
        handlers: new Map(),
        subscribe: null,
        unsubscribe: null,
      }
    })

    it('should return an EMPTY observable when the client is not subscribed', () => {
      const actual = namespace.onMessage(client, validMessage)

      expect(actual).toBe(EMPTY)
    })

    describe('when subscribed', () => {
      beforeEach(() => {
        callbacks.handlers.set(
          HANDLER_PATH,
          jest.fn(() => null),
        )

        namespace.onSubscribe(client, callbacks, subscribeMessage)
      })

      it('should return EMPTY observable when there is no handler for the subpath', () => {
        const invalidMessage: WsMessage = {
          type: `${routeMatch.path}/invalid`,
          data: {
            invalid: 'message',
          },
        }

        const actual = namespace.onMessage(client, invalidMessage)

        expect(actual).toBe(EMPTY)
      })

      it('should return EMPTY when the handler returns null', () => {
        callbacks.handlers.set(
          HANDLER_PATH,
          jest.fn(() => null),
        )

        const actual = namespace.onMessage(client, validMessage)

        expect(actual).toBe(EMPTY)
      })

      it('should return the an observable with the message returned by the handler', async () => {
        const expected: WsMessage = {
          type: `${routeMatch.path}/response`,
          data: {
            response: 'message',
          },
        }

        callbacks.handlers.set(
          HANDLER_PATH,
          jest.fn(() => of(expected)),
        )

        const actualObs = namespace.onMessage(client, validMessage)
        const actual = await firstValueFrom(actualObs)

        expect(actual).toEqual(expected)
      })

      it('should filter undefined and null messages in the response observable', async () => {
        const responseMessage: WsMessage = {
          type: 'response',
          data: {
            response: 'message',
          },
        }

        const allMessages: WsMessage[] = [null, { ...responseMessage }, undefined]

        callbacks.handlers.set(
          HANDLER_PATH,
          jest.fn(() => of(...allMessages)),
        )

        const result = namespace.onMessage(client, validMessage)
        const resultObs = result.pipe(toArray())

        const actual = await firstValueFrom(resultObs)

        const expected: WsMessage[] = [
          {
            ...responseMessage,
            type: `${routeMatch.path}/${responseMessage.type}`,
          },
        ]

        expect(actual.length).toEqual(expected.length)
        actual.forEach(it => {
          expect(it).not.toBeUndefined()
          expect(it).not.toBeNull()
        })
      })

      it('should pass the valid response message with the correct path to the returned observable', async () => {
        const responseMessage: WsMessage = {
          type: 'response',
          data: {
            response: 'message',
          },
        }

        const allMessages: WsMessage[] = [null, { ...responseMessage }, undefined]

        callbacks.handlers.set(
          HANDLER_PATH,
          jest.fn(() => of(...allMessages)),
        )

        const result = namespace.onMessage(client, validMessage)
        const resultObs = result.pipe(toArray())

        const actual = await firstValueFrom(resultObs)

        const expected: WsMessage[] = [
          {
            ...responseMessage,
            type: `${routeMatch.path}/${responseMessage.type}`,
          },
        ]

        expect(actual.length).toEqual(expected.length)
        expected.forEach(it => expect(actual).toContainEqual(it))
      })
    })
  })

  describe('sending to clients', () => {
    let oneClient: WsClient
    let otherClient: WsClient

    let oneSendMessage: jest.Mock
    let otherSendMessage: jest.Mock

    let message: WsMessage
    let sentMessage: WsMessage

    beforeEach(() => {
      oneClient = {} as WsClient
      oneClient.token = 'one-client'
      oneClient.subscriptions = new Map()
      oneSendMessage = jest.fn()
      oneClient.sendWsMessage = oneSendMessage

      otherClient = {} as WsClient
      otherClient.token = 'other-client'
      otherClient.subscriptions = new Map()
      otherSendMessage = jest.fn()
      otherClient.sendWsMessage = otherSendMessage

      message = {
        type: 'subpath',
        data: {
          test: 'message',
        },
      }

      sentMessage = {
        ...message,
        type: `${PATH}/${message.type}`,
      }

      const oneCallbacks: WsClientCallbacks = {
        authorize: jest.fn(),
        handlers: new Map(),
        subscribe: null,
        transform: jest.fn(it => it),
        unsubscribe: null,
      }

      const otherCallbacks: WsClientCallbacks = {
        authorize: jest.fn(),
        handlers: new Map(),
        subscribe: null,
        transform: jest.fn(it => it),
        unsubscribe: null,
      }

      namespace.onSubscribe(oneClient, oneCallbacks, subscribeMessage)
      namespace.onSubscribe(otherClient, otherCallbacks, subscribeMessage)
    })

    describe('sendToAll', () => {
      it("should call each subscribed clients' send method", () => {
        namespace.sendToAll(message)

        expect(oneClient.sendWsMessage).toBeCalled()
        expect(otherClient.sendWsMessage).toBeCalled()
      })

      it('should send the message with the correct path to each client', () => {
        namespace.sendToAll(message)

        expect(oneClient.sendWsMessage).toBeCalledWith(sentMessage)
        expect(otherClient.sendWsMessage).toBeCalledWith(sentMessage)
      })
    })

    describe('sendToAllExcept', () => {
      it("should call all but the specified subscribed clients' send method", () => {
        namespace.sendToAllExcept(otherClient, message)

        expect(oneClient.sendWsMessage).toBeCalled()
        expect(otherClient.sendWsMessage).not.toBeCalled()
      })

      it('should send the message with the correct path to all but the specified client', () => {
        namespace.sendToAllExcept(oneClient, message)

        expect(oneClient.sendWsMessage).not.toBeCalledWith(sentMessage)
        expect(otherClient.sendWsMessage).toBeCalledWith(sentMessage)
      })
    })
  })
})
