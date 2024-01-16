import { Options, getOrCreateMetric } from '@willsoto/nestjs-prometheus'
import { Gauge } from 'prom-client'

const METRIC_RUN_STATE_CHANNELS_COUNT: Options = {
  name: 'pipeline_run_state_channels_count',
  help: 'Number of run state channels. (one per team)',
}

export default class PipelineMetrics {
  public static runStateChannelsCount(): Gauge<string> {
    return getOrCreateMetric('Gauge', METRIC_RUN_STATE_CHANNELS_COUNT) as Gauge<string>
  }
}
