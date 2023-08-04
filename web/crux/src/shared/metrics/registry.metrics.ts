import { getOrCreateMetric, Options } from '@willsoto/nestjs-prometheus'
import { Counter, Gauge } from 'prom-client'

const METRIC_COUNT_BY_TYPE: Options = {
  name: 'registry_type_count',
  help: 'Number of registries by type.',
  labelNames: ['type'],
}

const METRIC_HUB_CACHE: Options = {
  name: 'registry_hub_cache',
  help: 'Number of Docker hub API cache operations.',
  labelNames: ['type'],
}

const METRIC_API_REQUEST: Options = {
  name: 'registry_api_request',
  help: 'Number of registry API requests by type.',
  labelNames: ['type', 'request'],
}

export default class RegistryMetrics {
  public static count(type: string): Gauge<string> {
    return getOrCreateMetric('Gauge', METRIC_COUNT_BY_TYPE).labels(type) as Gauge<string>
  }

  public static hubCacheHit(): Counter<string> {
    return getOrCreateMetric('Counter', METRIC_HUB_CACHE).labels('hit') as Counter<string>
  }

  public static hubCacheMiss(): Counter<string> {
    return getOrCreateMetric('Counter', METRIC_HUB_CACHE).labels('miss') as Counter<string>
  }

  public static apiRequest(apiType: string, request: string): Counter<string> {
    return getOrCreateMetric('Counter', METRIC_API_REQUEST).labels(apiType, request) as Counter<string>
  }
}
