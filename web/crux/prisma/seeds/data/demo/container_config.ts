import { ContainerConfig } from '@prisma/client'
import { ImageName } from './images'
import { v4 as uuidv4 } from 'uuid'

export const buildContainerConfig = (imageId: string, name: ImageName) => {
  const imageConfig = mapConfigToImage(name)
  return {
    name: name,
    capabilities: [],
    config: imageConfig.config,
    environment: imageConfig.environment,
    imageId: imageId,
  } as Omit<ContainerConfig, 'id'>
}

type Environment = {
  id: string
  key: string
  value: string
}

const mapConfigToImage = (name: ImageName) => {
  const config =
    name == ImageName.Adservice
      ? {
          environment: [
            { key: 'PORT', value: '9555' },
            { key: 'DISABLE_STATS', value: '1' },
            { key: 'DISABLE_TRACING', value: '1' },
          ] as Environment[],
          config: { ports: [{ external: 9555, internal: 9555 }] },
        }
      : name == ImageName.Cartservice
      ? {
          environment: [{ key: 'REDIS_ADDR', value: '172.17.0.1:6379' }] as Environment[],
          config: { ports: [{ external: 7070, internal: 7070 }] },
        }
      : name == ImageName.Checkoutservice
      ? {
          environment: [
            { key: 'PORT', value: '5050' },
            { key: 'PRODUCT_CATALOG_SERVICE_ADDR', value: '172.17.0.1:3550' },
            { key: 'SHIPPING_SERVICE_ADDR', value: '172.17.0.1:50054' },
            { key: 'PAYMENT_SERVICE_ADDR', value: '172.17.0.1:50051' },
            { key: 'EMAIL_SERVICE_ADDR', value: '172.17.0.1:50052' },
            { key: 'CURRENCY_SERVICE_ADDR', value: '172.17.0.1:7000' },
            { key: 'CART_SERVICE_ADDR', value: '172.17.0.1:7070' },
            { key: 'DISABLE_STATS', value: '1' },
            { key: 'DISABLE_TRACING', value: '1' },
            { key: 'DISABLE_PROFILER', value: '1' },
          ] as Environment[],
          config: { ports: [{ external: 5050, internal: 5050 }] },
        }
      : name == ImageName.Currencyservice
      ? {
          environment: [
            { key: 'PORT', value: '7000' },
            { key: 'DISABLE_TRACING', value: '1' },
            { key: 'DISABLE_PROFILER', value: '1' },
            { key: 'DISABLE_DEBUGGER', value: '1' },
          ] as Environment[],
          config: { ports: [{ external: 7000, internal: 7000 }] },
        }
      : name == ImageName.Emailservice
      ? {
          environment: [
            { key: 'PORT', value: '50052' },
            { key: 'DISABLE_TRACING', value: '1' },
            { key: 'DISABLE_PROFILER', value: '1' },
          ] as Environment[],
          config: { ports: [{ external: 50052, internal: 50052 }] },
        }
      : name == ImageName.Frontend
      ? {
          environment: [
            { key: 'PORT', value: '8080' },
            { key: 'PRODUCT_CATALOG_SERVICE_ADDR', value: '172.17.0.1:3550' },
            { key: 'CURRENCY_SERVICE_ADDR', value: '172.17.0.1:7000' },
            { key: 'CART_SERVICE_ADDR', value: '172.17.0.1:7070' },
            { key: 'RECOMMENDATION_SERVICE_ADDR', value: '172.17.0.1:50053' },
            { key: 'SHIPPING_SERVICE_ADDR', value: '172.17.0.1:50054' },
            { key: 'CHECKOUT_SERVICE_ADDR', value: '172.17.0.1:5050' },
            { key: 'AD_SERVICE_ADDR', value: '172.17.0.1:9555' },
            { key: 'DISABLE_TRACING', value: '1' },
            { key: 'DISABLE_PROFILER', value: '1' },
          ] as Environment[],
          config: { ports: [{ external: 8080, internal: 8080 }] },
        }
      : name == ImageName.Loadgenerator
      ? {
          environment: [
            { key: 'FRONTEND_ADDR', value: '172.17.0.1:8080' },
            { key: 'USERS', value: '10' },
          ] as Environment[],
          config: {},
        }
      : name == ImageName.Paymentservice
      ? {
          environment: [
            { key: 'PORT', value: '50051' },
            { key: 'DISABLE_TRACING', value: '1' },
            { key: 'DISABLE_PROFILER', value: '1' },
            { key: 'DISABLE_DEBUGGER', value: '1' },
          ] as Environment[],
          config: { ports: [{ external: 50051, internal: 50051 }] },
        }
      : name == ImageName.Productcatalogservice
      ? {
          environment: [
            { key: 'PORT', value: '3550' },
            { key: 'DISABLE_STATS', value: '1' },
            { key: 'DISABLE_TRACING', value: '1' },
            { key: 'DISABLE_PROFILER', value: '1' },
          ] as Environment[],
          config: { ports: [{ external: 3550, internal: 3550 }] },
        }
      : name == ImageName.Recommendationservice
      ? {
          environment: [
            { key: 'PORT', value: '50053' },
            { key: 'PRODUCT_CATALOG_SERVICE_ADDR', value: '172.17.0.1:3550' },
            { key: 'DISABLE_TRACING', value: '1' },
            { key: 'DISABLE_PROFILER', value: '1' },
            { key: 'DISABLE_DEBUGGER', value: '1' },
          ] as Environment[],
          config: { ports: [{ external: 50053, internal: 50053 }] },
        }
      : name == ImageName.Shippingservice
      ? {
          environment: [
            { key: 'PORT', value: '50054' },
            { key: 'DISABLE_STATS', value: '1' },
            { key: 'DISABLE_TRACING', value: '1' },
            { key: 'DISABLE_PROFILER', value: '1' },
          ] as Environment[],
          config: { ports: [{ external: 50054, internal: 50054 }] },
        }
      : name == ImageName.Redis
      ? {
          environment: [] as Environment[],
          config: { ports: [{ external: 6379, internal: 6379 }] },
        }
      : { environment: [] as Environment[], config: {} }

  // seed ids
  config.environment.map(x => (x.id = uuidv4()))
  return config
}
