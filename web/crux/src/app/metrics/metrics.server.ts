import { INestApplication, Logger } from '@nestjs/common'
import * as http from 'http'
import { createServer } from 'http'
import * as client from 'prom-client'
import ShutdownService from 'src/services/application.shutdown.service'
import { promisify } from 'util'

let metricServer: http.Server<any, any> = null

const logger = new Logger('Metrics')

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

  // TODO(@robot9706): Use express instead?
  metricServer = createServer(async (req, res) => {
    if (req.url !== '/api/metrics') {
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
