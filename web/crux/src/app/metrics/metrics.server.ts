import { INestApplication, Logger } from '@nestjs/common'
import * as http from 'http'
import { createServer } from 'http'
import * as client from 'prom-client'
import ShutdownService from 'src/services/application.shutdown.service'
import { promisify } from 'util'

const logger = new Logger('Metrics')

const METRICS_API_URL = '/api/metrics'

let metricServer: http.Server<any, any> = null

const shutdownMetricsServer = async () => {
  if (metricServer == null) {
    return
  }

  logger.log('Shutting down metrics server')

  await promisify(metricServer.close)
}

const metricsServerBootstrap = async (app: INestApplication, port: number) => {
  logger.log(`Starting metrics server on port :${port}`)

  const shutdownService = app.get(ShutdownService)

  shutdownService.subscribeToShutdown(shutdownMetricsServer)

  metricServer = createServer(async (req, res) => {
    if (req.url !== METRICS_API_URL) {
      res.writeHead(404)
      res.end()
      return
    }

    const metrics = await client.register.metrics()

    res.setHeader('Content-Type', client.register.contentType)
    res.writeHead(200)
    res.end(metrics)
  }).listen(port)
}

export default metricsServerBootstrap
