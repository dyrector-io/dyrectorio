import { getOrCreateMetric, Options } from '@willsoto/nestjs-prometheus'
import { Counter, Gauge } from 'prom-client'

const METRIC_CONNETIONS: Options = {
  name: 'ws_connected_clients',
  help: 'Number of connected WebSocket clients.',
}

const METRIC_ROUTE_NAMESPACES = {
  name: 'ws_route_namespaces',
  help: 'Number of namespaces by route.',
  labelNames: ['path'],
}

const METRIC_MESSAGE_TYPE_RECEIVE = {
  name: 'ws_message_type_receive',
  help: 'Number of messages received by type.',
  labelNames: ['type'],
}

const METRIC_MESSAGE_TYPE_SEND = {
  name: 'ws_message_type_send',
  help: 'Number of messages sent by type.',
  labelNames: ['type'],
}

export default class WsMetrics {
  public static connections(): Gauge<string> {
    return getOrCreateMetric('Gauge', METRIC_CONNETIONS) as Gauge<string>
  }

  public static routeNamespaces(path: string): Gauge<string> {
    return getOrCreateMetric('Gauge', METRIC_ROUTE_NAMESPACES).labels(path) as Gauge<string>
  }

  public static messageTypeReceive(type: string): Counter<string> {
    return getOrCreateMetric('Counter', METRIC_MESSAGE_TYPE_RECEIVE).labels(type) as Counter<string>
  }

  public static messageTypeSend(type: string): Counter<string> {
    return getOrCreateMetric('Counter', METRIC_MESSAGE_TYPE_SEND).labels(type) as Counter<string>
  }
}
