import { getOrCreateMetric, Options } from '@willsoto/nestjs-prometheus'
import { Gauge } from 'prom-client'

const METRIC_CONNECTED_AGENTS: Options = {
  name: 'agent_online_count',
  help: 'Number of connected agents.',
}

export default class AgentMetrics {
  public static connectedCount(): Gauge<string> {
    return getOrCreateMetric('Gauge', METRIC_CONNECTED_AGENTS) as Gauge<string>
  }
}
